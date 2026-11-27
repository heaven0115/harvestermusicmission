/* =========================================================
   docx-lite — 외부 라이브러리 없는 워드(.docx) 생성기
   - 압축 없는 Store 방식 ZIP(CRC32 포함)을 직접 만듭니다.
   - 본문 18pt, 맑은 고딕(한글) 기준의 강단 원고용 문서.
   - 브라우저에서는 window.DocxLite, Node에서는 module.exports.
   ========================================================= */
(function (root) {
  'use strict';

  /* ---------- CRC32 ---------- */
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function utf8(str) {
    return new TextEncoder().encode(str);
  }

  function concat(arrays) {
    var total = 0, i;
    for (i = 0; i < arrays.length; i++) total += arrays[i].length;
    var out = new Uint8Array(total), off = 0;
    for (i = 0; i < arrays.length; i++) { out.set(arrays[i], off); off += arrays[i].length; }
    return out;
  }

  function dosDateTime(d) {
    d = d || new Date();
    var time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | (Math.floor(d.getSeconds() / 2) & 31);
    var date = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
    return { time: time & 0xFFFF, date: date & 0xFFFF };
  }

  /* files: [{ name: 'word/document.xml', data: Uint8Array }] */
  function zipStore(files, when) {
    var stamp = dosDateTime(when);
    var chunks = [], central = [], offset = 0;

    files.forEach(function (f) {
      var name = utf8(f.name);
      var data = f.data instanceof Uint8Array ? f.data : utf8(String(f.data));
      var crc = crc32(data);

      var local = new Uint8Array(30 + name.length);
      var lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);   // local file header
      lv.setUint16(4, 20, true);           // version needed
      lv.setUint16(6, 0x0800, true);       // UTF-8 파일명
      lv.setUint16(8, 0, true);            // 방법: store
      lv.setUint16(10, stamp.time, true);
      lv.setUint16(12, stamp.date, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true); // 압축 크기
      lv.setUint32(22, data.length, true); // 원본 크기
      lv.setUint16(26, name.length, true);
      lv.setUint16(28, 0, true);           // extra 길이
      local.set(name, 30);

      chunks.push(local, data);

      var cd = new Uint8Array(46 + name.length);
      var cv = new DataView(cd.buffer);
      cv.setUint32(0, 0x02014b50, true);   // central directory header
      cv.setUint16(4, 20, true);           // version made by
      cv.setUint16(6, 20, true);           // version needed
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, stamp.time, true);
      cv.setUint16(14, stamp.date, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true);
      cv.setUint16(30, 0, true);           // extra
      cv.setUint16(32, 0, true);           // comment
      cv.setUint16(34, 0, true);           // disk
      cv.setUint16(36, 0, true);           // internal attrs
      cv.setUint32(38, 0, true);           // external attrs
      cv.setUint32(42, offset, true);      // local header 위치
      cd.set(name, 46);
      central.push(cd);

      offset += local.length + data.length;
    });

    var cdBytes = concat(central);
    var end = new Uint8Array(22);
    var ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdBytes.length, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    return concat([concat(chunks), cdBytes, end]);
  }

  /* ---------- XML ---------- */
  function xmlEsc(v) {
    return String(v === null || v === undefined ? '' : v)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  var FONT = 'Malgun Gothic';

  function runProps(opt) {
    return '<w:rPr>' +
      '<w:rFonts w:ascii="' + FONT + '" w:hAnsi="' + FONT + '" w:eastAsia="' + FONT + '" w:cs="' + FONT + '"/>' +
      (opt.bold ? '<w:b/><w:bCs/>' : '') +
      (opt.color ? '<w:color w:val="' + opt.color + '"/>' : '') +
      '<w:sz w:val="' + opt.size + '"/><w:szCs w:val="' + opt.size + '"/>' +
      '</w:rPr>';
  }

  /* ---------- 그림(인라인) ----------
     r: { image: 'img1', cx, cy } — cx·cy는 EMU(1pt = 12700).
     이미지 파일과 관계 id는 makeDocx(opts.images)가 정한다. */
  function imageXml(r, m) {
    var cx = Math.round(r.cx || m.cx || 190500);
    var cy = Math.round(r.cy || m.cy || 190500);
    var num = m.num || 1;
    return '<w:r><w:drawing>' +
      '<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"' +
      ' distT="0" distB="0" distL="0" distR="0">' +
      '<wp:extent cx="' + cx + '" cy="' + cy + '"/>' +
      '<wp:effectExtent l="0" t="0" r="0" b="0"/>' +
      '<wp:docPr id="' + num + '" name="Picture ' + num + '"/>' +
      '<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
      '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">' +
      '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:nvPicPr><pic:cNvPr id="' + num + '" name="image' + num + '.' + m.ext + '"/><pic:cNvPicPr/></pic:nvPicPr>' +
      '<pic:blipFill><a:blip r:embed="' + m.rId + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm>' +
      '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
      '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
  }

  /* opt: { size(반 포인트), bold, color, align, line(240=한 줄), before, after(트윙),
            keepNext, keepLines, pageBreakBefore, indent(트윙), shade('FAF6EC'),
            borderBottom, borderTop, borderColor, runs:[{text,bold,color,size}] }
     pPr 자식은 워드 스키마 순서(keepNext → pageBreakBefore → pBdr → shd → spacing → ind → jc → rPr)를 지킨다.
     imgMap 은 makeDocx 안에서만 쓰는 그림 관계표다. */
  function paragraph(text, opt, imgMap) {
    opt = opt || {};
    var size = opt.size || 36;         // 18pt
    var line = opt.line || 340;
    var before = opt.before === undefined ? 0 : opt.before;
    var after = opt.after === undefined ? 120 : opt.after;
    var rPr = runProps({ size: size, bold: opt.bold, color: opt.color });
    var pPr = '<w:pPr>' +
      (opt.keepNext ? '<w:keepNext/>' : '') +
      (opt.keepLines ? '<w:keepLines/>' : '') +
      (opt.pageBreakBefore ? '<w:pageBreakBefore/>' : '') +
      ((opt.borderBottom || opt.borderTop)
        ? '<w:pBdr>' +
          (opt.borderTop ? '<w:top w:val="single" w:sz="6" w:space="4" w:color="' + (opt.borderColor || 'C9D6CE') + '"/>' : '') +
          (opt.borderBottom ? '<w:bottom w:val="single" w:sz="6" w:space="4" w:color="' + (opt.borderColor || 'C9D6CE') + '"/>' : '') +
          '</w:pBdr>'
        : '') +
      (opt.shade ? '<w:shd w:val="clear" w:color="auto" w:fill="' + opt.shade + '"/>' : '') +
      '<w:spacing w:before="' + before + '" w:after="' + after + '" w:line="' + line + '" w:lineRule="auto"/>' +
      (opt.indent ? '<w:ind w:left="' + opt.indent + '"/>' : '') +
      (opt.align ? '<w:jc w:val="' + opt.align + '"/>' : '') +
      rPr +
      '</w:pPr>';
    var parts = (opt.runs && opt.runs.length) ? opt.runs : [{ text: text }];
    var runs = parts.map(function (r) {
      r = r || {};
      if (r.image) {
        var m = imgMap && imgMap[r.image];
        return m ? imageXml(r, m) : '';
      }
      var t = String(r.text === null || r.text === undefined ? '' : r.text);
      if (!t) return '';
      var useOwn = (r.bold !== undefined) || r.color || r.size;
      var rr = useOwn ? runProps({
        size: r.size || size,
        bold: r.bold === undefined ? opt.bold : r.bold,
        color: r.color || opt.color
      }) : rPr;
      return '<w:r>' + rr + '<w:t xml:space="preserve">' + xmlEsc(t) + '</w:t></w:r>';
    }).join('');
    return '<w:p>' + pPr + runs + '</w:p>';
  }

  /* ---------- 표 ----------
     spec: { rows: [[칸, …], …], header: true, widths: [트윙…], size(반 포인트) }
     칸은 문자열이거나 { text, bold, shade }. 본문 폭(A4, 여백 1418)은 9070 트윙. */
  var TABLE_W = 9070;

  function cellText(c) {
    if (c === null || c === undefined) return '';
    if (typeof c === 'object') return String(c.text === null || c.text === undefined ? '' : c.text);
    return String(c);
  }

  function columnWidths(rows, ncols, total) {
    var longest = [];
    for (var c = 0; c < ncols; c++) {
      var m = 4;
      for (var r = 0; r < rows.length; r++) {
        var t = cellText(rows[r] && rows[r][c]);
        if (t.length > m) m = t.length;
      }
      longest.push(Math.min(m, 60));
    }
    var sum = 0;
    longest.forEach(function (v) { sum += v; });
    if (!sum) sum = 1;
    var out = longest.map(function (v) { return Math.max(900, Math.round(total * v / sum)); });
    var used = 0;
    out.forEach(function (v) { used += v; });
    out[out.length - 1] = Math.max(900, out[out.length - 1] + (total - used));
    return out;
  }

  function tableXml(spec, imgMap) {
    spec = spec || {};
    var rows = (spec.rows || []).filter(function (r) { return r && r.length; });
    if (!rows.length) return '';
    var ncols = 0;
    rows.forEach(function (r) { if (r.length > ncols) ncols = r.length; });
    var size = spec.size || 26;
    var widths = (spec.widths && spec.widths.length === ncols) ? spec.widths.slice() : columnWidths(rows, ncols, TABLE_W);
    var borders = '<w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function (side) {
      return '<w:' + side + ' w:val="single" w:sz="4" w:space="0" w:color="C9D6CE"/>';
    }).join('') + '</w:tblBorders>';
    var grid = widths.map(function (w) { return '<w:gridCol w:w="' + w + '"/>'; }).join('');
    var body = rows.map(function (row, ri) {
      var head = !!spec.header && ri === 0;
      var cells = '';
      for (var ci = 0; ci < ncols; ci++) {
        var cell = row[ci];
        var shade = (cell && typeof cell === 'object' && cell.shade) ? cell.shade : (head ? 'F4F8F5' : '');
        cells += '<w:tc><w:tcPr>' +
          '<w:tcW w:w="' + widths[ci] + '" w:type="dxa"/>' +
          (shade ? '<w:shd w:val="clear" w:color="auto" w:fill="' + shade + '"/>' : '') +
          '<w:vAlign w:val="top"/></w:tcPr>' +
          paragraph(cellText(cell), {
            size: size,
            bold: head || !!(cell && typeof cell === 'object' && cell.bold),
            line: 260,
            after: 20
          }, imgMap) +
          '</w:tc>';
      }
      return '<w:tr><w:trPr><w:cantSplit/>' + (head ? '<w:tblHeader/>' : '') + '</w:trPr>' + cells + '</w:tr>';
    }).join('');
    return '<w:tbl><w:tblPr>' +
      '<w:tblW w:w="' + TABLE_W + '" w:type="dxa"/>' +
      '<w:jc w:val="center"/>' + borders +
      '<w:tblLayout w:type="fixed"/>' +
      '<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/>' +
      '<w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar>' +
      '<w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>' +
      '</w:tblPr><w:tblGrid>' + grid + '</w:tblGrid>' + body + '</w:tbl>';
  }

  /* 표 뒤·문서 끝에 빈 문단을 둔다(워드는 표만으로 끝나는 본문과 이웃한 표를 좋아하지 않는다). */
  function gapParagraph() {
    return '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="160" w:lineRule="auto"/></w:pPr></w:p>';
  }

  /* ---------- 문서 ---------- */
  /* opts: { title, meta (문자열 또는 배열), body, subject,
             blocks: [{ text, runs, size, bold, color, align, line, before, after,
                        keepNext, keepLines, pageBreakBefore, indent, shade,
                        borderBottom, borderColor }] }
     blocks 를 주면 body/title 문단을 따로 넣지 않고 blocks 만으로 본문을 만든다
     (제목·부제를 blocks 안에 원하는 서식으로 직접 넣기 때문). */
  function documentXml(opts) {
    var metaParts = opts.meta;
    if (Array.isArray(metaParts)) metaParts = metaParts.filter(Boolean).join(' · ');
    metaParts = String(metaParts || '');

    /* 그림 관계표: opts.images 순서대로 rIdImg1… 을 붙인다. */
    var imgMap = {};
    (opts.images || []).forEach(function (im, i) {
      imgMap[im.id] = {
        rId: 'rIdImg' + (i + 1),
        num: i + 1,
        ext: im.ext || 'png',
        cx: im.cx || 0,
        cy: im.cy || 0
      };
    });

    var paras = [];
    if (opts.blocks && opts.blocks.length) {
      opts.blocks.forEach(function (b) {
        if (!b) return;
        if (b.table) {
          var t = tableXml(b.table, imgMap);
          if (t) { paras.push(t); paras.push(gapParagraph()); }
          return;
        }
        paras.push(paragraph(b.text, b, imgMap));
      });
      if (!paras.length) paras.push(paragraph('', { size: 36, after: 0 }));
    } else {
      paras.push(paragraph(opts.title || '설교 원고', { size: 52, bold: true, align: 'center', after: 160, line: 300 }));  // 26pt
      if (metaParts) paras.push(paragraph(metaParts, { size: 24, color: '5A5A5A', align: 'center', after: 400, line: 300 })); // 12pt

      var lines = String(opts.body || '').replace(/\r\n?/g, '\n').split('\n');
      lines.forEach(function (line) {
        var t = line.replace(/[ \t]+$/, '');
        paras.push(paragraph(t, { size: 36, line: 340, after: t ? 140 : 60 }));  // 18pt
      });
    }

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<w:body>' + paras.join('') +
      '<w:sectPr>' +
      '<w:pgSz w:w="11906" w:h="16838"/>' +   // A4
      '<w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="708" w:footer="708" w:gutter="0"/>' +
      '</w:sectPr>' +
      '</w:body></w:document>';
  }

  function stylesXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:docDefaults><w:rPrDefault><w:rPr>' +
      '<w:rFonts w:ascii="' + FONT + '" w:hAnsi="' + FONT + '" w:eastAsia="' + FONT + '" w:cs="' + FONT + '"/>' +
      '<w:sz w:val="36"/><w:szCs w:val="36"/>' +
      '</w:rPr></w:rPrDefault>' +
      '<w:pPrDefault><w:pPr><w:spacing w:line="340" w:lineRule="auto"/></w:pPr></w:pPrDefault>' +
      '</w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
      '</w:styles>';
  }

  function contentTypesXml(images) {
    var exts = {};
    (images || []).forEach(function (im) {
      var e = String(im.ext || 'png').toLowerCase();
      if (e === 'jpg') e = 'jpeg';
      exts[e] = 1;
    });
    var defs = Object.keys(exts).map(function (e) {
      return '<Default Extension="' + e + '" ContentType="image/' + e + '"/>';
    }).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      defs +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
      '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
      '</Types>';
  }

  function rootRelsXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
      '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
      '</Relationships>';
  }

  function documentRelsXml(images) {
    var rels = (images || []).map(function (im, i) {
      return '<Relationship Id="rIdImg' + (i + 1) + '"' +
        ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"' +
        ' Target="media/image' + (i + 1) + '.' + (im.ext || 'png') + '"/>';
    }).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      rels +
      '</Relationships>';
  }

  function coreXml(opts, when) {
    var iso = new Date(when || Date.now()).toISOString().replace(/\.\d{3}Z$/, 'Z');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
      'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' +
      'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<dc:title>' + xmlEsc(opts.title || '설교 원고') + '</dc:title>' +
      '<dc:subject>' + xmlEsc(opts.subject || '설교 원고') + '</dc:subject>' +
      '<dc:creator>' + xmlEsc(opts.creator || '므두셀라 티칭') + '</dc:creator>' +
      '<cp:lastModifiedBy>' + xmlEsc(opts.creator || '므두셀라 티칭') + '</cp:lastModifiedBy>' +
      '<dcterms:created xsi:type="dcterms:W3CDTF">' + iso + '</dcterms:created>' +
      '<dcterms:modified xsi:type="dcterms:W3CDTF">' + iso + '</dcterms:modified>' +
      '</cp:coreProperties>';
  }

  function appXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" ' +
      'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
      '<Application>Methuselah Teaching</Application>' +
      '</Properties>';
  }

  /* 반환: Uint8Array (유효한 .docx) */
  function makeDocx(opts) {
    opts = opts || {};
    var when = new Date();
    /* data 는 Uint8Array(또는 ArrayBuffer). 그림이 없으면 예전과 똑같은 파일이 된다. */
    var images = (opts.images || []).filter(function (im) { return im && im.data && im.data.length; });
    var docOpts = {};
    for (var k in opts) if (Object.prototype.hasOwnProperty.call(opts, k)) docOpts[k] = opts[k];
    docOpts.images = images;
    var files = [
      { name: '[Content_Types].xml', data: utf8(contentTypesXml(images)) },
      { name: '_rels/.rels', data: utf8(rootRelsXml()) },
      { name: 'word/document.xml', data: utf8(documentXml(docOpts)) },
      { name: 'word/styles.xml', data: utf8(stylesXml()) },
      { name: 'word/_rels/document.xml.rels', data: utf8(documentRelsXml(images)) },
      { name: 'docProps/core.xml', data: utf8(coreXml(opts, when)) },
      { name: 'docProps/app.xml', data: utf8(appXml()) }
    ];
    images.forEach(function (im, i) {
      files.push({
        name: 'word/media/image' + (i + 1) + '.' + (im.ext || 'png'),
        data: im.data instanceof Uint8Array ? im.data : new Uint8Array(im.data)
      });
    });
    return zipStore(files, when);
  }

  var api = { crc32: crc32, zipStore: zipStore, makeDocx: makeDocx, paragraph: paragraph, table: tableXml, version: '1.1' };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DocxLite = api;
})(typeof window !== 'undefined' ? window : globalThis);
