/* 사역보고서 웹앱
   - 원본 워드 양식(template.docx)의 XML을 그대로 열어 값만 치환해 .docx를 만듭니다.
   - 화면 미리보기/인쇄도 같은 표 구조·글꼴·여백을 사용합니다. */
(function () {
  'use strict';

  /* 화면에서 생기는 자바스크립트 오류를 모아 두어 점검할 수 있게 합니다. */
  try {
    window.__reportErrors = [];
    window.addEventListener('error', function (e) {
      window.__reportErrors.push(String((e && e.message) || e));
    });
    window.addEventListener('unhandledrejection', function (e) {
      var r = e && e.reason;
      window.__reportErrors.push('rejection: ' + String((r && r.message) || r));
    });
  } catch (e) { /* 무시 */ }

  var LS_KEY = 'ministry-report-v1';
  var DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  var W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  var WD = ['일', '월', '화', '수', '목', '금', '토'];
  var TITLE = '유효석 목사 주간 사역 및 심방 보고서';
  var SEC1 = '사역 내용';
  var SEC2 = '주간 심방 내용 (담임목사님이 알아야 할 내용 및 심방 필요)';
  var SEC3 = '비고 (메모 및 사진)';
  var DEFAULT_VISITS = ['찬양대', '결석자전화심방', '수요새벽예배', '칸타타연습', '3전도회 및 5-6전도회 총회'];
  var TOTAL_ROWS = 36;          // 원본 워드 폼의 전체 행 수
  var ROWS_BEFORE_VISITS = 10;  // 스페이서 + 제목 + 섹션1 + 6일 + 섹션2

  /* 사진: 넣을 때 캔버스로 줄여 저장합니다(아이폰 원본은 수 MB라 localStorage에 그대로 못 들어갑니다). */
  var PHOTO_MAX_W = 1200;            // 가로 최대 px
  var PHOTO_MAX_H = 1600;            // 세로 최대 px
  var PHOTO_TARGET_BYTES = 150 * 1024;  // 사진 한 장 목표 용량
  /* 품질을 먼저 낮추고, 그래도 크면 해상도를 조금씩 줄입니다. */
  var PHOTO_LADDER = [[1, 0.82], [1, 0.7], [1, 0.6], [0.85, 0.55], [0.72, 0.5]];

  /* ------------------------------------------------------------------ *
   *  날짜 도우미
   * ------------------------------------------------------------------ */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseISO(s) {
    var a = String(s).split('-').map(Number);
    return new Date(a[0], (a[1] || 1) - 1, a[2] || 1);
  }
  function addDays(s, n) { var d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); }
  function wdName(s) { return WD[parseISO(s).getDay()]; }
  function md(s) { var d = parseISO(s); return (d.getMonth() + 1) + '/' + d.getDate(); }
  function fmtSubmit(s) {
    var d = parseISO(s);
    return pad2(d.getMonth() + 1) + '.' + pad2(d.getDate()) + '.' + String(d.getFullYear()).slice(2);
  }
  function koreanRange(a, b) {
    var da = parseISO(a), db = parseISO(b);
    var head = da.getFullYear() + '년 ' + (da.getMonth() + 1) + '월 ' + da.getDate() + '일';
    if (da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear()) {
      return head + ' ~ ' + db.getDate() + '일';
    }
    return head + ' ~ ' + (db.getMonth() + 1) + '월 ' + db.getDate() + '일';
  }
  function todayISO() { var n = new Date(); return iso(new Date(n.getFullYear(), n.getMonth(), n.getDate())); }
  /* 화요일에 보고하면 지난주 화~주일: 가장 최근 화요일(오늘이 화요일이면 지난 화요일) */
  function thisWeekStart() {
    var n = new Date();
    var t = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    var back = (t.getDay() - 2 + 7) % 7;
    if (back === 0) { back = 7; }
    t.setDate(t.getDate() - back);
    return iso(t);
  }

  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escAttr(s) {
    return escHtml(s).replace(/"/g, '&quot;');
  }
  function textLines(t) {
    var s = String(t == null ? '' : t).replace(/\r\n?/g, '\n');
    if (!s) { return ['']; }
    return s.split('\n');
  }
  function qs(sel) { return document.querySelector(sel); }

  /* ------------------------------------------------------------------ *
   *  상태 저장
   * ------------------------------------------------------------------ */
  var state = { v: 1, current: null, settings: { to: '', cc: '' }, weeks: {} };

  function blankWeek(start) {
    var days = [];
    for (var i = 0; i < 6; i++) { days.push({ date: addDays(start, i), text: '' }); }
    var sun = days[5].date;
    var today = todayISO();
    var submit = sun;
    if (today > sun && today <= addDays(sun, 2)) { submit = today; }
    var visits = DEFAULT_VISITS.map(function (n) { return { name: n, text: '' }; });
    return { start: start, submit: submit, days: days, visits: visits, note: { memo: '', photos: [] } };
  }

  function currentWeek() {
    if (!state.weeks[state.current]) { state.weeks[state.current] = blankWeek(state.current); }
    return state.weeks[state.current];
  }

  function normalizeWeek(k) {
    var w = state.weeks[k];
    if (!w || typeof w !== 'object') { state.weeks[k] = blankWeek(k); return; }
    if (!Array.isArray(w.days) || w.days.length !== 6) {
      var days = [];
      for (var i = 0; i < 6; i++) { days.push({ date: addDays(k, i), text: '' }); }
      if (Array.isArray(w.days)) {
        w.days.slice(0, 6).forEach(function (d, j) {
          if (d && d.date) { days[j] = { date: d.date, text: String(d.text || '') }; }
        });
      }
      w.days = days;
    }
    w.days.forEach(function (d) { if (!d || !d.date) { d.date = k; } d.text = String(d.text == null ? '' : d.text); });
    if (!w.submit) { w.submit = w.days[5].date; }
    if (!Array.isArray(w.visits)) {
      w.visits = DEFAULT_VISITS.map(function (n) { return { name: n, text: '' }; });
    }
    w.visits = w.visits.map(function (v) {
      return { name: String((v && v.name) || ''), text: String((v && v.text) || '') };
    });
    if (!w.note || typeof w.note !== 'object') { w.note = { memo: '', photos: [] }; }
    w.note.memo = String(w.note.memo == null ? '' : w.note.memo);
    if (!Array.isArray(w.note.photos)) { w.note.photos = []; }
    w.note.photos = w.note.photos.filter(function (p) {
      return p && typeof p.data === 'string' && p.data.indexOf('data:image/') === 0;
    }).map(function (p, i) {
      return {
        id: String(p.id || ('p' + i + '_' + Date.now())),
        data: p.data,
        caption: String(p.caption == null ? '' : p.caption),
        w: Number(p.w) || 0,
        h: Number(p.h) || 0
      };
    });
    w.start = w.start || k;
  }

  var saveTimer = null;
  function save() {
    if (saveTimer) { clearTimeout(saveTimer); }
    saveTimer = setTimeout(function () { flushSave(); }, 200);
  }
  function flushSave() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      setStatus('자동 저장됨', true);
      return true;
    } catch (e) {
      var full = !!(e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014));
      setStatus(full ? '저장 공간 부족 — 사진을 줄여 주세요' : '저장 실패 — 저장 공간을 확인해 주세요', false);
      return false;
    }
  }
  function setStatus(text, ok) {
    var el = qs('#saveState');
    if (!el) { return; }
    el.textContent = text;
    el.className = 'sub' + (ok ? ' on' : '');
  }

  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && typeof p === 'object') {
          state.settings = (p.settings && typeof p.settings === 'object') ? p.settings : { to: '', cc: '' };
          state.weeks = (p.weeks && typeof p.weeks === 'object') ? p.weeks : {};
          state.current = p.current || null;
        }
      }
    } catch (e) {
      setStatus('저장된 자료를 읽지 못했습니다', false);
    }
    if (!state.current || !state.weeks[state.current]) { state.current = thisWeekStart(); }
    Object.keys(state.weeks).forEach(normalizeWeek);
    currentWeek();
    flushSave();
  }

  /* ------------------------------------------------------------------ *
   *  화면 그리기
   * ------------------------------------------------------------------ */
  function dateLabel(wk, i) {
    var d = wk.days[i].date;
    if (i === 0) { return md(d); }
    var prev = parseISO(wk.days[i - 1].date);
    var cur = parseISO(d);
    if (prev.getMonth() !== cur.getMonth() || prev.getFullYear() !== cur.getFullYear()) { return md(d); }
    return String(cur.getDate());
  }

  function renderWeekBar() {
    var wk = currentWeek();
    qs('#weekLabel').textContent = md(wk.days[0].date) + '(' + wdName(wk.days[0].date) + ') ~ ' +
      md(wk.days[5].date) + '(' + wdName(wk.days[5].date) + ')';
    qs('#submitDate').value = wk.submit;
    qs('#submitFmt').textContent = fmtSubmit(wk.submit);
    qs('#previewMeta').textContent = '제출일 ' + fmtSubmit(wk.submit) + ' · ' + koreanRange(wk.days[0].date, wk.days[5].date);
  }

  function renderQuickDates() {
    var wk = currentWeek();
    var sel = qs('#qDate');
    var cur = sel.value;
    var html = '';
    wk.days.forEach(function (d) {
      html += '<option value="' + d.date + '">' + md(d.date) + '(' + wdName(d.date) + ')</option>';
    });
    sel.innerHTML = html;
    if (cur && wk.days.some(function (d) { return d.date === cur; })) { sel.value = cur; }
    else { sel.value = wk.days[0].date; }
  }

  function renderLog() {
    var wk = currentWeek();
    var today = todayISO();
    var html = '';
    wk.days.forEach(function (d, i) {
      var w = wdName(d.date);
      var cls = (w === '일') ? 'sun' : (w === '토' ? 'sat' : '');
      html += '<div class="daycard' + (d.date === today ? ' today' : '') + '">' +
        '<div class="dayhead">' +
        '<input type="date" value="' + d.date + '" data-day-date="' + i + '" aria-label="날짜">' +
        '<span class="wd-badge ' + cls + '">' + w + '</span>' +
        '<span class="dlabel">' + dateLabel(wk, i) + '</span>' +
        '<span class="count">' + (d.text ? d.text.length : 0) + '자</span>' +
        '</div>' +
        '<textarea data-day-text="' + i + '" rows="2" placeholder="이 날 한 사역을 적어 주세요. (예: 수요새벽예배 설교, 저녁예배 미디어 지원)">' +
        escHtml(d.text) + '</textarea>' +
        '</div>';
    });
    qs('#dayList').innerHTML = html;
  }

  function renderChips() {
    var wk = currentWeek();
    var existing = wk.visits.map(function (v) { return v.name; });
    var html = '';
    DEFAULT_VISITS.forEach(function (n) {
      if (existing.indexOf(n) >= 0) { return; }
      html += '<button class="chip" data-chip="' + escAttr(n) + '">＋ ' + escHtml(n) + '</button>';
    });
    qs('#visitChips').innerHTML = html;
  }

  function renderVisit() {
    var wk = currentWeek();
    var html = '';
    wk.visits.forEach(function (v, i) {
      html += '<div class="visit-item">' +
        '<div class="visit-row1">' +
        '<input type="text" value="' + escAttr(v.name) + '" data-visit-name="' + i + '" placeholder="항목 (예: 찬양대)">' +
        '<button class="del-btn" data-visit-del="' + i + '" aria-label="이 항목 삭제">✕</button>' +
        '</div>' +
        '<textarea data-visit-text="' + i + '" rows="2" placeholder="내용을 적어 주세요.">' + escHtml(v.text) + '</textarea>' +
        '</div>';
    });
    if (!wk.visits.length) {
      html = '<p class="hint">아직 항목이 없습니다. 아래 “새 항목 추가”를 눌러 주세요.</p>';
    }
    qs('#visitList').innerHTML = html;
  }

  function dataUrlBytes(data) {
    var s = String(data || '');
    var i = s.indexOf(',');
    if (i < 0) { return 0; }
    return Math.round((s.length - i - 1) * 0.75);
  }
  function fmtSize(bytes) {
    if (!bytes) { return '0KB'; }
    if (bytes < 1024 * 1024) { return Math.max(1, Math.round(bytes / 1024)) + 'KB'; }
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  }
  function findPhoto(id) {
    var list = currentWeek().note.photos;
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { return list[i]; } }
    return null;
  }

  function renderNote() {
    var note = currentWeek().note;
    var memo = qs('#noteMemo');
    if (memo && document.activeElement !== memo) { memo.value = note.memo; }

    var html = '';
    var bytes = 0;
    note.photos.forEach(function (p, i) {
      var b = dataUrlBytes(p.data);
      bytes += b;
      html += '<div class="photo-item" data-photo="' + escAttr(p.id) + '">' +
        '<div class="photo-thumb"><img src="' + escAttr(p.data) + '" alt="' +
        escAttr(p.caption || ('비고 사진 ' + (i + 1))) + '"></div>' +
        '<div class="photo-row2">' +
        '<input type="text" data-photo-caption="' + escAttr(p.id) + '" placeholder="사진 설명 (선택)" value="' + escAttr(p.caption) + '">' +
        '<button class="del-btn" data-photo-del="' + escAttr(p.id) + '" aria-label="이 사진 삭제">✕</button>' +
        '</div>' +
        '<div class="photo-meta">' + (i + 1) + '번째 · ' + (p.w || '?') + '×' + (p.h || '?') + ' · ' + fmtSize(b) + '</div>' +
        '</div>';
    });
    qs('#photoList').innerHTML = html ||
      '<p class="photo-empty">아직 사진이 없습니다. “사진 추가”를 눌러 아이폰 사진첩에서 고르세요.<br>여러 장을 한 번에 고를 수 있습니다.</p>';

    var meta = qs('#photoMeta');
    var heavy = bytes > 1.6 * 1024 * 1024;
    meta.textContent = note.photos.length
      ? '사진 ' + note.photos.length + '장 · 약 ' + fmtSize(bytes) + (heavy ? ' — 저장 공간이 거의 찼습니다' : '')
      : '사진 없음';
    meta.className = 'hint' + (heavy ? ' warn' : '');
  }

  /* 사진 파일 → 줄인 JPEG(dataURL) */
  function readImageFile(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('사진을 읽지 못했습니다.')); };
      img.src = url;
    });
  }
  function compressPhoto(img) {
    var sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
    if (!sw || !sh) { throw new Error('사진 크기를 읽지 못했습니다.'); }
    var base = Math.min(1, PHOTO_MAX_W / sw, PHOTO_MAX_H / sh);
    var best = null;
    for (var i = 0; i < PHOTO_LADDER.length; i++) {
      var w = Math.max(1, Math.round(sw * base * PHOTO_LADDER[i][0]));
      var h = Math.max(1, Math.round(sh * base * PHOTO_LADDER[i][0]));
      var cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      var ctx = cv.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) { ctx.imageSmoothingQuality = 'high'; }
      ctx.drawImage(img, 0, 0, w, h);
      var data = cv.toDataURL('image/jpeg', PHOTO_LADDER[i][1]);
      best = { data: data, w: w, h: h };
      if (dataUrlBytes(data) <= PHOTO_TARGET_BYTES) { return best; }
    }
    return best;
  }

  async function addPhotos(files) {
    var list = Array.prototype.slice.call(files || []);
    if (!list.length) { return; }
    var wk = currentWeek();
    var busy = qs('#photoBusy');
    var btn = qs('#btnAddPhoto');
    if (busy) { busy.hidden = false; }
    if (btn) { btn.disabled = true; }
    var added = 0;
    var failed = [];
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      try {
        var img = await readImageFile(f);
        var out = compressPhoto(img);
        wk.note.photos.push({
          id: 'p' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          data: out.data, caption: '', w: out.w, h: out.h
        });
        if (!flushSave()) {
          wk.note.photos.pop();
          flushSave();
          failed.push((f.name || '사진') + ' (저장 공간 부족)');
          break;
        }
        added++;
        renderNote();
        renderPreview();
      } catch (err) {
        failed.push(f && f.name ? f.name : '사진');
      }
    }
    if (busy) { busy.hidden = true; }
    if (btn) { btn.disabled = false; }
    renderNote();
    renderPreview();
    if (added && !failed.length) { toast('사진 ' + added + '장을 넣었습니다.'); }
    else if (added && failed.length) { toast('사진 ' + added + '장을 넣었습니다. ' + failed.length + '장은 넣지 못했습니다.'); }
    else if (failed.length) { toast('사진을 넣지 못했습니다: ' + failed.join(', ')); }
  }

  function renderPreview() {
    var wk = currentWeek();
    var html = '';
    html += '<tr class="spacer"><td colspan="4"></td></tr>';
    html += '<tr class="title"><td colspan="4"><p>' + escHtml(TITLE) + '</p>' +
      '<p>제출일: ' + escHtml(fmtSubmit(wk.submit)) + '</p></td></tr>';
    html += '<tr class="sec"><td colspan="4">' + escHtml(SEC1) + '</td></tr>';
    wk.days.forEach(function (d, i) {
      html += '<tr class="day"><td>' + escHtml(dateLabel(wk, i)) + '</td><td></td>' +
        '<td contenteditable="true" data-edit="day:' + i + '">' + escHtml(d.text).replace(/\n/g, '<br>') + '</td><td></td></tr>';
    });
    html += '<tr class="sec"><td colspan="4">' + escHtml(SEC2) + '</td></tr>';
    wk.visits.forEach(function (v, i) {
      html += '<tr class="visit"><td contenteditable="true" data-edit="vname:' + i + '">' + escHtml(v.name) + '</td><td></td>' +
        '<td contenteditable="true" data-edit="vtext:' + i + '">' + escHtml(v.text).replace(/\n/g, '<br>') + '</td><td></td></tr>';
    });
    /* 비고(메모·사진): 원본 표 디자인을 그대로 이어받은 섹션 머리행 + 메모 칸 + 사진 2열 */
    html += '<tr class="sec note-sec"><td colspan="4">' + escHtml(SEC3) + '</td></tr>';
    html += '<tr class="note"><td colspan="4" contenteditable="true" data-edit="note">' +
      escHtml(wk.note.memo).replace(/\n/g, '<br>') + '</td></tr>';
    if (wk.note.photos.length) {
      html += '<tr class="note-photo"><td colspan="4"><div class="pv-photos">';
      wk.note.photos.forEach(function (p, i) {
        html += '<figure class="pv-photo"><img src="' + escAttr(p.data) + '" alt="' +
          escAttr(p.caption || ('비고 사진 ' + (i + 1))) + '">' +
          (p.caption ? '<figcaption>' + escHtml(p.caption) + '</figcaption>' : '') + '</figure>';
      });
      html += '</div></td></tr>';
    }

    var blanks = Math.max(0, (TOTAL_ROWS - ROWS_BEFORE_VISITS) - wk.visits.length - noteRowCount(wk));
    for (var i = 0; i < blanks; i++) {
      html += '<tr class="blank"><td></td><td></td><td></td><td></td></tr>';
    }
    qs('#reportBody').innerHTML = html;
    fitPaper();
  }

  function renderAll() {
    renderWeekBar();
    renderQuickDates();
    renderLog();
    renderChips();
    renderVisit();
    renderNote();
    renderPreview();
    syncTopOffset();
  }

  /* 비고가 차지하는 표 행 수: 섹션 머리 + 메모 1행 + 사진 2열(2장당 1행) */
  function noteRowCount(wk) {
    var n = (wk && wk.note && wk.note.photos) ? wk.note.photos.length : 0;
    return 2 + (n ? Math.ceil(n / 2) : 0);
  }

  /* ------------------------------------------------------------------ *
   *  미리보기 배율
   * ------------------------------------------------------------------ */
  var zoomFit = true;
  function fitPaper() {
    var wrap = qs('#paperScroll');
    var paper = qs('#paper');
    var scaleWrap = qs('#paperScale');
    if (!wrap || !paper || !scaleWrap) { return; }
    var avail = wrap.clientWidth - 24;
    var w = paper.offsetWidth || 816;
    if (!w) { return; }
    var k = 1;
    if (zoomFit && avail > 80) { k = Math.min(1, avail / w); }
    if (k < 0.999) {
      paper.style.transform = 'scale(' + k + ')';
      scaleWrap.style.width = Math.round(w * k) + 'px';
      scaleWrap.style.height = Math.round(paper.offsetHeight * k) + 'px';
    } else {
      paper.style.transform = '';
      scaleWrap.style.width = w + 'px';
      scaleWrap.style.height = paper.offsetHeight + 'px';
    }
    qs('#btnZoom').textContent = zoomFit ? '100%' : '맞춤';
  }

  function syncTopOffset() {
    var tb = document.querySelector('.topbar');
    if (!tb) { return; }
    document.documentElement.style.setProperty('--topbar-h', tb.offsetHeight + 'px');
  }

  /* ------------------------------------------------------------------ *
   *  입력 처리
   * ------------------------------------------------------------------ */
  var dayList = qs('#dayList');
  dayList.addEventListener('input', function (e) {
    var t = e.target;
    if (t && t.matches && t.matches('textarea[data-day-text]')) {
      var i = Number(t.getAttribute('data-day-text'));
      currentWeek().days[i].text = t.value;
      var card = t.closest ? t.closest('.daycard') : null;
      var cnt = card ? card.querySelector('.count') : null;
      if (cnt) { cnt.textContent = t.value.length + '자'; }
      renderPreview();
      save();
    }
  });
  dayList.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.matches && t.matches('input[data-day-date]')) {
      var i = Number(t.getAttribute('data-day-date'));
      var v = t.value;
      if (!v) { return; }
      currentWeek().days[i].date = v;
      renderWeekBar();
      renderQuickDates();
      renderPreview();
      save();
      renderLog();
    }
  });

  var visitList = qs('#visitList');
  visitList.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.matches) { return; }
    var wk = currentWeek();
    if (t.matches('input[data-visit-name]')) {
      wk.visits[Number(t.getAttribute('data-visit-name'))].name = t.value;
      renderPreview(); save();
    } else if (t.matches('textarea[data-visit-text]')) {
      wk.visits[Number(t.getAttribute('data-visit-text'))].text = t.value;
      renderPreview(); save();
    }
  });
  visitList.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.matches || !t.matches('[data-visit-del]')) { return; }
    var i = Number(t.getAttribute('data-visit-del'));
    var wk = currentWeek();
    if (!wk.visits[i]) { return; }
    var name = wk.visits[i].name || '이 항목';
    if (wk.visits[i].text && !window.confirm('“' + name + '” 내용을 지웁니다. 계속할까요?')) { return; }
    wk.visits.splice(i, 1);
    renderVisit(); renderChips(); renderPreview(); save();
  });

  qs('#visitChips').addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.matches || !t.matches('[data-chip]')) { return; }
    var name = t.getAttribute('data-chip');
    var wk = currentWeek();
    if (wk.visits.some(function (v) { return v.name === name; })) { return; }
    wk.visits.push({ name: name, text: '' });
    renderVisit(); renderChips(); renderPreview(); save();
  });

  qs('#btnAddVisit').addEventListener('click', function () {
    var wk = currentWeek();
    wk.visits.push({ name: '', text: '' });
    renderVisit(); renderChips(); renderPreview(); save();
    var list = qs('#visitList');
    var inputs = list.querySelectorAll('input[data-visit-name]');
    if (inputs.length) { inputs[inputs.length - 1].focus(); }
  });

  /* 비고 메모 */
  qs('#noteMemo').addEventListener('input', function (e) {
    currentWeek().note.memo = e.target.value;
    renderPreview();
    save();
  });

  /* 비고 사진 */
  var filePhotos = qs('#filePhotos');
  qs('#btnAddPhoto').addEventListener('click', function () { filePhotos.click(); });
  filePhotos.addEventListener('change', function (e) {
    var files = e.target.files ? Array.prototype.slice.call(e.target.files) : [];
    e.target.value = '';
    if (files.length) { addPhotos(files); }
  });

  var photoList = qs('#photoList');
  photoList.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.matches || !t.matches('input[data-photo-caption]')) { return; }
    var p = findPhoto(t.getAttribute('data-photo-caption'));
    if (!p) { return; }
    p.caption = t.value;
    renderPreview();
    save();
  });
  photoList.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.matches || !t.matches('[data-photo-del]')) { return; }
    var wk = currentWeek();
    var id = t.getAttribute('data-photo-del');
    var idx = -1;
    wk.note.photos.forEach(function (p, i) { if (p.id === id) { idx = i; } });
    if (idx < 0) { return; }
    if (!window.confirm('이 사진(' + (idx + 1) + '번째)을 지웁니다. 계속할까요?')) { return; }
    wk.note.photos.splice(idx, 1);
    renderNote();
    renderPreview();
    save();
  });

  qs('#btnGoNote').addEventListener('click', function () { showTab('note'); });

  /* 빠른 기록 */
  qs('#qAdd').addEventListener('click', quickAdd);
  qs('#qText').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); quickAdd(); }
  });
  function quickAdd() {
    var input = qs('#qText');
    var txt = input.value.trim();
    if (!txt) { input.focus(); return; }
    var dt = qs('#qDate').value;
    var wk = currentWeek();
    var idx = -1;
    wk.days.forEach(function (d, i) { if (d.date === dt) { idx = i; } });
    if (idx < 0) { toast('이 주간에 없는 날짜입니다. 날짜 카드에서 직접 고쳐 주세요.'); return; }
    var cur = wk.days[idx].text;
    wk.days[idx].text = cur.trim() ? cur.replace(/[\s,]+$/, '') + ', ' + txt : txt;
    input.value = '';
    renderLog();
    renderPreview();
    save();
    input.focus();
  }

  /* 제출일 */
  qs('#submitDate').addEventListener('change', function (e) {
    var v = e.target.value;
    if (!v) { return; }
    currentWeek().submit = v;
    renderWeekBar();
    renderPreview();
    save();
  });

  /* 주 이동 */
  function gotoWeek(start) {
    state.current = start;
    currentWeek();
    flushSave();
    renderAll();
    setStatus('자동 저장됨', true);
  }
  qs('#prevWeek').addEventListener('click', function () { gotoWeek(addDays(state.current, -7)); });
  qs('#nextWeek').addEventListener('click', function () { gotoWeek(addDays(state.current, 7)); });
  qs('#thisWeek').addEventListener('click', function () { gotoWeek(thisWeekStart()); });
  qs('#weekLabel').addEventListener('click', function () { gotoWeek(thisWeekStart()); });

  /* 주간 날짜 다시 세팅 */
  qs('#btnFillWeek').addEventListener('click', function () {
    var wk = currentWeek();
    if (!window.confirm('이 주간 6일의 날짜를 ' + md(addDays(state.current, 0)) + '부터 화~주일로 다시 맞춥니다. 계속할까요?')) { return; }
    for (var i = 0; i < 6; i++) { wk.days[i].date = addDays(state.current, i); }
    wk.submit = wk.days[5].date;
    renderAll();
    save();
    toast('날짜를 화~주일로 다시 맞췄습니다.');
  });

  /* 보고서 표 안에서 바로 고치기 */
  var reportBody = qs('#reportBody');
  reportBody.addEventListener('input', function (e) {
    var td = e.target;
    if (td && td.matches && td.matches('td[contenteditable="true"]')) {
      commitCell(td);
      save();
    }
  });
  reportBody.addEventListener('focusout', function (e) {
    var td = e.target;
    if (!td || !td.matches || !td.matches('td[contenteditable="true"]')) { return; }
    commitCell(td);
    renderLog();
    renderVisit();
    renderNote();
    renderPreview();
    save();
  });
  function commitCell(td) {
    var key = td.getAttribute('data-edit');
    if (!key) { return; }
    var parts = key.split(':');
    var kind = parts[0];
    var idx = Number(parts[1]);
    var text = td.innerText != null ? td.innerText : td.textContent;
    text = text.replace(/\r/g, '').replace(/\n+$/, '');
    var wk = currentWeek();
    if (kind === 'day' && wk.days[idx]) { wk.days[idx].text = text; }
    else if (kind === 'vname' && wk.visits[idx]) { wk.visits[idx].name = text; }
    else if (kind === 'vtext' && wk.visits[idx]) { wk.visits[idx].text = text; }
    else if (kind === 'note') { wk.note.memo = text; }
  }

  /* 배율 */
  qs('#btnZoom').addEventListener('click', function () {
    zoomFit = !zoomFit;
    fitPaper();
  });

  /* 탭 */
  function showTab(t) {
    document.body.setAttribute('data-tab', t);
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (x) {
      x.classList.toggle('active', x.getAttribute('data-tab') === t);
    });
    if (t === 'preview') { setTimeout(fitPaper, 30); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
    b.addEventListener('click', function () { showTab(b.getAttribute('data-tab')); });
  });

  /* ------------------------------------------------------------------ *
   *  워드(.docx) 만들기 — 원본 양식 XML 치환
   * ------------------------------------------------------------------ */
  function childEls(node, localName) {
    var out = [];
    var kids = node.childNodes;
    for (var i = 0; i < kids.length; i++) {
      var n = kids[i];
      if (n.nodeType === 1 && n.localName === localName) { out.push(n); }
    }
    return out;
  }
  function descendants(node, localName) {
    return Array.prototype.slice.call(node.getElementsByTagNameNS(W_NS, localName));
  }
  function wEl(doc, tag) { return doc.createElementNS(W_NS, 'w:' + tag); }

  function setParagraphText(p, text) {
    var doc = p.ownerDocument;
    var runs = descendants(p, 'r');
    var rPr = runs.length ? childEls(runs[0], 'rPr')[0] : null;
    var rPrClone = rPr ? rPr.cloneNode(true) : null;
    runs.forEach(function (r) { p.removeChild(r); });
    if (text !== null && text !== undefined && text !== '') {
      var r = wEl(doc, 'r');
      if (rPrClone) { r.appendChild(rPrClone); }
      var t = wEl(doc, 't');
      t.setAttribute('xml:space', 'preserve');
      t.textContent = text;
      r.appendChild(t);
      p.appendChild(r);
    }
  }

  function fillCell(cell, lines) {
    var doc = cell.ownerDocument;
    var paras = childEls(cell, 'p');
    if (!paras.length) { return; }
    var proto = paras[0];
    var pPr = childEls(proto, 'pPr')[0];
    var pPrClone = pPr ? pPr.cloneNode(true) : null;
    var runs = descendants(proto, 'r');
    var rPr = runs.length ? childEls(runs[0], 'rPr')[0] : null;
    var rPrClone = rPr ? rPr.cloneNode(true) : null;
    paras.forEach(function (p) { cell.removeChild(p); });
    var arr = (lines && lines.length) ? lines : [''];
    arr.forEach(function (line) {
      var p = wEl(doc, 'p');
      if (pPrClone) { p.appendChild(pPrClone.cloneNode(true)); }
      if (line !== '') {
        var r = wEl(doc, 'r');
        if (rPrClone) { r.appendChild(rPrClone.cloneNode(true)); }
        var t = wEl(doc, 't');
        t.setAttribute('xml:space', 'preserve');
        t.textContent = line;
        r.appendChild(t);
        p.appendChild(r);
      }
      cell.appendChild(p);
    });
  }

  /* 행 안의 글자 크기를 원본 본문 크기(11pt = 22 half-points)로 맞춥니다.
     원본 양식의 일부 셀은 12pt로 되어 있어 그대로 복제하면 크기가 달라집니다. */
  function normalizeRowSize(row, half) {
    ['sz', 'szCs'].forEach(function (tag) {
      descendants(row, tag).forEach(function (el) { el.setAttributeNS(W_NS, 'w:val', String(half)); });
    });
  }

  /* ------------------------------------------------------------------ *
   *  비고란(메모·사진) — 원본 표 디자인을 이어받아 워드를 만듭니다
   * ------------------------------------------------------------------ */
  var XMLNS_DECL = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"' +
    ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"' +
    ' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"' +
    ' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"' +
    ' xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
  var TC_BORDER = '<w:tcBorders>' +
    '<w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>' +
    '<w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>' +
    '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>' +
    '<w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>' +
    '</w:tcBorders>';
  var BODY_RPR = '<w:rPr><w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorHAnsi" w:hAnsiTheme="majorHAnsi" w:hint="eastAsia"/>' +
    '<w:b/><w:bCs/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>';
  var CAP_RPR = '<w:rPr><w:rFonts w:eastAsiaTheme="minorHAnsi"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>';

  function xesc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function parseXmlFragment(xml) {
    var d = new DOMParser().parseFromString('<root ' + XMLNS_DECL + '>' + xml + '</root>', 'application/xml');
    if (d.getElementsByTagName('parsererror').length) { throw new Error('비고란 서식을 만들지 못했습니다.'); }
    return d.documentElement;
  }
  function appendXml(parent, xml) {
    var frag = parseXmlFragment(xml);
    var doc = parent.ownerDocument;
    Array.prototype.slice.call(frag.childNodes).forEach(function (n) {
      if (n.nodeType === 1) { parent.appendChild(doc.importNode(n, true)); }
    });
  }

  function memoP(text) {
    var body = text ? ('<w:r>' + BODY_RPR + '<w:t xml:space="preserve">' + xesc(text) + '</w:t></w:r>') : '';
    return '<w:p><w:pPr><w:pStyle w:val="a3"/><w:spacing w:before="20" w:after="20"/>' + BODY_RPR + '</w:pPr>' + body + '</w:p>';
  }
  function noteMemoRowXml(text) {
    var ps = textLines(text).map(memoP).join('');
    return '<w:tr><w:trPr><w:trHeight w:val="544"/></w:trPr><w:tc>' +
      '<w:tcPr><w:tcW w:w="10314" w:type="dxa"/><w:gridSpan w:val="4"/>' + TC_BORDER +
      '<w:vAlign w:val="center"/></w:tcPr>' + ps + '</w:tc></w:tr>';
  }

  /* 그림 한 장(inline) — EMU 크기로 넣어 워드·한컴·Pages에서 넘치지 않게 합니다. */
  function drawingXml(rel, cxEmu, cyEmu) {
    return '<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">' +
      '<wp:extent cx="' + cxEmu + '" cy="' + cyEmu + '"/>' +
      '<wp:effectExtent l="0" t="0" r="0" b="0"/>' +
      '<wp:docPr id="' + rel.docPr + '" name="' + xesc(rel.name) + '"/>' +
      '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
      '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:pic><pic:nvPicPr><pic:cNvPr id="' + rel.docPr + '" name="' + xesc(rel.name) + '"/><pic:cNvPicPr/></pic:nvPicPr>' +
      '<pic:blipFill><a:blip r:embed="' + rel.rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cxEmu + '" cy="' + cyEmu + '"/></a:xfrm>' +
      '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>' +
      '</a:graphicData></a:graphic></wp:inline></w:drawing>';
  }

  function photoCellXml(photo, rel) {
    var tcPr = '<w:tcPr><w:tcW w:w="5049" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>';
    if (!photo) { return '<w:tc>' + tcPr + '<w:p/></w:tc>'; }
    var maxW = 3.28, maxH = 3.4;   // in — 셀 안쪽 5049twips(약 3.37in) 안에 2열로
    var pw = Number(photo.w) || 4, ph = Number(photo.h) || 3;
    var ar = ph / pw;
    var win = maxW, hin = win * ar;
    if (hin > maxH) { hin = maxH; win = hin / ar; }
    var cx = Math.round(win * 914400), cy = Math.round(hin * 914400);
    var cap = photo.caption ? ('<w:r>' + CAP_RPR + '<w:t xml:space="preserve">' + xesc(photo.caption) + '</w:t></w:r>') : '';
    return '<w:tc>' + tcPr +
      '<w:p><w:pPr><w:spacing w:before="40" w:after="20"/><w:jc w:val="center"/></w:pPr>' +
      '<w:r>' + drawingXml(rel, cx, cy) + '</w:r></w:p>' +
      '<w:p><w:pPr><w:spacing w:before="0" w:after="60"/><w:jc w:val="center"/>' + CAP_RPR + '</w:pPr>' + cap + '</w:p>' +
      '</w:tc>';
  }

  function notePhotoRowXml(pair, rels) {
    var cells = photoCellXml(pair[0], rels[0]) + photoCellXml(pair[1] || null, rels[1] || null);
    var tbl = '<w:tbl><w:tblPr><w:tblW w:w="10098" w:type="dxa"/>' +
      '<w:tblBorders>' +
      '<w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>' +
      '<w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>' +
      '<w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>' +
      '</w:tblBorders>' +
      '<w:tblLayout w:type="fixed"/>' +
      '<w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="60" w:type="dxa"/>' +
      '<w:bottom w:w="0" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tblCellMar>' +
      '<w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="1" w:noVBand="1"/></w:tblPr>' +
      '<w:tblGrid><w:gridCol w:w="5049"/><w:gridCol w:w="5049"/></w:tblGrid>' +
      '<w:tr>' + cells + '</w:tr></w:tbl>';
    return '<w:tr><w:trPr><w:trHeight w:val="544"/></w:trPr><w:tc>' +
      '<w:tcPr><w:tcW w:w="10314" w:type="dxa"/><w:gridSpan w:val="4"/>' + TC_BORDER +
      '<w:vAlign w:val="center"/></w:tcPr>' + tbl +
      '<w:p><w:pPr><w:spacing w:before="0" w:after="0"/><w:rPr><w:sz w:val="6"/></w:rPr></w:pPr></w:p>' +
      '</w:tc></w:tr>';
  }

  /* 사진을 워드 패키지(word/media)·관계(rels)·콘텐츠 타입에 등록합니다. */
  async function registerImages(zip, photos) {
    var out = [];
    var relsFile = zip.file('word/_rels/document.xml.rels');
    var relsXml = relsFile ? await relsFile.async('string') :
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
    var addRel = '';
    photos.forEach(function (p, i) {
      var n = i + 1;
      var name = 'report_img_' + n + '.jpg';
      var b64 = String(p.data || '').split(',')[1] || '';
      if (!b64) { throw new Error('사진 ' + n + '번째 데이터가 비어 있습니다.'); }
      zip.file('word/media/' + name, b64, { base64: true });
      var rid = 'rId' + (100 + n);
      addRel += '<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + name + '"/>';
      out.push({ rid: rid, name: name, docPr: 900 + n });
    });
    if (addRel) {
      relsXml = relsXml.replace('</Relationships>', addRel + '</Relationships>');
      zip.file('word/_rels/document.xml.rels', relsXml);
    }
    var ctFile = zip.file('[Content_Types].xml');
    if (ctFile) {
      var ctXml = await ctFile.async('string');
      var add = '';
      if (!/Extension="jpe?g"/i.test(ctXml)) { add += '<Default Extension="jpg" ContentType="image/jpeg"/>'; }
      if (!/Extension="jpeg"/i.test(ctXml)) { add += '<Default Extension="jpeg" ContentType="image/jpeg"/>'; }
      if (add) { zip.file('[Content_Types].xml', ctXml.replace('</Types>', add + '</Types>')); }
    }
    return out;
  }

  async function buildDocx() {
    if (typeof JSZip === 'undefined') { throw new Error('압축 라이브러리를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'); }
    var res = await fetch('template.docx', { cache: 'no-store' });
    if (!res.ok) { throw new Error('원본 양식(template.docx)을 불러오지 못했습니다 (' + res.status + ')'); }
    var buf = await res.arrayBuffer();
    var zip = await JSZip.loadAsync(buf);
    var f = zip.file('word/document.xml');
    if (!f) { throw new Error('원본 양식 안에 document.xml이 없습니다.'); }
    var xmlStr = await f.async('string');
    var doc = new DOMParser().parseFromString(xmlStr, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) { throw new Error('원본 양식의 XML을 읽지 못했습니다.'); }
    var tbls = doc.getElementsByTagNameNS(W_NS, 'tbl');
    if (!tbls.length) { throw new Error('원본 양식에서 표를 찾지 못했습니다.'); }
    var tbl = tbls[0];
    var rows = childEls(tbl, 'tr');
    if (rows.length < 16) { throw new Error('원본 양식의 표 구조가 예상과 다릅니다.'); }

    var wk = currentWeek();

    // 1) 제목 + 제출일
    var titleCells = childEls(rows[1], 'tc');
    var titleParas = titleCells.length ? childEls(titleCells[0], 'p') : [];
    if (titleParas[0]) { setParagraphText(titleParas[0], TITLE); }
    if (titleParas[1]) { setParagraphText(titleParas[1], '제출일: ' + fmtSubmit(wk.submit)); }

    // 2) 날짜별 사역 6행
    for (var i = 0; i < 6; i++) {
      var row = rows[3 + i];
      if (!row) { continue; }
      var cells = childEls(row, 'tc');
      if (!cells.length) { continue; }
      fillCell(cells[0], [dateLabel(wk, i)]);
      if (cells[2]) { fillCell(cells[2], textLines(wk.days[i].text)); }
      if (cells[3]) { fillCell(cells[3], ['']); }
    }

    // 3) 심방 항목 행 + 빈 행
    var itemTpl = rows[12].cloneNode(true);
    var blankTpl = rows[15].cloneNode(true);
    rows.slice(10).forEach(function (r) { tbl.removeChild(r); });
    wk.visits.forEach(function (v) {
      var r = itemTpl.cloneNode(true);
      normalizeRowSize(r, 22);
      var cs = childEls(r, 'tc');
      fillCell(cs[0], v.name ? [v.name] : ['']);
      if (cs[2]) { fillCell(cs[2], textLines(v.text)); }
      tbl.appendChild(r);
    });
    // 4) 비고(메모 + 사진) — 원본 섹션 머리행(회색 25%)을 복제해 디자인을 잇습니다
    var note = wk.note;
    var photoRels = note.photos.length ? await registerImages(zip, note.photos) : [];
    var secTpl = rows[9].cloneNode(true);
    var secCells = childEls(secTpl, 'tc');
    var secP = secCells.length ? childEls(secCells[0], 'p')[0] : null;
    if (secP) { setParagraphText(secP, ' ' + SEC3); }
    tbl.appendChild(secTpl);
    appendXml(tbl, noteMemoRowXml(note.memo));
    for (var pi = 0; pi < note.photos.length; pi += 2) {
      appendXml(tbl, notePhotoRowXml(note.photos.slice(pi, pi + 2), photoRels.slice(pi, pi + 2)));
    }

    var blanks = Math.max(0, (TOTAL_ROWS - ROWS_BEFORE_VISITS) - wk.visits.length - noteRowCount(wk));
    for (var b = 0; b < blanks; b++) { tbl.appendChild(blankTpl.cloneNode(true)); }

    // 5) zip 다시 만들기
    try {
      doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:a', 'http://schemas.openxmlformats.org/drawingml/2006/main');
      doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:pic', 'http://schemas.openxmlformats.org/drawingml/2006/picture');
    } catch (e) { /* 직렬화할 때 자동으로 붙습니다 */ }
    var out = new XMLSerializer().serializeToString(doc);
    if (out.indexOf('<?xml') !== 0) {
      out = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + out;
    }
    zip.file('word/document.xml', out);
    return await zip.generateAsync({
      type: 'blob',
      mimeType: DOCX_MIME,
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
      if (a.parentNode) { a.parentNode.removeChild(a); }
    }, 5000);
  }

  var busy = false;
  async function saveDocx() {
    if (busy) { return; }
    busy = true;
    var btn = qs('#btnDocx');
    var btn2 = qs('#btnDocx2');
    var old = btn ? btn.textContent : '';
    if (btn) { btn.textContent = '만드는 중…'; }
    if (btn2) { btn2.disabled = true; }
    try {
      flushSave();
      var blob = await buildDocx();
      downloadBlob(blob, '사역보고서_' + currentWeek().submit + '.docx');
      toast('워드 파일을 만들었습니다. 다운로드 폴더를 확인해 주세요.');
    } catch (err) {
      toast('워드 저장 실패: ' + (err && err.message ? err.message : err));
    } finally {
      busy = false;
      if (btn) { btn.textContent = old; }
      if (btn2) { btn2.disabled = false; }
    }
  }
  qs('#btnDocx').addEventListener('click', saveDocx);
  qs('#btnDocx2').addEventListener('click', saveDocx);

  /* 인쇄 / PDF */
  function printReport() {
    flushSave();
    if (document.activeElement && document.activeElement.blur) { document.activeElement.blur(); }
    document.title = '사역보고서_' + fmtSubmit(currentWeek().submit);
    window.print();
    setTimeout(function () { document.title = '사역보고서 · 유효석 목사'; }, 1500);
  }
  qs('#btnPrint').addEventListener('click', printReport);
  qs('#btnPrint2').addEventListener('click', printReport);

  /* ------------------------------------------------------------------ *
   *  이메일
   * ------------------------------------------------------------------ */
  function buildSubject() {
    var wk = currentWeek();
    return TITLE + ' (' + md(wk.days[0].date) + '~' + md(wk.days[5].date) + ')';
  }
  function buildBody() {
    var wk = currentWeek();
    var out = [];
    out.push(TITLE);
    out.push('제출일: ' + fmtSubmit(wk.submit) + '  (' + koreanRange(wk.days[0].date, wk.days[5].date) + ')');
    out.push('');
    out.push('■ ' + SEC1);
    wk.days.forEach(function (d) {
      var t = String(d.text || '').trim();
      out.push('· ' + md(d.date) + '(' + wdName(d.date) + ') ' + (t ? t.replace(/\n/g, ' / ') : '-'));
    });
    out.push('');
    out.push('■ ' + SEC2);
    var any = false;
    wk.visits.forEach(function (v) {
      var name = String(v.name || '').trim();
      var t = String(v.text || '').trim();
      if (!name && !t) { return; }
      any = true;
      out.push('· ' + (name || '(항목)'));
      if (t) { t.split('\n').forEach(function (l) { out.push('   ' + l); }); }
    });
    if (!any) { out.push('(없음)'); }

    var memo = String(wk.note.memo || '').trim();
    var photos = wk.note.photos.length;
    if (memo || photos) {
      out.push('');
      out.push('■ 비고');
      if (memo) { memo.split('\n').forEach(function (l) { out.push(l.trim() ? '· ' + l : ''); }); }
      if (photos) { out.push('(비고 사진 ' + photos + '장은 워드/PDF 파일에 포함)'); }
    }
    return out.join('\n');
  }

  function openMail() {
    var wk = currentWeek();
    qs('#mailTo').value = state.settings.to || '';
    qs('#mailCc').value = state.settings.cc || '';
    qs('#mailSubject').value = buildSubject();
    qs('#mailBody').value = buildBody();
    qs('#mailModal').hidden = false;
  }
  function closeMail() { qs('#mailModal').hidden = true; }
  qs('#btnMail').addEventListener('click', openMail);
  qs('#mailClose').addEventListener('click', closeMail);
  qs('#mailModal').addEventListener('click', function (e) {
    if (e.target === qs('#mailModal')) { closeMail(); }
  });
  function rememberRecipients() {
    state.settings.to = qs('#mailTo').value.trim();
    state.settings.cc = qs('#mailCc').value.trim();
    save();
  }
  qs('#mailTo').addEventListener('change', rememberRecipients);
  qs('#mailCc').addEventListener('change', rememberRecipients);

  qs('#copySubject').addEventListener('click', function () {
    copyText(qs('#mailSubject').value, '제목을 복사했습니다.');
  });
  qs('#copyBody').addEventListener('click', function () {
    copyText(qs('#mailBody').value, '본문을 복사했습니다.');
  });
  qs('#openMail').addEventListener('click', function () {
    rememberRecipients();
    var to = qs('#mailTo').value.trim();
    var cc = qs('#mailCc').value.trim();
    var subj = qs('#mailSubject').value;
    var body = qs('#mailBody').value.replace(/\n/g, '\r\n');
    var url = 'mailto:' + encodeURIComponent(to) + '?' +
      (cc ? 'cc=' + encodeURIComponent(cc) + '&' : '') +
      'subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
    window.location.href = url;
  });

  function copyText(txt, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { toast(okMsg); }, function () { fallbackCopy(txt, okMsg); });
    } else {
      fallbackCopy(txt, okMsg);
    }
  }
  function fallbackCopy(txt, msg) {
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      toast(msg);
    } catch (e) {
      toast('복사하지 못했습니다. 내용을 직접 선택해 주세요.');
    }
    document.body.removeChild(ta);
  }

  /* ------------------------------------------------------------------ *
   *  JSON 백업 / 복원
   * ------------------------------------------------------------------ */
  function snapshot() {
    try {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(LS_KEY + '-snapshot-') === 0) { keys.push(k); }
      }
      keys.sort();
      while (keys.length >= 3) { localStorage.removeItem(keys.shift()); }
      localStorage.setItem(LS_KEY + '-snapshot-' + Date.now(), JSON.stringify(state));
    } catch (e) { /* 저장 공간이 없으면 건너뜀 */ }
  }

  qs('#btnBackup').addEventListener('click', function () {
    flushSave();
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    downloadBlob(blob, '사역보고서_백업_' + todayISO() + '.json');
    toast('백업 파일을 내려받았습니다.');
  });

  qs('#btnRestore').addEventListener('click', function () { qs('#fileRestore').click(); });
  qs('#fileRestore').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) { return; }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var p = JSON.parse(String(reader.result));
        if (!p || typeof p !== 'object' || !p.weeks || typeof p.weeks !== 'object') {
          throw new Error('사역보고서 백업 파일이 아닙니다.');
        }
        snapshot();
        Object.keys(p.weeks).forEach(function (k) {
          state.weeks[k] = p.weeks[k];
          normalizeWeek(k);
        });
        if (p.settings && typeof p.settings === 'object') { state.settings = p.settings; }
        if (p.current && state.weeks[p.current]) { state.current = p.current; }
        if (!state.weeks[state.current]) { state.current = thisWeekStart(); }
        currentWeek();
        flushSave();
        renderAll();
        toast('백업을 복원했습니다 (' + Object.keys(p.weeks).length + '주). 복원 전 자료는 따로 보관했습니다.');
      } catch (err) {
        toast('복원 실패: ' + (err && err.message ? err.message : err));
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  /* ------------------------------------------------------------------ *
   *  토스트
   * ------------------------------------------------------------------ */
  var toastTimer = null;
  function toast(msg) {
    var el = qs('#toast');
    el.textContent = msg;
    el.hidden = false;
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () { el.hidden = true; }, 3200);
  }

  /* ------------------------------------------------------------------ *
   *  시작
   * ------------------------------------------------------------------ */
  window.addEventListener('resize', function () { syncTopOffset(); fitPaper(); });
  window.addEventListener('orientationchange', function () { setTimeout(function () { syncTopOffset(); fitPaper(); }, 200); });
  window.addEventListener('beforeprint', function () {
    if (document.activeElement && document.activeElement.blur) { document.activeElement.blur(); }
  });

  load();
  renderAll();
  setTimeout(fitPaper, 120);
  if (window.ResizeObserver) {
    try {
      new ResizeObserver(function () { fitPaper(); }).observe(qs('#paperScroll'));
    } catch (e) { /* 무시 */ }
  }
})();
