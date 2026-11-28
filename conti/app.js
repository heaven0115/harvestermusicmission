/* 찬양콘티 악보 편집기
 * 앞면(1·2번) · 뒷면(3번) 가로 US Letter 악보 편집/출력 앱
 * 세리토스 장로교회
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'harvester-conti-v1';
  var SONG_COUNT = 3;
  var PAGE = { w: 11, h: 8.5, margin: 0.35, gutter: 0.32 };
  var DPI = 240;
  var MARKER_RATIO = 0.042; // 악보 폭 대비 표시 글자 크기
  var FONT = '"Helvetica Neue", Helvetica, Arial, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
  var COLORS = [
    { v: '#D91E18', n: '빨강' },
    { v: '#1655D9', n: '파랑' },
    { v: '#111111', n: '검정' }
  ];
  var MARKER_PRESETS = ['A', 'B', 'C', 'D', 'Intro', 'Bridge', 'Tag', 'Tag2', 'Key up', 'Fine', '×2'];
  var FORM_CHIPS = ['Intro', '1A', '1B', '2A', '2B', 'A', 'B', 'C', 'Bridge', 'Tag', 'Tag2', 'Key up'];

  /* ---------- 도우미 ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function uid() { return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function pt(n) { return (n / 72) * DPI; }
  function px(inch) { return inch * DPI; }
  function round1(n) { return Math.round(n * 10) / 10; }

  /* ---------- 상태 ---------- */
  function emptySong() {
    return { title: '', form: '', image: '', imgW: 0, imgH: 0, fileName: '', markers: [] };
  }
  function defaultState() {
    return {
      v: 1,
      songs: [emptySong(), emptySong(), emptySong()],
      settings: { page2: 'left', color: '#D91E18', size: 1, text: 'A' }
    };
  }

  var state = defaultState();
  var active = 0;
  var zoom = 1;
  var selectedId = null;
  var undoStack = [];
  var redoStack = [];
  var saveTimer = 0;
  var pdfSession = null;
  var pdfLibPromise = null;
  var jspdfPromise = null;
  var toastTimer = 0;
  var previewToken = 0;
  var previewTimer = 0;
  var imgCache = {};

  function normalizeSong(src) {
    src = src || {};
    var markers = Array.isArray(src.markers) ? src.markers : [];
    return {
      title: String(src.title || ''),
      form: String(src.form || ''),
      image: typeof src.image === 'string' ? src.image : '',
      imgW: +src.imgW || 0,
      imgH: +src.imgH || 0,
      fileName: String(src.fileName || ''),
      markers: markers.filter(function (m) { return m && m.text; }).map(function (m) {
        return {
          id: m.id ? String(m.id) : uid(),
          text: String(m.text),
          x: +m.x || 0,
          y: +m.y || 0,
          color: m.color || '#D91E18',
          size: clamp(+m.size || 1, 0.5, 3)
        };
      })
    };
  }

  function applyState(data) {
    var next = defaultState();
    if (data && Array.isArray(data.songs)) {
      for (var i = 0; i < SONG_COUNT; i++) next.songs[i] = normalizeSong(data.songs[i]);
    }
    var st = data && data.settings;
    if (st) {
      if (st.page2 === 'full' || st.page2 === 'left') next.settings.page2 = st.page2;
      if (st.color) next.settings.color = st.color;
      if (+st.size) next.settings.size = clamp(+st.size, 0.6, 2.2);
      if (typeof st.text === 'string') next.settings.text = st.text;
    }
    state = next;
    imgCache = {};
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      applyState(JSON.parse(raw));
    } catch (e) {
      /* 저장된 내용을 읽지 못하면 빈 콘티로 시작한다 */
    }
  }

  function setSaveState(text) {
    var el = $('#saveState');
    if (el) el.textContent = text || '';
  }

  function printVisible() {
    var v = $('#view-print');
    return !!(v && v.classList.contains('active'));
  }

  function save() {
    setSaveState('저장 중…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setSaveState('저장됨');
      } catch (e) {
        setSaveState('');
        toast('이 기기의 저장 공간이 부족합니다. [콘티 관리]에서 JSON 백업을 남겨 주세요.');
      }
    }, 320);
    if (printVisible()) schedulePreview(600);
  }

  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2800);
  }

  function busy(on, text) {
    var el = $('#busy');
    if (!el) return;
    $('#busyText').textContent = text || '처리 중…';
    el.hidden = !on;
  }

  function displayTitle(title, idx) {
    var t = (title || '').trim();
    if (!t) return '';
    if (/^\d+\s*[.)]/.test(t)) return t;
    return (idx + 1) + '. ' + t;
  }

  /* ---------- 곡 탭 ---------- */
  function renderSongTabs() {
    var wrap = $('#songTabs');
    if (!wrap) return;
    wrap.innerHTML = state.songs.map(function (s, i) {
      var label = (s.title || '').trim().replace(/^\d+\s*[.)]\s*/, '');
      if (!label) label = i === 2 ? '3번 · 뒷면' : (i + 1) + '번';
      return '<button type="button" class="song-tab' + (i === active ? ' active' : '') + '" data-song="' + i + '">' +
        '<span class="n">' + (i + 1) + '</span>' +
        '<span class="t">' + esc(label) + '</span>' +
        '<span class="dot' + (s.image ? ' on' : '') + '"></span>' +
        '</button>';
    }).join('');
  }

  /* ---------- 편집 패널 ---------- */
  function colorButtons(activeColor, act) {
    return COLORS.map(function (c) {
      return '<button type="button" class="color-btn' + (String(c.v).toLowerCase() === String(activeColor).toLowerCase() ? ' active' : '') +
        '" data-act="' + act + '" data-color="' + c.v + '" style="background:' + c.v + '" title="' + c.n + '" aria-label="' + c.n + '"></button>';
    }).join('');
  }

  function renderPanel() {
    var panel = $('#songPanel');
    if (!panel) return;
    var song = state.songs[active];
    var settings = state.settings;
    var isCustom = MARKER_PRESETS.indexOf(settings.text) < 0 && settings.text !== '';

    var html = '';

    /* 악보 올리기 */
    html += '<div class="card">';
    html += '<div class="upload-zone' + (song.image ? ' has' : '') + '" data-role="dropzone">';
    html += '<input type="file" class="file-input" accept="application/pdf,image/*" hidden>';
    if (song.image) {
      html += '<div class="upload-info">' +
        '<div class="file-name">' + esc(song.fileName || '악보 이미지') + '</div>' +
        '<div class="row">' +
        '<button type="button" class="btn small" data-act="pick">다른 악보 올리기</button>' +
        '<button type="button" class="btn small ghost" data-act="clear">악보 지우기</button>' +
        '</div></div>';
    } else {
      html += '<div class="upload-empty">' +
        '<div class="icon">📄</div>' +
        '<div class="main">악보 PDF·사진을 올려 주세요</div>' +
        '<div class="sub">여기를 누르거나 파일을 끌어다 놓으세요 (PDF · JPG · PNG)</div>' +
        '</div>';
    }
    html += '</div>';

    if (pdfSession && pdfSession.song === active && pdfSession.pages > 1) {
      html += '<div class="pdfbar">📑 PDF ' + pdfSession.pages + '페이지 중 ' +
        '<select class="pdf-page-select">' +
        Array.apply(null, Array(pdfSession.pages)).map(function (_, i) {
          return '<option value="' + (i + 1) + '"' + ((i + 1) === pdfSession.current ? ' selected' : '') + '>' + (i + 1) + '페이지</option>';
        }).join('') +
        '</select> 를 악보로 사용</div>';
    }

    html += '<label class="field"><span>곡 제목</span>' +
      '<input class="title-input" type="text" value="' + esc(song.title) + '" placeholder="예: 내 마음을 가득 채운" autocomplete="off"></label>';
    html += '<label class="field"><span>송폼 (콘티 진행)</span>' +
      '<input class="form-input" type="text" value="' + esc(song.form) + '" placeholder="예: Intro - 1A - 1A - B - 2A - 2A - B - CC - B - B - Tag2" autocomplete="off"></label>';
    html += '<div class="chips form-chips">' +
      FORM_CHIPS.map(function (t) {
        return '<button type="button" class="chip" data-act="form-token" data-token="' + esc(t) + '">' + esc(t) + '</button>';
      }).join('') +
      '<button type="button" class="chip dash" data-act="form-token" data-token="-">−</button>' +
      '<button type="button" class="chip dash" data-act="form-back">지우기</button>' +
      '</div>';
    html += '</div>';

    /* 표시 팔레트 */
    html += '<div class="card">';
    html += '<div class="card-title">악보에 붙일 표시 글자</div>';
    html += '<div class="chips marker-chips">' +
      MARKER_PRESETS.map(function (t) {
        return '<button type="button" class="chip' + (settings.text === t ? ' on' : '') + '" data-act="marker" data-text="' + esc(t) + '">' + esc(t) + '</button>';
      }).join('') +
      '</div>';
    html += '<input class="marker-text-input" type="text" maxlength="14" value="' + esc(isCustom ? settings.text : '') +
      '" placeholder="직접 입력 (예: 3A, Chorus, ×2)" autocomplete="off">';
    html += '<div class="palette-row">' +
      '<div class="colors">' + colorButtons(settings.color, 'set-color') + '</div>' +
      '<div class="size-ctl"><span>표시 크기</span>' +
      '<input class="size-range" type="range" min="0.6" max="2.2" step="0.05" value="' + settings.size + '">' +
      '</div></div>';
    html += '</div>';

    /* 악보 */
    html += '<div class="card score-card">';
    html += '<div class="score-head">' +
      '<span class="hint"></span>' +
      '<div class="zoom">' +
      '<button type="button" data-act="zoom-out" aria-label="작게">−</button>' +
      '<span class="zoom-label">' + Math.round(zoom * 100) + '%</span>' +
      '<button type="button" data-act="zoom-in" aria-label="크게">＋</button>' +
      '</div></div>';

    if (song.image) {
      html += '<div class="score-scroll"><div class="score-box" style="width:' + (zoom * 100) + '%">' +
        '<img src="' + song.image + '" alt="' + esc(song.title || (active + 1) + '번 악보') + '" draggable="false">' +
        '<div class="markers"></div></div></div>';
    } else {
      html += '<div class="score-empty">악보를 먼저 올려 주세요</div>';
    }
    html += '<div class="marker-editor-slot"></div>';
    html += '</div>';

    panel.innerHTML = html;

    updateHint();
    renderMarkers();
    renderEditor();
    bindUploadZone();
    bindScore();
  }

  function updateHint() {
    var hint = $('.score-head .hint');
    if (!hint) return;
    var t = (state.settings.text || '').trim();
    if (!state.songs[active].image) {
      hint.textContent = '악보를 올리면 그 위를 눌러 송폼 표시를 붙일 수 있습니다.';
      return;
    }
    hint.innerHTML = '악보를 <b>톡 누르면</b> <b style="color:' + esc(state.settings.color) + '">' + esc(t || '표시') +
      '</b>가 붙습니다 · 표시를 <b>끌면</b> 이동 · 표시를 누르면 수정';
  }

  /* ---------- 표시(marker) ---------- */
  function markersOf() { return state.songs[active].markers; }

  function renderMarkers() {
    var box = $('.score-box');
    if (!box) return;
    var layer = $('.markers', box);
    if (!layer) return;
    var w = box.clientWidth || 320;
    layer.innerHTML = markersOf().map(function (m) {
      var fs = w * MARKER_RATIO * m.size;
      return '<span class="marker' + (m.id === selectedId ? ' selected' : '') + '" data-id="' + m.id + '"' +
        ' style="left:' + m.x + '%;top:' + m.y + '%;color:' + m.color + ';font-size:' + fs.toFixed(2) + 'px">' +
        esc(m.text) + '</span>';
    }).join('');
  }

  function selectedMarker() {
    if (!selectedId) return null;
    var list = markersOf();
    for (var i = 0; i < list.length; i++) if (list[i].id === selectedId) return list[i];
    return null;
  }

  function renderEditor() {
    var slot = $('.marker-editor-slot');
    if (!slot) return;
    var m = selectedMarker();
    if (!m) { slot.innerHTML = ''; return; }
    slot.innerHTML =
      '<div class="marker-editor">' +
      '<div class="me-head"><span>표시 수정</span>' +
      '<button type="button" class="icon-btn" data-act="deselect" aria-label="닫기">✕</button></div>' +
      '<div class="me-row">' +
      '<input class="me-text" type="text" maxlength="14" value="' + esc(m.text) + '">' +
      '<button type="button" class="btn small" data-act="me-dup">복제</button>' +
      '<button type="button" class="btn small danger" data-act="me-del">삭제</button>' +
      '</div>' +
      '<div class="me-row">' +
      '<div class="colors">' + colorButtons(m.color, 'me-color') + '</div>' +
      '<div class="size-ctl">' +
      '<button type="button" class="size-btn" data-act="me-smaller" aria-label="작게">−</button>' +
      '<span class="me-value">' + Math.round(m.size * 100) + '%</span>' +
      '<button type="button" class="size-btn" data-act="me-bigger" aria-label="크게">＋</button>' +
      '</div>' +
      '</div></div>';
  }

  function selectMarker(id) {
    selectedId = id;
    var box = $('.score-box');
    if (box) {
      $$('.marker', box).forEach(function (x) {
        x.classList.toggle('selected', x.getAttribute('data-id') === id);
      });
    }
    renderEditor();
  }

  function addMarkerAt(clientX, clientY) {
    var box = $('.score-box');
    if (!box) return;
    var text = (state.settings.text || '').trim();
    if (!text) { toast('먼저 표시 글자를 골라 주세요.'); return; }
    var rect = box.getBoundingClientRect();
    var m = {
      id: uid(),
      text: text,
      x: round1(clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)),
      y: round1(clamp(((clientY - rect.top) / rect.height) * 100, 0, 100)),
      color: state.settings.color,
      size: state.settings.size
    };
    pushUndo();
    markersOf().push(m);
    selectedId = m.id;
    renderMarkers();
    renderEditor();
    save();
  }

  /* ---------- 실행 취소 ---------- */
  function snapshot() {
    return JSON.stringify(state.songs.map(function (s) { return s.markers; }));
  }
  function pushUndo(prev) {
    undoStack.push(typeof prev === 'string' ? prev : snapshot());
    if (undoStack.length > 60) undoStack.shift();
    redoStack.length = 0;
    updateUndoButtons();
  }
  function applySnapshot(json) {
    var arr = JSON.parse(json);
    state.songs.forEach(function (s, i) { s.markers = arr[i] || []; });
    if (selectedId && !selectedMarker()) selectedId = null;
    renderMarkers();
    renderEditor();
    save();
  }
  function undo() {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    applySnapshot(undoStack.pop());
    updateUndoButtons();
  }
  function redo() {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    applySnapshot(redoStack.pop());
    updateUndoButtons();
  }
  function updateUndoButtons() {
    var u = $('#btnUndo'), r = $('#btnRedo');
    if (u) u.disabled = !undoStack.length;
    if (r) r.disabled = !redoStack.length;
  }

  /* ---------- 업로드 ---------- */
  function setSongImage(dataUrl, w, h, name) {
    var song = state.songs[active];
    song.image = dataUrl;
    song.imgW = w;
    song.imgH = h;
    song.fileName = name || '악보';
    selectedId = null;
    save();
    renderSongTabs();
    renderPanel();
  }

  function canvasToSongData(canvas, name) {
    var max = 2000;
    var scale = Math.min(1, max / Math.max(canvas.width, canvas.height));
    var out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(canvas.width * scale));
    out.height = Math.max(1, Math.round(canvas.height * scale));
    var ctx = out.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, out.width, out.height);
    setSongImage(out.toDataURL('image/jpeg', 0.92), out.width, out.height, name);
  }

  function handleImageFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);
        canvasToSongData(c, file.name);
        busy(false);
      };
      img.onerror = function () { busy(false); toast('이미지 파일을 읽지 못했습니다.'); };
      img.src = reader.result;
    };
    reader.onerror = function () { busy(false); toast('파일을 읽지 못했습니다.'); };
    reader.readAsDataURL(file);
  }

  function ensurePdfLib() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (!pdfLibPromise) {
      pdfLibPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'vendor/pdf.min.js?v=20261128a';
        s.async = true;
        s.onload = function () {
          if (!window.pdfjsLib) { reject(new Error('PDF 엔진 없음')); return; }
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js?v=20261128a';
          resolve(window.pdfjsLib);
        };
        s.onerror = function () { reject(new Error('PDF 엔진을 불러오지 못했습니다')); };
        document.head.appendChild(s);
      }).catch(function (err) { pdfLibPromise = null; throw err; });
    }
    return pdfLibPromise;
  }

  function handlePdfFile(file) {
    busy(true, 'PDF를 여는 중…');
    var songIndex = active;
    ensurePdfLib().then(function (lib) {
      return file.arrayBuffer().then(function (buf) {
        return lib.getDocument({
          data: new Uint8Array(buf),
          cMapUrl: 'vendor/cmaps/',
          cMapPacked: true,
          isEvalSupported: false
        }).promise;
      });
    }).then(function (doc) {
      pdfSession = { doc: doc, pages: doc.numPages, song: songIndex, current: 1, fileName: file.name };
      return renderPdfPage(1, songIndex, file.name);
    }).catch(function (err) {
      busy(false);
      var name = (err && err.name) || '';
      if (name === 'PasswordException') toast('암호가 걸린 PDF입니다. 암호를 풀어 저장한 뒤 다시 올려 주세요.');
      else if (name === 'InvalidPDFException') toast('PDF 파일을 읽지 못했습니다. 파일이 손상되었을 수 있습니다.');
      else toast('PDF를 여는 중 문제가 생겼습니다. 다시 시도해 주세요.');
    });
  }

  function renderPdfPage(num, songIndex, fileName) {
    if (!pdfSession) return Promise.resolve();
    busy(true, '악보를 그리는 중…');
    pdfSession.current = num;
    return pdfSession.doc.getPage(num).then(function (page) {
      var base = page.getViewport({ scale: 1 });
      var scale = clamp(2200 / base.width, 2, 3.2);
      var vp = page.getViewport({ scale: scale });
      var c = document.createElement('canvas');
      c.width = Math.round(vp.width);
      c.height = Math.round(vp.height);
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
        try { page.cleanup(); } catch (e) { /* noop */ }
        active = songIndex;
        renderSongTabs();
        canvasToSongData(c, (fileName || 'PDF') + ' · ' + num + '페이지');
        busy(false);
      });
    }).catch(function () {
      busy(false);
      toast('PDF 페이지를 그리지 못했습니다.');
    });
  }

  function handleFile(file) {
    if (!file) return;
    var isPdf = /pdf$/i.test(file.type || '') || /\.pdf$/i.test(file.name || '');
    if (isPdf) { handlePdfFile(file); return; }
    if (!/^image\//.test(file.type || '')) { toast('PDF 또는 이미지 파일만 올릴 수 있습니다.'); return; }
    busy(true, '악보를 준비하는 중…');
    handleImageFile(file);
  }

  function bindUploadZone() {
    var zone = $('.upload-zone');
    if (!zone) return;
    var input = $('.file-input', zone);
    zone.addEventListener('click', function (e) {
      if (e.target.closest('[data-act]')) return; // 버튼은 각자 처리
      if (input) input.click();
    });
    if (input) {
      input.addEventListener('change', function () {
        var f = input.files && input.files[0];
        if (f) handleFile(f);
        input.value = '';
      });
    }
    ['dragenter', 'dragover'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (ev === 'dragleave' && zone.contains(e.relatedTarget)) return;
        zone.classList.remove('dragover');
      });
    });
    zone.addEventListener('drop', function (e) {
      var dt = e.dataTransfer;
      if (!dt) return;
      var f = dt.files && dt.files[0];
      if (f) handleFile(f);
    });
  }

  /* ---------- 악보 위 포인터 조작 ---------- */
  function bindScore() {
    var box = $('.score-box');
    if (!box) return;
    var layer = $('.markers', box);
    if (!layer) return;

    var down = null;
    box.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.marker')) return;
      down = { x: e.clientX, y: e.clientY, t: Date.now() };
    });
    box.addEventListener('pointerup', function (e) {
      if (!down) return;
      var dx = Math.abs(e.clientX - down.x), dy = Math.abs(e.clientY - down.y);
      var quick = Date.now() - down.t < 700;
      down = null;
      if (dx < 10 && dy < 10 && quick) addMarkerAt(e.clientX, e.clientY);
    });
    box.addEventListener('pointercancel', function () { down = null; });

    layer.addEventListener('pointerdown', function (e) {
      var el = e.target.closest('.marker');
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      var id = el.getAttribute('data-id');
      selectMarker(id);
      var list = markersOf();
      var m = null;
      for (var i = 0; i < list.length; i++) if (list[i].id === id) m = list[i];
      if (!m) return;
      var before = snapshot();
      var moved = false;
      var pid = e.pointerId;
      try { el.setPointerCapture(pid); } catch (err) { /* noop */ }

      function move(ev) {
        if (ev.pointerId !== pid) return;
        var r = box.getBoundingClientRect();
        var nx = round1(clamp(((ev.clientX - r.left) / r.width) * 100, -2, 102));
        var ny = round1(clamp(((ev.clientY - r.top) / r.height) * 100, -2, 102));
        if (Math.abs(nx - m.x) > 0.05 || Math.abs(ny - m.y) > 0.05) { m.x = nx; m.y = ny; moved = true; }
        el.style.left = m.x + '%';
        el.style.top = m.y + '%';
      }
      function up(ev) {
        if (ev.pointerId !== pid) return;
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        if (moved) { pushUndo(before); save(); }
      }
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  }

  /* ---------- 패널 위임 이벤트 (한 번만 연결) ---------- */
  function bindPanelDelegates() {
    var panel = $('#songPanel');
    if (!panel) return;

    panel.addEventListener('click', function (e) {
      var act = e.target.closest('[data-act]');
      if (!act) return;
      var a = act.getAttribute('data-act');

      if (a === 'pick') {
        var inp = $('.file-input');
        if (inp) inp.click();
        return;
      }
      if (a === 'clear') {
        if (!window.confirm('이 곡에 올린 악보를 지울까요? (악보 위에 붙인 표시는 그대로 남습니다)')) return;
        var song = state.songs[active];
        song.image = '';
        song.fileName = '';
        song.imgW = 0;
        song.imgH = 0;
        selectedId = null;
        pdfSession = null;
        save();
        renderSongTabs();
        renderPanel();
        return;
      }
      if (a === 'form-token') {
        var token = act.getAttribute('data-token');
        var input = $('.form-input');
        if (input) {
          var v = input.value.trim();
          if (token === '-') v = v ? v + ' - ' : '';
          else v = v ? v + ' - ' + token : token;
          input.value = v;
          state.songs[active].form = v;
          save();
        }
        return;
      }
      if (a === 'form-back') {
        var inp2 = $('.form-input');
        if (inp2) {
          var parts = inp2.value.split(' - ');
          parts.pop();
          var v2 = parts.join(' - ');
          inp2.value = v2;
          state.songs[active].form = v2;
          save();
        }
        return;
      }
      if (a === 'marker') {
        state.settings.text = act.getAttribute('data-text');
        var ti = $('.marker-text-input');
        if (ti) ti.value = '';
        $$('.marker-chips .chip').forEach(function (c) { c.classList.toggle('on', c === act); });
        updateHint();
        save();
        return;
      }
      if (a === 'set-color') {
        state.settings.color = act.getAttribute('data-color');
        $$('.palette-row .color-btn').forEach(function (b) {
          if (b.getAttribute('data-act') === 'set-color') b.classList.toggle('active', b === act);
        });
        updateHint();
        save();
        return;
      }
      if (a === 'zoom-in' || a === 'zoom-out') {
        zoom = clamp(zoom + (a === 'zoom-in' ? 0.5 : -0.5), 1, 4);
        var scroll = $('.score-scroll');
        var sb = $('.score-box');
        if (sb) sb.style.width = (zoom * 100) + '%';
        var zl = $('.zoom-label');
        if (zl) zl.textContent = Math.round(zoom * 100) + '%';
        if (scroll) scroll.scrollLeft = 0;
        renderMarkers();
        return;
      }
      if (a === 'deselect') { selectedId = null; selectMarker(null); return; }
      if (a === 'me-del') {
        var m = selectedMarker();
        if (!m) return;
        pushUndo();
        var list = markersOf();
        var i = list.indexOf(m);
        if (i >= 0) list.splice(i, 1);
        selectedId = null;
        renderMarkers();
        renderEditor();
        save();
        return;
      }
      if (a === 'me-dup') {
        var src = selectedMarker();
        if (!src) return;
        pushUndo();
        var copy = {
          id: uid(), text: src.text, x: clamp(src.x + 2, 0, 100), y: clamp(src.y + 2, 0, 100),
          color: src.color, size: src.size
        };
        markersOf().push(copy);
        selectedId = copy.id;
        renderMarkers();
        renderEditor();
        save();
        return;
      }
      if (a === 'me-color') {
        var sel = selectedMarker();
        if (!sel) return;
        pushUndo();
        sel.color = act.getAttribute('data-color');
        renderMarkers();
        renderEditor();
        save();
        return;
      }
      if (a === 'me-bigger' || a === 'me-smaller') {
        var sel2 = selectedMarker();
        if (!sel2) return;
        pushUndo();
        sel2.size = Math.round(clamp(sel2.size + (a === 'me-bigger' ? 0.15 : -0.15), 0.5, 3) * 100) / 100;
        renderMarkers();
        renderEditor();
        save();
        return;
      }
    });

    panel.addEventListener('input', function (e) {
      var t = e.target;
      if (t.classList.contains('title-input')) {
        state.songs[active].title = t.value;
        renderSongTabs();
        save();
        return;
      }
      if (t.classList.contains('form-input')) {
        state.songs[active].form = t.value;
        save();
        return;
      }
      if (t.classList.contains('marker-text-input')) {
        state.settings.text = t.value;
        $$('.marker-chips .chip').forEach(function (c) { c.classList.remove('on'); });
        updateHint();
        save();
        return;
      }
      if (t.classList.contains('size-range')) {
        state.settings.size = clamp(parseFloat(t.value) || 1, 0.6, 2.2);
        save();
        return;
      }
      if (t.classList.contains('me-text')) {
        var m = selectedMarker();
        if (!m) return;
        m.text = t.value;
        renderMarkers();
        save();
        return;
      }
    });

    panel.addEventListener('change', function (e) {
      var t = e.target;
      if (t.classList.contains('pdf-page-select') && pdfSession) {
        renderPdfPage(parseInt(t.value, 10) || 1, active, pdfSession.fileName);
      }
    });
  }

  /* ---------- 이미지 불러오기 ---------- */
  function loadImage(src) {
    if (!src) return Promise.resolve(null);
    if (imgCache[src]) return imgCache[src];
    imgCache[src] = new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () { resolve(im); };
      im.onerror = function () { resolve(null); };
      im.src = src;
    });
    return imgCache[src];
  }

  /* ---------- 출력 캔버스 ---------- */
  var SHEET_W = PAGE.w - PAGE.margin * 2; // 10.3in
  var SHEET_H = PAGE.h - PAGE.margin * 2; // 7.8in

  function makeSheetCanvas() {
    var c = document.createElement('canvas');
    c.width = Math.round(SHEET_W * DPI);
    c.height = Math.round(SHEET_H * DPI);
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    return c;
  }

  function drawMarkers(ctx, markers, dx, dy, dw, dh) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    markers.forEach(function (m) {
      var fs = dw * MARKER_RATIO * m.size;
      ctx.font = '800 ' + fs.toFixed(1) + 'px ' + FONT;
      ctx.fillStyle = m.color;
      ctx.fillText(m.text, dx + (m.x / 100) * dw, dy + (m.y / 100) * dh);
    });
  }

  function drawPlaceholder(ctx, idx, box, cursor) {
    var ph = clamp(box.h - (cursor - box.y), pt(50), pt(110));
    ctx.save();
    ctx.setLineDash([pt(6), pt(4)]);
    ctx.strokeStyle = '#d5cfc7';
    ctx.lineWidth = Math.max(1, pt(0.9));
    ctx.strokeRect(box.x + 1, cursor, box.w - 2, ph);
    ctx.restore();
    ctx.fillStyle = '#aaa39b';
    ctx.font = '600 ' + pt(10) + 'px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((idx + 1) + '번 악보를 올려 주세요', box.x + box.w / 2, cursor + ph / 2);
  }

  function drawSong(ctx, idx, box, align) {
    var song = state.songs[idx];
    var titlePx = pt(14);
    var formPx = pt(10);
    var anchorX = align === 'center' ? box.x + box.w / 2 : box.x;
    ctx.textAlign = align === 'center' ? 'center' : 'left';
    ctx.textBaseline = 'top';
    var cursor = box.y;

    var title = displayTitle(song.title, idx);
    if (title) {
      ctx.fillStyle = '#111111';
      ctx.font = '700 ' + titlePx + 'px ' + FONT;
      ctx.fillText(title, anchorX, cursor, box.w);
      cursor += titlePx * 1.28;
    }
    if (song.form) {
      ctx.fillStyle = '#111111';
      ctx.font = '600 ' + formPx + 'px ' + FONT;
      ctx.fillText(song.form, anchorX, cursor, box.w);
      cursor += formPx * 1.6;
    }
    if (title || song.form) cursor += pt(3);

    return loadImage(song.image).then(function (img) {
      if (!img || !img.naturalWidth) { drawPlaceholder(ctx, idx, box, cursor); return; }
      var availH = box.y + box.h - cursor;
      var scale = Math.min(box.w / img.naturalWidth, availH / img.naturalHeight);
      var dw = img.naturalWidth * scale;
      var dh = img.naturalHeight * scale;
      var dx = align === 'center' ? box.x + (box.w - dw) / 2 : box.x;
      ctx.drawImage(img, dx, cursor, dw, dh);
      drawMarkers(ctx, song.markers, dx, cursor, dw, dh);
    });
  }

  var renderChain = Promise.resolve();
  function renderPages() {
    var run = renderChain.then(buildPages, buildPages);
    renderChain = run.catch(function () {});
    return run;
  }

  function buildPages() {
    var pages = [makeSheetCanvas(), makeSheetCanvas()];
    var W = px(SHEET_W);
    var H = px(SHEET_H);
    var gutter = px(PAGE.gutter);
    var colW = (W - gutter) / 2;

    var c1 = pages[0].getContext('2d');
    var c2 = pages[1].getContext('2d');
    var full = state.settings.page2 === 'full';

    return drawSong(c1, 0, { x: 0, y: 0, w: colW, h: H }, 'left')
      .then(function () { return drawSong(c1, 1, { x: colW + gutter, y: 0, w: colW, h: H }, 'left'); })
      .then(function () { return drawSong(c2, 2, { x: 0, y: 0, w: full ? W : colW, h: H }, full ? 'center' : 'left'); })
      .then(function () { return pages; });
  }

  /* ---------- 미리보기 ---------- */
  function schedulePreview(delay) {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, delay == null ? 60 : delay);
  }

  function renderPreview() {
    var wrap = $('#sheetWrap');
    if (!wrap) return;
    var token = ++previewToken;
    wrap.innerHTML = '<div class="loading">미리보기를 만드는 중…</div>';
    renderPages().then(function (pages) {
      if (token !== previewToken) return;
      var labels = ['앞면 — 1번 · 2번', '뒷면 — 3번'];
      wrap.innerHTML = pages.map(function (c, i) {
        return '<figure class="sheet"><figcaption>' + labels[i] + '</figcaption>' +
          '<img alt="' + labels[i] + '" src="' + c.toDataURL('image/jpeg', 0.92) + '"></figure>';
      }).join('');
    }).catch(function () {
      if (token !== previewToken) return;
      wrap.innerHTML = '<div class="loading">미리보기를 만들지 못했습니다. 새로고침 후 다시 시도해 주세요.</div>';
    });
  }

  /* ---------- PDF ---------- */
  function ensureJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (window.jsPDF) return Promise.resolve(window.jsPDF);
    if (!jspdfPromise) {
      jspdfPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'vendor/jspdf.umd.min.js?v=20261128a';
        s.async = true;
        s.onload = function () {
          var ctor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
          if (ctor) resolve(ctor); else reject(new Error('PDF 엔진 없음'));
        };
        s.onerror = function () { reject(new Error('PDF 엔진을 불러오지 못했습니다')); };
        document.head.appendChild(s);
      }).catch(function (err) { jspdfPromise = null; throw err; });
    }
    return jspdfPromise;
  }

  function stamp() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }

  function setPrintStatus(text) {
    var el = $('#printStatus');
    if (el) el.textContent = text || '';
  }

  function showPdfLink(blob, name) {
    var holder = $('#pdfLinkHolder');
    if (!holder) return;
    holder.innerHTML = '';
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.textContent = '📥 ' + name + ' 저장';
    holder.appendChild(a);
  }

  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
  }

  function makePdf() {
    var btn = $('#btnPdf');
    if (btn) btn.disabled = true;
    setPrintStatus('PDF를 만드는 중…');
    return renderPages()
      .then(function (pages) {
        return ensureJsPdf().then(function (Ctor) {
          var pdf = new Ctor({ orientation: 'landscape', unit: 'in', format: 'letter', compress: true });
          for (var i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage('letter', 'landscape');
            pdf.addImage(pages[i].toDataURL('image/jpeg', 0.96), 'JPEG', PAGE.margin, PAGE.margin, SHEET_W, SHEET_H);
          }
          return pdf.output('blob');
        });
      })
      .then(function (blob) {
        var name = '찬양콘티_' + stamp() + '.pdf';
        showPdfLink(blob, name);
        var file = null;
        try { file = new File([blob], name, { type: 'application/pdf' }); } catch (e) { file = null; }
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          setPrintStatus('공유 창이 열립니다. “파일에 저장”을 눌러 보관하세요.');
          return navigator.share({ files: [file], title: name }).then(function () {
            setPrintStatus('PDF를 공유했습니다.');
          }).catch(function (err) {
            if (err && err.name === 'AbortError') {
              setPrintStatus('PDF를 만들었습니다. 아래 링크로 저장할 수 있습니다.');
              return;
            }
            downloadBlob(blob, name);
            setPrintStatus('PDF 파일을 내려받았습니다.');
          });
        }
        downloadBlob(blob, name);
        setPrintStatus('PDF 파일을 내려받았습니다. 아이폰은 [파일] 앱 → 다운로드에서 확인하세요.');
      })
      .catch(function () {
        setPrintStatus('PDF를 만들지 못했습니다. 새로고침 후 다시 시도해 주세요.');
      })
      .then(function () {
        if (btn) btn.disabled = false;
      });
  }

  function doPrint() {
    setPrintStatus('인쇄 화면을 준비하는 중…');
    var btn = $('#btnPrint');
    if (btn) btn.disabled = true;
    renderPages().then(function (pages) {
      var root = $('#printRoot');
      root.innerHTML = pages.map(function (c) {
        return '<img src="' + c.toDataURL('image/png') + '" alt="">';
      }).join('');
      var imgs = $$('img', root);
      var waits = imgs.map(function (im) {
        if (im.complete) return Promise.resolve();
        return new Promise(function (res) { im.onload = res; im.onerror = res; });
      });
      return Promise.all(waits).then(function () {
        setPrintStatus('인쇄 창이 열립니다. 용지는 “가로”, 크기는 100%로 두세요.');
        setTimeout(function () { window.print(); }, 250);
      });
    }).catch(function () {
      setPrintStatus('인쇄 화면을 만들지 못했습니다.');
    }).then(function () {
      if (btn) btn.disabled = false;
    });
  }

  /* ---------- 관리 ---------- */
  function bindManage() {
    var backup = $('#btnBackup');
    if (backup) backup.addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
      downloadBlob(blob, '찬양콘티_백업_' + stamp() + '.json');
      toast('백업 파일을 저장했습니다.');
    });
    var restore = $('#btnRestore');
    var jsonInput = $('#jsonInput');
    if (restore && jsonInput) {
      restore.addEventListener('click', function () { jsonInput.click(); });
      jsonInput.addEventListener('change', function () {
        var f = jsonInput.files && jsonInput.files[0];
        if (f) importContiFile(f);
        jsonInput.value = '';
      });
    }
    var reset = $('#btnReset');
    if (reset) reset.addEventListener('click', function () {
      if (!window.confirm('지금 편집 중인 콘티 3곡(악보·제목·표시)을 모두 지우고 새로 시작할까요?')) return;
      state = defaultState();
      imgCache = {};
      selectedId = null;
      undoStack.length = 0;
      redoStack.length = 0;
      pdfSession = null;
      zoom = 1;
      syncPage2Seg();
      save();
      renderSongTabs();
      renderPanel();
      updateUndoButtons();
      toast('새 콘티를 시작했습니다.');
    });

    var undoImport = $('#btnUndoImport');
    if (undoImport) undoImport.addEventListener('click', restorePrev);
  }

  /* ---------- 콘티 파일 불러오기 · 공유 링크(preset) ---------- */
  function songCount() {
    return state.songs.filter(function (s) { return (s.title || '').trim() || s.image; }).length;
  }

  function afterImport(label) {
    selectedId = null;
    undoStack.length = 0;
    redoStack.length = 0;
    pdfSession = null;
    zoom = 1;
    syncPage2Seg();
    save();
    renderSongTabs();
    renderPanel();
    updateUndoButtons();
    var n = songCount();
    toast((label ? label + ' · ' : '') + (n ? n + '곡 콘티' : '빈 콘티') + '를 불러왔습니다.');
  }

  function importContiText(text, label) {
    var data = null;
    try { data = JSON.parse(text); } catch (e) { data = null; }
    if (!data || !Array.isArray(data.songs)) {
      toast('콘티 파일이 아닙니다. 이 앱의 [JSON으로 백업]으로 만든 .json 파일을 골라 주세요.');
      return false;
    }
    stashPrev(text.length);
    applyState(data);
    afterImport(label);
    return true;
  }

  /* 불러오기 전 콘티를 한 단계 남겨 둔다 (저장 공간이 모자라면 건너뛴다) */
  var PREV_KEY = 'harvester-conti-prev-v1';
  function stashPrev(incomingLength) {
    if (!songCount()) return;
    var prev = '';
    try { prev = JSON.stringify(state); } catch (e) { return; }
    try { localStorage.removeItem(PREV_KEY); } catch (e) { /* noop */ }
    if (incomingLength && prev.length + incomingLength > 2400000) return;
    try {
      localStorage.setItem(PREV_KEY, prev);
    } catch (e) {
      try { localStorage.removeItem(PREV_KEY); } catch (e2) { /* noop */ }
    }
  }

  function restorePrev() {
    var raw = null;
    try { raw = localStorage.getItem(PREV_KEY); } catch (e) { raw = null; }
    if (!raw) { toast('되돌릴 직전 콘티가 없습니다.'); return; }
    importContiText(raw, '직전 콘티');
  }

  function importContiFile(file) {
    if (!file) return;
    if (!/\.json$/i.test(file.name || '')) { toast('콘티 파일(.json)만 불러올 수 있습니다.'); return; }
    busy(true, '콘티를 불러오는 중…');
    var reader = new FileReader();
    reader.onload = function () {
      busy(false);
      importContiText(String(reader.result), '');
    };
    reader.onerror = function () { busy(false); toast('파일을 읽지 못했습니다.'); };
    reader.readAsText(file);
  }

  function presetUrl(raw) {
    var v = String(raw || '').trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;
    v = v.replace(/^\.\//, '');
    if (v.indexOf('/') >= 0 || /\.json$/i.test(v)) return v;
    return 'presets/' + v + '.json';
  }

  function loadPreset(raw) {
    var url = presetUrl(raw);
    if (!url) return;
    busy(true, '콘티를 불러오는 중…');
    fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (text) {
      busy(false);
      if (!importContiText(text, '')) return;
      try {
        if (location.search) history.replaceState(null, '', location.pathname + location.hash);
      } catch (e) { /* 주소 정리는 못 해도 불러오기는 됨 */ }
    }).catch(function () {
      busy(false);
      toast('콘티 링크를 열지 못했습니다. 주소가 맞는지 확인해 주세요.');
    });
  }

  /* ---------- 원드라이브 악보 서재 ---------- */
  var libData = null;
  var libLoading = false;
  var libTimer = 0;

  function libNorm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }

  function setLibStatus(text) {
    var st = $('#libStatus');
    if (st) st.textContent = text || '';
  }

  function loadLibrary() {
    if (libData || libLoading) return;
    libLoading = true;
    setLibStatus('악보 목록을 불러오는 중…');
    fetch('library.json', { cache: 'force-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      if (!data || !Array.isArray(data.items)) throw new Error('형식');
      data.byCode = {};
      (data.folders || []).forEach(function (f) { data.byCode[f.c] = f; });
      data.search = data.items.map(function (it) {
        return { name: String(it[0] || ''), code: it[1], ext: String(it[2] || ''), n: libNorm(it[0]) };
      });
      libData = data;
      libLoading = false;
      var total = $('#libTotal');
      if (total) total.textContent = '(' + data.search.length.toLocaleString('ko-KR') + '곡)';
      var inp = $('.lib-input');
      if (inp && inp.value.trim()) runLibSearch();
      else setLibStatus('폴더 ' + (data.folders || []).length + '곳 · ' + data.search.length.toLocaleString('ko-KR') + '곡이 들어 있습니다. 곡명을 입력해 보세요.');
    }).catch(function () {
      libLoading = false;
      setLibStatus('악보 목록을 불러오지 못했습니다. 잠시 뒤 다시 열어 주세요.');
    });
  }

  function runLibSearch() {
    var inp = $('.lib-input');
    var box = $('#libResults');
    if (!inp || !box || !libData) return;
    var q = libNorm(inp.value);
    if (!q) {
      box.innerHTML = '';
      setLibStatus('곡명을 입력하면 원드라이브 악보 폴더에서 찾아 드립니다.');
      return;
    }
    var hits = [];
    for (var i = 0; i < libData.search.length && hits.length < 60; i++) {
      if (libData.search[i].n.indexOf(q) >= 0) hits.push(libData.search[i]);
    }
    if (!hits.length) {
      box.innerHTML = '';
      setLibStatus('‘' + inp.value.trim() + '’는 원드라이브 악보 목록에 없습니다. 하베스터에게 물어보면 웹에서도 찾아 드립니다.');
      return;
    }
    box.innerHTML = hits.map(function (it) {
      var f = libData.byCode[it.code] || { n: it.code, p: '', k: null };
      var path = f.p + '/' + it.name;
      var badge = f.k || String(it.ext || '').toUpperCase();
      return '<div class="lib-item"><div class="txt">' +
        '<div class="nm">' + esc(String(it.name).replace(/\.[^.]+$/, '')) + '</div>' +
        '<div class="mt"><span class="badge">' + esc(badge) + '</span>' +
        '<span class="badge src">' + esc(f.n) + '</span>' + esc(path) + '</div>' +
        '</div><button type="button" class="btn small ghost" data-copy="' + esc(path) + '">경로 복사</button></div>';
    }).join('');
    setLibStatus(hits.length + '곡 찾음' + (hits.length >= 60 ? ' · 앞 60곡만 보입니다. 더 정확한 곡명을 입력해 보세요.' : ''));
  }

  function copyText(t) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast('경로를 복사했습니다.'); }
      catch (e) { toast('복사하지 못했습니다. 경로를 길게 눌러 복사해 주세요.'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { toast('경로를 복사했습니다.'); }, fallback);
    } else fallback();
  }

  function syncPage2Seg() {
    $$('#page2Seg button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-mode') === state.settings.page2);
    });
  }

  /* ---------- 불러오기 도구 연결 ---------- */
  function bindImportTools() {
    var openBtn = $('#btnOpenConti');
    var jsonInput = $('#jsonInput');
    if (openBtn && jsonInput) {
      openBtn.addEventListener('click', function () { jsonInput.click(); });
    }

    var libOpen = $('#btnLibOpen');
    var libCard = $('#libraryCard');
    if (libOpen && libCard) {
      libOpen.addEventListener('click', function () {
        libCard.open = true;
        loadLibrary();
        try { libCard.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { /* noop */ }
        var inp = $('.lib-input');
        if (inp) setTimeout(function () { try { inp.focus(); } catch (e) { /* noop */ } }, 260);
      });
    }
    if (libCard) {
      libCard.addEventListener('toggle', function () { if (libCard.open) loadLibrary(); });
    }
    var libInput = $('.lib-input');
    if (libInput) {
      libInput.addEventListener('input', function () {
        clearTimeout(libTimer);
        libTimer = setTimeout(runLibSearch, 120);
      });
    }
    var libResults = $('#libResults');
    if (libResults) {
      libResults.addEventListener('click', function (e) {
        var b = e.target.closest('[data-copy]');
        if (!b) return;
        copyText(b.getAttribute('data-copy') || '');
      });
    }

    var presetBtn = $('#btnPresetUrl');
    var presetInput = $('#presetUrl');
    if (presetBtn && presetInput) {
      presetBtn.addEventListener('click', function () { loadPreset(presetInput.value); });
      presetInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); loadPreset(presetInput.value); }
      });
    }

    /* 화면에 .json 콘티 파일을 끌어다 놓기 */
    ['dragover', 'drop'].forEach(function (ev) {
      document.addEventListener(ev, function (e) {
        var dt = e.dataTransfer;
        if (!dt) return;
        var f = dt.files && dt.files[0];
        var isJson = /\.json$/i.test((f && f.name) || '') ||
          (dt.types && Array.prototype.indexOf.call(dt.types, 'application/json') >= 0);
        if (!isJson) return;
        e.preventDefault();
        e.stopPropagation();
        if (ev === 'drop' && f) importContiFile(f);
      }, true);
    });
  }

  /* ---------- 초기화 ---------- */
  function init() {
    load();
    renderSongTabs();
    renderPanel();
    bindPanelDelegates();
    bindManage();
    bindImportTools();
    updateUndoButtons();
    syncPage2Seg();
    setSaveState('');

    $('#songTabs').addEventListener('click', function (e) {
      var b = e.target.closest('.song-tab');
      if (!b) return;
      var i = parseInt(b.getAttribute('data-song'), 10);
      if (isNaN(i) || i === active) return;
      active = i;
      selectedId = null;
      renderSongTabs();
      renderPanel();
    });

    $$('.tab').forEach(function (b) {
      b.addEventListener('click', function () {
        var name = b.getAttribute('data-tab');
        $$('.tab').forEach(function (x) { x.classList.toggle('active', x === b); });
        $('#view-edit').classList.toggle('active', name === 'edit');
        $('#view-print').classList.toggle('active', name === 'print');
        if (name === 'print') schedulePreview(0);
      });
    });

    var u = $('#btnUndo'), r = $('#btnRedo');
    if (u) u.addEventListener('click', undo);
    if (r) r.addEventListener('click', redo);

    var pdfBtn = $('#btnPdf');
    if (pdfBtn) pdfBtn.addEventListener('click', makePdf);
    var printBtn = $('#btnPrint');
    if (printBtn) printBtn.addEventListener('click', doPrint);

    $$('#page2Seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.settings.page2 = b.getAttribute('data-mode');
        syncPage2Seg();
        save();
        schedulePreview(0);
      });
    });

    /* 붙여넣기로 악보 넣기 */
    document.addEventListener('paste', function (e) {
      if (!$('#view-edit').classList.contains('active')) return;
      var files = (e.clipboardData && e.clipboardData.files) || [];
      for (var i = 0; i < files.length; i++) {
        if (/^image\//.test(files[i].type)) {
          e.preventDefault();
          busy(true, '악보를 준비하는 중…');
          handleImageFile(files[i]);
          return;
        }
      }
    });

    /* 키보드 */
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      var typing = /INPUT|TEXTAREA|SELECT/.test(tag);
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !typing) {
        e.preventDefault();
        var m = selectedMarker();
        if (!m) return;
        pushUndo();
        var list = markersOf();
        var i = list.indexOf(m);
        if (i >= 0) list.splice(i, 1);
        selectedId = null;
        renderMarkers();
        renderEditor();
        save();
        return;
      }
      if (e.key === 'Escape' && selectedId) {
        selectedId = null;
        selectMarker(null);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 'z' && !typing) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    });

    function measureTopbar() {
      var h = document.querySelector('.topbar');
      if (h) document.documentElement.style.setProperty('--topH', h.offsetHeight + 'px');
    }
    measureTopbar();

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      measureTopbar();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderMarkers, 120);
    });

    /* ?preset=20261128 또는 ?preset=<JSON 주소> 로 열면 그 콘티를 바로 불러온다 */
    try {
      var params = new URLSearchParams(location.search);
      var preset = params.get('preset') || params.get('conti') || params.get('json');
      if (preset) loadPreset(preset);
    } catch (e) { /* 주소를 읽지 못하면 기본 콘티로 시작 */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
