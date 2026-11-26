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

  /* opt: { size(반 포인트), bold, color, align, line(240=한 줄), after(트윙) } */
  function paragraph(text, opt) {
    opt = opt || {};
    var size = opt.size || 36;         // 18pt
    var line = opt.line || 340;
    var after = opt.after === undefined ? 120 : opt.after;
    var rPr = runProps({ size: size, bold: opt.bold, color: opt.color });
    var pPr = '<w:pPr>' +
      (opt.keepNext ? '<w:keepNext/>' : '') +
      '<w:spacing w:before="0" w:after="' + after + '" w:line="' + line + '" w:lineRule="auto"/>' +
      (opt.align ? '<w:jc w:val="' + opt.align + '"/>' : '') +
      rPr +
      '</w:pPr>';
    var body = String(text === null || text === undefined ? '' : text);
    var runs = body ? '<w:r>' + rPr + '<w:t xml:space="preserve">' + xmlEsc(body) + '</w:t></w:r>' : '';
    return '<w:p>' + pPr + runs + '</w:p>';
  }

  /* ---------- 문서 ---------- */
  /* opts: { title, meta (문자열 또는 배열), body, subject } */
  function documentXml(opts) {
    var metaParts = opts.meta;
    if (Array.isArray(metaParts)) metaParts = metaParts.filter(Boolean).join(' · ');
    metaParts = String(metaParts || '');

    var paras = [];
    paras.push(paragraph(opts.title || '설교 원고', { size: 52, bold: true, align: 'center', after: 160, line: 300 }));  // 26pt
    if (metaParts) paras.push(paragraph(metaParts, { size: 24, color: '5A5A5A', align: 'center', after: 400, line: 300 })); // 12pt

    var lines = String(opts.body || '').replace(/\r\n?/g, '\n').split('\n');
    lines.forEach(function (line) {
      var t = line.replace(/[ \t]+$/, '');
      paras.push(paragraph(t, { size: 36, line: 340, after: t ? 140 : 60 }));  // 18pt
    });

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

  function contentTypesXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
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

  function documentRelsXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
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
    var files = [
      { name: '[Content_Types].xml', data: utf8(contentTypesXml()) },
      { name: '_rels/.rels', data: utf8(rootRelsXml()) },
      { name: 'word/document.xml', data: utf8(documentXml(opts)) },
      { name: 'word/styles.xml', data: utf8(stylesXml()) },
      { name: 'word/_rels/document.xml.rels', data: utf8(documentRelsXml()) },
      { name: 'docProps/core.xml', data: utf8(coreXml(opts, when)) },
      { name: 'docProps/app.xml', data: utf8(appXml()) }
    ];
    return zipStore(files, when);
  }

  var api = { crc32: crc32, zipStore: zipStore, makeDocx: makeDocx, paragraph: paragraph, version: '1.0' };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DocxLite = api;
})(typeof window !== 'undefined' ? window : globalThis);
