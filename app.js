(function () {
  'use strict';

  var DEFAULT = window.MINISTRY_DATA;
  var DB_KEY = 'ministry-weekly-v1';
  var UI_KEY = 'ministry-weekly-ui-v1';
  var SECTIONS = DEFAULT.sections;
  var STATUS_FIELDS = DEFAULT.statusFields;
  var STATUS_OPTIONS = DEFAULT.statusOptions;
  var WD = ['주일', '월', '화', '수', '목', '금', '토'];
  var DAY_FULL = ['주일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  var ICON = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.6 6.6h11M8.6 12h11M8.6 17.4h11"/><path d="M4.4 6.6h.01M4.4 12h.01M4.4 17.4h.01"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 9.6h17M8 3.6v3M16 3.6v3"/><path d="M7.6 13h2.2M13.9 13h2.2M7.6 16.6h2.2M13.9 16.6h2.2"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.4A1.9 1.9 0 0 1 5.9 3.5H11v15.4H5.9A1.9 1.9 0 0 0 4 20.8z"/><path d="M20 5.4a1.9 1.9 0 0 0-1.9-1.9H13v15.4h5.1a1.9 1.9 0 0 1 1.9 1.9z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9.6M9.3 19V4.8M14.7 19v-6.4M20 19V7.4"/></svg>',
    archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.6" y="4.4" width="16.8" height="4.6" rx="1.4"/><path d="M5.2 9v9.2a1.6 1.6 0 0 0 1.6 1.6h10.4a1.6 1.6 0 0 0 1.6-1.6V9"/><path d="M10 13.2h4"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.1"/><path d="M12 3.6v2M12 18.4v2M4.6 12h2M17.4 12h2M6.8 6.8l1.4 1.4M15.8 15.8l1.4 1.4M17.2 6.8l-1.4 1.4M8.2 15.8l-1.4 1.4"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="6.3"/><path d="M15.4 15.4 20 20"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 5.2v13.6M5.2 12h13.6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8.6" y="8.6" width="11" height="11" rx="2.2"/><path d="M15.4 5.4H6.6a1.6 1.6 0 0 0-1.6 1.6v8.8"/></svg>',
    template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.2" y="4.4" width="15.6" height="15.2" rx="2.2"/><path d="M4.2 9.4h15.6M9.4 9.4v10.2"/></svg>',
    arrow: '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-3.6-3.6M12 15l3.6-3.6M5 19h14"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5m0 0L8.4 8.6M12 5l3.6 3.6M5 19h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.8 9.6 17.4 19 7.4"/></svg>'
  };

  /* ---------------- storage ---------------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* data.js에 새로 추가된 설교만 저장된 목록 뒤에 덧붙입니다.
     이미 저장된 설교는 편집 내용·진행 상태·휴지통 여부를 그대로 두고 건드리지 않으며,
     완전히 지운 설교는 retiredSermons에 남겨 새 데이터로 다시 생겨나지 않게 합니다. */
  function mergeSermons(saved, defaults, retired) {
    var list = saved.slice();
    var known = {}, gone = {};
    list.forEach(function (s) { if (s && s.id) known[s.id] = true; });
    (retired || []).forEach(function (id) { gone[id] = true; });
    var added = 0;
    (defaults || []).forEach(function (s) {
      if (!s || !s.id || known[s.id] || gone[s.id]) return;
      list.push(clone(s));
      known[s.id] = true;
      added += 1;
    });
    return { list: list, added: added };
  }

  function loadDb() {
    var base = { version: DEFAULT.version, sermons: clone(DEFAULT.sermons), routines: clone(DEFAULT.routines), dayPlan: clone(DEFAULT.dayPlan), daily: clone(DEFAULT.daily), entries: clone(DEFAULT.entries || []), retiredSermons: [] };
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (!raw) return base;
      var p = JSON.parse(raw);
      if (!p || !Array.isArray(p.sermons)) return base;
      var retired = Array.isArray(p.retiredSermons) ? p.retiredSermons : [];
      var merged = mergeSermons(p.sermons, DEFAULT.sermons, retired);
      var out = {
        version: p.version || DEFAULT.version,
        sermons: merged.list,
        routines: p.routines || base.routines,
        dayPlan: p.dayPlan || base.dayPlan,
        daily: p.daily || base.daily,
        entries: Array.isArray(p.entries) ? p.entries : [],
        retiredSermons: retired
      };
      /* 새 설교를 실제로 덧붙였을 때만 저장해, 다음 방문에서도 같은 결과가 유지되게 합니다. */
      if (merged.added) { try { localStorage.setItem(DB_KEY, JSON.stringify(out)); } catch (e) {} }
      return out;
    } catch (e) { return base; }
  }

  function loadUi() {
    var def = { tab: 'library', view: 'list', selectedId: null, weekStart: weekStartISO(todayISO()), search: '', filter: '전체 상태', section: 'analysis', scheduleView: 'list', calMonth: '', calDay: '', arcYear: '전체', arcService: '전체', arcQ: '', arcId: null };
    try {
      var raw = localStorage.getItem(UI_KEY);
      if (!raw) return def;
      var p = JSON.parse(raw);
      for (var k in def) if (p[k] === undefined) p[k] = def[k];
      if (p.weekStart) p.weekStart = weekStartISO(p.weekStart);
      if (p.scheduleView !== 'calendar' && p.scheduleView !== 'list') p.scheduleView = 'list';
      if (typeof p.calMonth !== 'string') p.calMonth = '';
      if (typeof p.calDay !== 'string') p.calDay = '';
      return p;
    } catch (e) { return def; }
  }

  var db = loadDb();
  var ui = loadUi();

  var saveTimer = null;
  function saveDb(immediate) {
    clearTimeout(saveTimer);
    var run = function () {
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        var t = new Date();
        setSaveState('자동 저장됨 · ' + pad(t.getHours()) + ':' + pad(t.getMinutes()));
      } catch (e) {
        setSaveState('저장 공간이 부족합니다 — JSON 백업을 받아 두세요');
      }
    };
    if (immediate) run(); else saveTimer = setTimeout(run, 320);
  }
  function saveUi() {
    try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch (e) {}
  }
  function setSaveState(txt) {
    var el = document.getElementById('saveState');
    if (el) el.textContent = txt;
  }

  /* ---------------- dates ---------------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayISO() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) { return fmt(new Date()); }
  }
  function parseISO(s) { var p = String(s).split('-'); return new Date(+p[0], (+p[1]) - 1, +p[2]); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  /* 주간 기준: 월요일 시작 ~ 주일 종료 */
  function weekOffset(day) { return (day + 6) % 7; }
  function weekStartISO(iso) { var d = parseISO(iso); d.setDate(d.getDate() - weekOffset(d.getDay())); return fmt(d); }
  function weekEndISO(startIso) { return fmt(addDays(parseISO(startIso), 6)); }
  function weekLabel(startIso) {
    var s = parseISO(startIso), e = addDays(s, 6);
    return s.getFullYear() + '. ' + pad(s.getMonth() + 1) + '.' + pad(s.getDate()) + ' – ' + pad(e.getMonth() + 1) + '.' + pad(e.getDate());
  }
  function weekdayOf(iso) { return WD[parseISO(iso).getDay()]; }
  function dateLabel(iso) { var d = parseISO(iso); return (d.getMonth() + 1) + '.' + d.getDate(); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- data helpers ---------------- */
  function liveSermons() { return db.sermons.filter(function (s) { return !s.deleted; }); }
  function trashedSermons() { return db.sermons.filter(function (s) { return s.deleted; }); }
  function byDate(a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }
  function weekSermons(startIso) {
    var start = startIso || ui.weekStart, end = fmt(addDays(parseISO(start), 6));
    return liveSermons().filter(function (s) { return s.date >= start && s.date <= end; }).sort(byDate);
  }
  function sermonById(id) { return db.sermons.filter(function (s) { return s.id === id; })[0] || null; }
  function statusOf(s, key) { return (s.status && s.status[key]) || '시작 전'; }
  function overall(s) {
    var vals = STATUS_FIELDS.map(function (f) { return statusOf(s, f.id); });
    if (vals.every(function (v) { return v === '완료'; })) return '완료';
    if (vals.indexOf('진행 중') > -1) return '진행 중';
    if (vals.indexOf('추가 확인 필요') > -1) return '추가 확인 필요';
    return '시작 전';
  }
  function progress(s) {
    var w = { '완료': 1, '진행 중': 0.5, '추가 확인 필요': 0, '시작 전': 0 };
    var sum = 0;
    STATUS_FIELDS.forEach(function (f) { sum += (w[statusOf(s, f.id)] || 0); });
    return Math.round((sum / STATUS_FIELDS.length) * 100);
  }
  function reviewedCount(s) {
    var n = 0; SECTIONS.forEach(function (sec) { if (s.reviewed && s.reviewed[sec.id]) n++; }); return n;
  }
  function matchesFilter(s) {
    if (ui.filter !== '전체 상태' && overall(s) !== ui.filter) return false;
    var q = (ui.search || '').trim().toLowerCase();
    if (!q) return true;
    var hay = [s.title, s.passage, s.theme, s.message, s.central, s.series].join(' ').toLowerCase();
    if (hay.indexOf(q) > -1) return true;
    for (var i = 0; i < SECTIONS.length; i++) {
      var t = (s.sections && s.sections[SECTIONS[i].id]) || '';
      if (t.toLowerCase().indexOf(q) > -1) return true;
    }
    return false;
  }
  function chipClass(v) { return 'chip ' + String(v).replace(/ /g, '-'); }
  function dotClass(v) { return String(v).replace(/ /g, '-'); }

  /* ---------------- sections / editor ---------------- */
  var HEAD_RES = [
    /^[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]\.\s/,
    /^\d{1,2}\.\s/,
    /^\d{1,2}\)\s/,
    /^원어 해석/,
    /^(첫째|둘째|셋째|넷째|다섯째|여섯째|일곱째|여덟째),/,
    /^[①②③④⑤⑥⑦⑧⑨⑩]/,
    /^[가-힣]{2,8} 대지/
  ];
  function isHead(t) {
    if (t.length > 92) return false;
    for (var i = 0; i < HEAD_RES.length; i++) if (HEAD_RES[i].test(t)) return true;
    return false;
  }
  function paintSection(el, text) {
    el.innerHTML = '';
    var blocks = String(text || '').split(/\n{2,}/);
    blocks.forEach(function (b) {
      var t = b.replace(/\u00a0/g, ' ').trim();
      if (!t) return;
      var node;
      if (isHead(t)) { node = document.createElement('h4'); node.textContent = t; }
      else if (t.charAt(0) === '·') { node = document.createElement('p'); node.className = 'bullet'; node.textContent = t; }
      else { node = document.createElement('p'); node.textContent = t; }
      el.appendChild(node);
    });
  }
  function readEditor(el) {
    return el.innerText.replace(/\u00a0/g, ' ')
      .split('\n').map(function (s) { return s.trim(); })
      .filter(Boolean).join('\n\n');
  }

  /* ---------------- shell ---------------- */
  var TAB_TITLES = { board: '주간 보드', schedule: '일정', library: '설교 서재', archive: '과거 설교', progress: '진행률', review: '연결 및 검토' };
  var TAB_ICONS = { board: ICON.grid, schedule: ICON.calendar, library: ICON.book, archive: ICON.archive, progress: ICON.chart, review: ICON.gear };

  function buildNav() {
    var nav = document.getElementById('nav');
    Array.prototype.forEach.call(nav.querySelectorAll('.nav-item'), function (btn) {
      var tab = btn.getAttribute('data-tab');
      btn.innerHTML = TAB_ICONS[tab] + '<span class="label">' + TAB_TITLES[tab] + '</span>' +
        (tab === 'library' ? '<span class="badge" id="libBadge">0</span>' : '') +
        (tab === 'archive' ? '<span class="badge" id="arcBadge">–</span>' : '');
      btn.addEventListener('click', function () {
        ui.tab = tab;
        if (tab === 'library' && ui.view === 'detail' && !sermonById(ui.selectedId)) ui.view = 'list';
        closeDrawer();
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }
  function syncNav() {
    Array.prototype.forEach.call(document.querySelectorAll('.nav-item'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === ui.tab);
    });
    var badge = document.getElementById('libBadge');
    if (badge) badge.textContent = String(weekSermons().length);
    var c = document.getElementById('crumbCurrent');
    if (c) c.textContent = TAB_TITLES[ui.tab];
  }
  function openDrawer() {
    document.getElementById('sidebar').classList.add('open');
    var o = document.getElementById('overlay'); o.hidden = false;
  }
  function closeDrawer() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').hidden = true;
  }

  function heroHTML() {
    return '<section class="hero"><div class="hero-inner">' +
      '<div><p class="eyebrow">Ministry Workspace</p>' +
      '<h1>말씀을 깊이, 준비를 차근차근.</h1>' +
      '<p class="lead">확인된 정보와 나의 기록을 바탕으로 사역을 이어갑니다.</p></div>' +
      '<button type="button" class="btn-primary" id="newSermonTop">' + ICON.plus + '새 설교 준비</button>' +
      '</div></section>';
  }

  function toolbarHTML() {
    var opts = ['전체 상태'].concat(STATUS_OPTIONS).map(function (o) {
      return '<option value="' + esc(o) + '"' + (ui.filter === o ? ' selected' : '') + '>' + esc(o) + '</option>';
    }).join('');
    return '<div class="weekbar">' +
      '<div class="week-nav">' +
      '<button type="button" id="weekPrev" aria-label="이전 주">' + ICON.chevL + '</button>' +
      '<span class="week-range" id="weekRange">' + weekLabel(ui.weekStart) + '</span>' +
      '<button type="button" id="weekNext" aria-label="다음 주">' + ICON.chevR + '</button>' +
      '</div>' +
      '<button type="button" class="pill' + (ui.weekStart === weekStartISO(todayISO()) ? ' on' : '') + '" id="thisWeek">이번 주</button>' +
      '<div class="weekbar-right">' +
      '<label class="search">' + ICON.search + '<input type="search" id="searchInput" placeholder="제목, 본문, 할 일 검색" value="' + esc(ui.search) + '"></label>' +
      '<select class="status-select" id="statusFilter" aria-label="상태 필터">' + opts + '</select>' +
      '</div></div>';
  }

  /* ---------------- list view ---------------- */
  function listRowsHTML() {
    var items = weekSermons().filter(matchesFilter);
    if (!items.length) {
      return '<div class="empty"><strong>이 주에는 조건에 맞는 설교가 없습니다</strong>' +
        '주차를 옮기거나 검색어·상태 필터를 바꿔 보세요. 새 설교는 오른쪽 위에서 준비할 수 있습니다.</div>';
    }
    return items.map(function (s) {
      var chips = STATUS_FIELDS.map(function (f) {
        var v = statusOf(s, f.id);
        return '<span class="' + chipClass(v) + '" title="' + esc(f.label) + ': ' + esc(v) + '">' + esc(shortField(f.label)) + ' ' + esc(v) + '</span>';
      }).join('');
      var p = progress(s);
      return '<button type="button" class="sermon-row" data-id="' + esc(s.id) + '">' +
        '<div class="date-block"><div class="d">' + dateLabel(s.date) + '</div><div class="w">' + weekdayOf(s.date) + '</div></div>' +
        '<div class="sermon-main">' +
        '<h3>' + esc(s.title || '제목 없는 설교') + '</h3>' +
        '<div class="meta"><span class="ref">' + esc(s.passage || '본문 미정') + '</span>' +
        (s.central ? '<span>중심 ' + esc(s.central) + '</span>' : '') +
        '<span>' + reviewedCount(s) + '/8 검토</span></div>' +
        (s.message ? '<div class="msg">' + esc(s.message) + '</div>' : '') +
        '<div class="chips">' + chips + '</div>' +
        '<div class="row-dots">' + STATUS_FIELDS.map(function (f) {
          return '<i class="' + dotClass(statusOf(s, f.id)) + '"></i>';
        }).join('') + '</div>' +
        '</div>' +
        '<div class="mini-bar"><i style="width:' + p + '%"></i></div>' +
        ICON.arrow +
        '</button>';
    }).join('');
  }
  function shortField(label) {
    return label.replace(' 상태', '').replace('성경공부 교재', '교재');
  }

  function listHTML() {
    var count = weekSermons().filter(matchesFilter).length;
    return '<div class="card">' +
      '<div class="list-head"><h2>설교 서재</h2><span class="count" id="listCount">' + count + '편 · ' + weekLabel(ui.weekStart) + '</span>' +
      '<div class="head-actions"><button type="button" class="ghost small" id="newSermonBtn">' + ICON.template + '<span class="lbl">빈 템플릿 복제</span></button></div></div>' +
      '<div id="listRows">' + listRowsHTML() + '</div>' +
      '</div>';
  }

  /* ---------------- detail view ---------------- */
  function detailHTML(s) {
    if (!s) return '<div class="empty"><strong>설교를 찾을 수 없습니다</strong>서재 목록에서 다시 선택해 주세요.</div>';
    var fields = '<div class="field-grid">' +
      '<label class="field"><span>설교 제목</span><input id="fTitle" type="text" value="' + esc(s.title) + '" placeholder="설교 제목을 적어 주세요"></label>' +
      '<label class="field"><span>성경 본문</span><input id="fPassage" type="text" value="' + esc(s.passage) + '" placeholder="예: 시편 25편 1-22절"></label>' +
      '<label class="field"><span>설교 날짜</span><input id="fDate" type="date" value="' + esc(s.date) + '"></label>' +
      '</div>';
    var statuses = '<div class="status-grid">' + STATUS_FIELDS.map(function (f) {
      var v = statusOf(s, f.id);
      var opts = STATUS_OPTIONS.map(function (o) {
        return '<option value="' + esc(o) + '"' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>';
      }).join('');
      return '<label class="status-field"><span>' + esc(f.label) + '</span>' +
        '<select data-field="' + f.id + '" data-status="' + esc(v) + '">' + opts + '</select></label>';
    }).join('') + '</div>';

    var gen = '<div class="gen-bar">' +
      '<div class="gen-head"><strong>자료 자동 생성</strong><span>효석패턴6 여덟 구성을 읽어 PPT·교재·기도문·말씀카드까지 만들어 드립니다</span></div>' +
      '<div class="gen-actions">' +
      '<button type="button" class="gen-btn" id="genPpt"><span class="ico">📊</span><span class="tx"><strong>PPT 만들기 (.pptx)</strong><small>표지부터 기도·찬송까지 8장</small></span></button>' +
      '<button type="button" class="gen-btn" id="genStudy"><span class="ico">📖</span><span class="tx"><strong>성경공부 교재 만들기</strong><small>인쇄 · PDF · 복사</small></span></button>' +
      '<button type="button" class="gen-btn" id="genPrayer"><span class="ico">🙏</span><span class="tx"><strong>기도문 만들기</strong><small>예배 · 소그룹용</small></span></button>' +
      '<button type="button" class="gen-btn" id="genCard"><span class="ico">🖼️</span><span class="tx"><strong>말씀 묵상카드 만들기</strong><small>정사각 1080 · PNG 저장</small></span></button>' +
      '</div></div>';

    var outline = '<div class="outline-list">' + SECTIONS.map(function (sec) {
      var done = !!(s.reviewed && s.reviewed[sec.id]);
      return '<button type="button" class="outline-item' + (ui.section === sec.id ? ' active' : '') + (done ? ' reviewed' : '') + '" data-section="' + sec.id + '">' +
        '<span class="num">' + sec.no + '</span><span class="label">' + esc(sec.name) + '</span><span class="dot"></span></button>';
    }).join('') + '</div>';

    return '<div class="card">' +
      '<div class="card-head">' +
      '<button type="button" class="link-back" id="backToList">' + ICON.chevL + '서재 목록</button>' +
      '<div class="head-actions">' +
      '<button type="button" class="ghost small" id="dupTemplate">' + ICON.template + '<span class="lbl">빈 템플릿 복제</span></button>' +
      '<button type="button" class="ghost small" id="reuseContent">' + ICON.copy + '<span class="lbl">내용 재사용</span></button>' +
      '</div></div>' +
      '<div class="delete-row"><button type="button" class="danger-ghost" id="deleteSermon">이 설교 삭제</button>' +
      '<span>휴지통으로 이동하며 언제든 복원할 수 있습니다.</span></div>' +
      fields + statuses + gen +
      '<div class="detail-body">' +
      '<div class="outline-pane"><div class="pane-title">효석패턴6 · 고정 구성</div>' + outline + '</div>' +
      '<div class="editor-pane">' +
      '<div class="editor-head"><h2 id="sectionTitle">' + esc(currentSection().name) + '</h2>' +
      '<label class="check"><input type="checkbox" id="reviewCheck"' + ((s.reviewed && s.reviewed[ui.section]) ? ' checked' : '') + '> 검토 완료</label></div>' +
      '<div class="editor" id="editor" contenteditable="true" spellcheck="false" data-placeholder="이 구성은 아직 비어 있습니다. 여기에 준비 내용을 적어 두세요."></div>' +
      '<div class="editor-foot"><span id="charCount"></span><span>' + esc(s.passage || '본문 미정') + ' · ' + esc(s.date) + '</span></div>' +
      '</div></div></div>';
  }
  function currentSection() {
    return SECTIONS.filter(function (s) { return s.id === ui.section; })[0] || SECTIONS[0];
  }

  /* ---------------- board ---------------- */
  function boardHTML() {
    var items = weekSermons().filter(matchesFilter);
    var cols = STATUS_OPTIONS;
    var grid = '<div class="board">' + cols.map(function (col) {
      var list = items.filter(function (s) { return overall(s) === col; });
      var cards = list.map(function (s) {
        var dots = STATUS_FIELDS.map(function (f) { return '<i class="' + dotClass(statusOf(s, f.id)) + '"></i>'; }).join('');
        return '<button type="button" class="board-card" data-id="' + esc(s.id) + '">' +
          '<div class="bdate">' + esc(dateLabel(s.date)) + ' ' + weekdayOf(s.date) + ' · ' + progress(s) + '%</div>' +
          '<h4>' + esc(s.title || '제목 없는 설교') + '</h4>' +
          '<div class="ref">' + esc(s.passage || '본문 미정') + '</div>' +
          '<div class="dots">' + dots + '</div></button>';
      }).join('');
      return '<div class="board-col"><h3>' + esc(col) + '<span class="n">' + list.length + '</span></h3>' +
        (cards || '<p class="board-col-empty">해당하는 설교가 없습니다.</p>') + '</div>';
    }).join('') + '</div>';
    return '<div id="boardWrap">' + grid +
      '<div class="board-hint">카드의 네 칸은 왼쪽부터 원고 · 교재 · PPT · 기도문이며, 칸을 누르면 그 설교의 여덟 구성을 엽니다.</div></div>';
  }

  /* ---------------- schedule ---------------- */
  var TIME_RANK = { '새벽': -100, '': -60, '오전': 600, '오후': 780 };
  var ENTRY_KINDS = [
    { id: 'worship', label: '예배' },
    { id: 'study', label: '성경공부' },
    { id: 'review', label: '검토' },
    { id: 'shorts', label: '쇼츠' },
    { id: 'blog', label: '블로그' },
    { id: 'podcast', label: '팟캐스트' },
    { id: 'docx', label: '설교원고' },
    { id: 'pdf', label: '강단 PDF' },
    { id: 'report', label: '보고' },
    { id: 'rest', label: '쉼' },
    { id: 'custom', label: '기타' }
  ];
  function timeRank(t) {
    if (TIME_RANK[t] !== undefined) return TIME_RANK[t];
    var m = /^(\d{1,2}):(\d{2})$/.exec(t);
    return m ? (+m[1]) * 60 + (+m[2]) : 999;
  }
  function entryById(id) {
    return (db.entries || []).filter(function (e) { return e.id === id; })[0] || null;
  }
  function entriesOn(iso) {
    return (db.entries || []).filter(function (e) { return e.date === iso; }).sort(function (a, b) {
      var d = timeRank(a.time) - timeRank(b.time);
      if (d) return d;
      var x = a.createdAt || '', y = b.createdAt || '';
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }
  function entryRowHTML(e) {
    return '<div class="day-item entry' + (e.done ? ' done' : '') + '">' +
      '<div class="t">' + esc(e.time || '—') + '</div>' +
      '<div class="c"><div class="l">' +
      '<input type="checkbox" class="tick" data-entry-check="' + esc(e.id) + '"' + (e.done ? ' checked' : '') + ' aria-label="완료 표시">' +
      '<span class="entry-title">' + esc(e.title) + '</span>' +
      '<span class="kind ' + esc(e.kind || 'custom') + '">' + kindLabel(e.kind) + '</span>' +
      '<span class="entry-acts">' +
      '<button type="button" data-entry-edit="' + esc(e.id) + '">수정</button>' +
      '<button type="button" class="danger" data-entry-del="' + esc(e.id) + '">삭제</button>' +
      '</span></div>' +
      (e.note ? '<div class="d">' + esc(e.note) + '</div>' : '') +
      '</div></div>';
  }
  function scheduleHTML() {
    if (ui.scheduleView === 'calendar') {
      var m = calMonthStr();
      var n = (db.entries || []).filter(function (e) { return String(e.date).slice(0, 7) === m; }).length;
      return '<div class="schedule-bar">' +
        '<div class="schedule-note">' + (n ? '이 달에 내가 추가한 일정 <strong>' + n + '</strong>개' : '날짜를 누르면 그날 일정이 아래에 펼쳐집니다') + '</div>' +
        schedToggleHTML(true) + '</div>' + calendarHTML(m);
    }
    var start = parseISO(ui.weekStart);
    var today = todayISO();
    var end = weekEndISO(ui.weekStart);
    var days = [];
    for (var i = 0; i < 7; i++) days.push(addDays(start, i));
    var mine = (db.entries || []).filter(function (e) { return e.date >= ui.weekStart && e.date <= end; });
    var bar = '<div class="schedule-bar">' +
      '<div class="schedule-note">' + (mine.length ? '이 주에 내가 추가한 일정 <strong>' + mine.length + '</strong>개' : '요일별 고정 사역에 내 일정을 더할 수 있습니다') + '</div>' +
      schedToggleHTML(false) +
      '<button type="button" class="btn-add" id="entryAddTop">' + ICON.plus + '일정 추가</button>' +
      '</div>';
    return bar + '<div class="days">' + days.map(function (d) {
      var iso = fmt(d), s = null;
      weekSermons().forEach(function (x) { if (x.date === iso) s = x; });
      var items = [];
      if (s) items.push({ order: 0, time: '새벽', label: '새벽예배 · ' + (s.passage || '본문 미정'), detail: s.title || '제목 없는 설교', kind: 'worship', sid: s.id });
      (db.daily || []).forEach(function (x) { items.push({ order: 1, time: x.time, label: x.label, detail: x.detail, kind: x.kind }); });
      (db.dayPlan[String(d.getDay())] || []).forEach(function (x) { items.push({ order: 2, time: x.time, label: x.label, detail: x.detail, kind: x.kind }); });
      entriesOn(iso).forEach(function (e) { items.push({ order: 3, entry: e, time: e.time, kind: e.kind }); });
      items.sort(function (a, b) { return timeRank(a.time) - timeRank(b.time) || a.order - b.order; });
      var rows = items.map(function (it) {
        if (it.entry) return entryRowHTML(it.entry);
        return '<div class="day-item"><div class="t">' + esc(it.time || '—') + '</div>' +
          '<div class="c"><div class="l"><span class="kind ' + esc(it.kind) + '">' + kindLabel(it.kind) + '</span>' + esc(it.label) +
          (it.sid ? '<button type="button" class="go" data-open="' + esc(it.sid) + '">원고 열기 →</button>' : '') +
          '</div>' + (it.detail ? '<div class="d">' + esc(it.detail) + '</div>' : '') + '</div></div>';
      }).join('');
      if (!items.length) rows = '<p class="day-empty">아직 일정이 없습니다.</p>';
      return '<div class="day' + (iso === today ? ' today' : '') + '">' +
        '<div class="day-head"><div class="dw">' + DAY_FULL[d.getDay()] + '</div>' +
        '<div class="dd">' + d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + '</div>' +
        (iso === today ? '<span class="today-tag">오늘</span>' : '') + '</div>' +
        '<div class="day-items">' + rows +
        '<button type="button" class="add-line" data-entry-add="' + iso + '">' + ICON.plus + '<span>이 날에 일정 추가</span></button>' +
        '</div></div>';
    }).join('') + '</div>';
  }
  function schedToggleHTML(isCal) {
    return '<div class="seg" role="group" aria-label="일정 보기 방식">' +
      '<button type="button" data-sched-view="list" class="' + (isCal ? '' : 'on') + '" aria-pressed="' + (isCal ? 'false' : 'true') + '">' + ICON.list + '목록</button>' +
      '<button type="button" data-sched-view="calendar" class="' + (isCal ? 'on' : '') + '" aria-pressed="' + (isCal ? 'true' : 'false') + '">' + ICON.calendar + '달력</button>' +
      '</div>';
  }

  /* ---------------- schedule · month calendar ---------------- */
  var CAL_DOW = ['월', '화', '수', '목', '금', '토', '주일'];
  function calMonthStr() {
    var m = ui.calMonth || '';
    if (!/^\d{4}-\d{2}$/.test(m)) m = todayISO().slice(0, 7);
    return m;
  }
  function monthLabelOf(m) { var p = m.split('-'); return (+p[0]) + '년 ' + (+p[1]) + '월'; }
  function monthDayLabel(iso) { var d = parseISO(iso); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + DAY_FULL[d.getDay()]; }
  /* 좁은 칸에서는 책 이름을 덜어 내고 '40:1-11'처럼만 적습니다. */
  function passageNum(p) {
    var t = shortPassage(p);
    if (t === '본문 미정') return t;
    var m = /^(.+?)\s+(\d.*)$/.exec(t);
    return m ? m[2] : t;
  }
  /* '시편 25편 1-22절' → '시편 25:1-22' 처럼 달력 칸에 짧게 적습니다. */
  function shortPassage(p) {
    var t = String(p || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
    if (!t) return '본문 미정';
    t = t.replace(/(\S+)\s*(\d+)편\s*([\d,\-–~]+)\s*절?/, '$1 $2:$3')
         .replace(/(\S+)\s*(\d+)장\s*([\d,\-–~]+)\s*절?/, '$1 $2:$3')
         .replace(/(\S+)\s*(\d+)편$/, '$1 $2')
         .replace(/(\S+)\s*(\d+)장$/, '$1 $2');
    return t;
  }
  function shiftMonth(n) {
    var p = calMonthStr().split('-');
    var d = new Date(+p[0], (+p[1]) - 1 + n, 1);
    ui.calMonth = d.getFullYear() + '-' + pad(d.getMonth() + 1);
    if (ui.calDay && ui.calDay.slice(0, 7) !== ui.calMonth) ui.calDay = '';
    saveUi(); render();
  }
  function selectCalDay(iso) {
    ui.calDay = (ui.calDay === iso) ? '' : iso;
    saveUi(); render();
  }
  function calendarHTML(m) {
    var p = m.split('-'), y = +p[0], mo = (+p[1]) - 1;
    var first = new Date(y, mo, 1);
    var daysIn = new Date(y, mo + 1, 0).getDate();
    var lead = weekOffset(first.getDay());
    var total = Math.ceil((lead + daysIn) / 7) * 7;
    var today = todayISO();
    var sMap = {};
    liveSermons().forEach(function (s) { (sMap[s.date] = sMap[s.date] || []).push(s); });
    var cells = '';
    for (var i = 0; i < total; i++) {
      var d = addDays(first, i - lead), iso = fmt(d);
      var inMonth = d.getMonth() === mo;
      var items = [];
      (sMap[iso] || []).forEach(function (s) { items.push({ type: 'sermon', s: s, rank: timeRank('새벽') }); });
      entriesOn(iso).forEach(function (e) { items.push({ type: 'entry', e: e, rank: timeRank(e.time) }); });
      items.sort(function (a, b) { return a.rank - b.rank; });
      var shown = items.slice(0, 3), more = items.length - shown.length;
      var body = shown.map(function (it) {
        if (it.type === 'sermon') {
          var s = it.s;
          return '<button type="button" class="cal-sermon" data-open="' + esc(s.id) + '" title="' + esc((s.passage || '본문 미정') + (s.title ? ' · ' + s.title : '')) + '">' +
            '<i></i><span class="lbl-full">' + esc(shortPassage(s.passage)) + '</span><span class="lbl-mini">' + esc(passageNum(s.passage)) + '</span></button>';
        }
        var e = it.e;
        return '<button type="button" class="cal-chip k-' + esc(e.kind || 'custom') + (e.done ? ' done' : '') + '" data-entry-edit="' + esc(e.id) + '" title="' + esc((e.time ? e.time + ' · ' : '') + e.title + (e.note ? ' — ' + e.note : '')) + '">' +
          '<i></i><span class="lbl-full">' + esc((e.time ? e.time + ' ' : '') + e.title) + '</span><span class="lbl-mini">' + esc(e.time || kindLabel(e.kind)) + '</span></button>';
      }).join('');
      if (more > 0) body += '<span class="cal-more">+' + more + '</span>';
      if (!body) body = '<span class="cal-blank" aria-hidden="true"></span>';
      var mins = (db.dayPlan[String(d.getDay())] || []).map(function (x) {
        return '<span class="cal-mini k-' + esc(x.kind || 'custom') + '" title="' + esc(x.label + (x.detail ? ' — ' + x.detail : '')) + '"><i></i><em>' + esc(x.label) + '</em></span>';
      }).join('');
      cells += '<div class="cal-cell' + (inMonth ? '' : ' out') + (iso === today ? ' today' : '') + (ui.calDay === iso ? ' sel' : '') + '" data-cal-cell="' + iso + '">' +
        '<div class="cal-top"><button type="button" class="cal-num' + (iso === today ? ' today' : '') + '" data-cal-day="' + iso + '" aria-label="' + esc(monthDayLabel(iso)) + ' 일정 보기">' + d.getDate() + '</button>' +
        '<button type="button" class="cal-add" data-entry-add="' + iso + '" aria-label="' + esc(monthDayLabel(iso)) + '에 일정 추가">' + ICON.plus + '</button></div>' +
        '<div class="cal-items">' + body + '</div>' +
        (mins ? '<div class="cal-mins">' + mins + '</div>' : '') +
        '</div>';
    }
    var head = '<div class="cal-head">' +
      '<button type="button" class="cal-nav" id="calPrev" aria-label="이전 달">' + ICON.chevL + '</button>' +
      '<span class="cal-title">' + monthLabelOf(m) + '</span>' +
      '<button type="button" class="cal-nav" id="calNext" aria-label="다음 달">' + ICON.chevR + '</button>' +
      '<button type="button" class="pill' + (m === today.slice(0, 7) ? ' on' : '') + '" id="calThisMonth">이번 달</button>' +
      '<button type="button" class="btn-add" id="calAddTop">' + ICON.plus + '일정 추가</button>' +
      '</div>';
    var dow = CAL_DOW.map(function (w, i) {
      return '<span' + (i === 5 ? ' class="sat"' : i === 6 ? ' class="sun"' : '') + '>' + w + '</span>';
    }).join('');
    var daily = (db.daily || []).map(function (x) { return '<span>' + esc(x.time) + ' ' + esc(x.label) + '</span>'; }).join('');
    var foot = '<div class="cal-note"><b>매일 고정</b>' + daily + '<span>— 달력 칸에서는 생략했습니다</span></div>';
    return head + '<div class="cal"><div class="cal-dow">' + dow + '</div><div class="cal-grid">' + cells + '</div></div>' + foot + calDayHTML();
  }
  function calDayHTML() {
    var iso = ui.calDay;
    if (!iso) return '';
    var d = parseISO(iso), today = todayISO();
    var rows = '';
    liveSermons().filter(function (s) { return s.date === iso; }).forEach(function (s) {
      rows += '<div class="day-item"><div class="t">새벽</div><div class="c"><div class="l"><span class="kind worship">예배</span>새벽예배 · ' + esc(s.passage || '본문 미정') +
        '<button type="button" class="go" data-open="' + esc(s.id) + '">원고 열기 →</button></div>' +
        '<div class="d">' + esc(s.title || '제목 없는 설교') + '</div></div></div>';
    });
    (db.dayPlan[String(d.getDay())] || []).forEach(function (x) {
      rows += '<div class="day-item"><div class="t">' + esc(x.time || '—') + '</div><div class="c"><div class="l"><span class="kind ' + esc(x.kind || 'custom') + '">' + kindLabel(x.kind) + '</span>' + esc(x.label) + '</div>' +
        (x.detail ? '<div class="d">' + esc(x.detail) + '</div>' : '') + '</div></div>';
    });
    entriesOn(iso).forEach(function (e) { rows += entryRowHTML(e); });
    if (!rows) rows = '<p class="day-empty">아직 일정이 없습니다.</p>';
    return '<div class="cal-day">' +
      '<div class="cal-day-head"><h3>' + esc(monthDayLabel(iso)) + '</h3>' +
      (iso === today ? '<span class="cal-today-tag">오늘</span>' : '') +
      '<button type="button" class="cal-day-add" data-entry-add="' + iso + '">' + ICON.plus + '이 날에 일정 추가</button>' +
      '<button type="button" class="cal-day-close" id="calDayClose">접기</button></div>' +
      '<div class="day-items">' + rows + '</div></div>';
  }
  function kindLabel(k) {
    return { worship: '예배', shorts: '쇼츠', blog: '블로그', pdf: '강단 PDF', docx: '설교원고', review: '검토', study: '성경공부', rest: '쉼', report: '보고', podcast: '팟캐스트', custom: '기타' }[k] || '일정';
  }
  function openEntryModal(id, presetDate) {
    var cur = id ? entryById(id) : null;
    var date = cur ? cur.date : (presetDate || ui.weekStart);
    var kindOpts = ENTRY_KINDS.map(function (k) {
      var sel = (cur ? (cur.kind || 'custom') : 'custom') === k.id;
      return '<option value="' + k.id + '"' + (sel ? ' selected' : '') + '>' + esc(k.label) + '</option>';
    }).join('');
    var body = '<div class="entry-form">' +
      '<label class="field"><span>날짜</span><input type="date" id="eDate" value="' + esc(date) + '"></label>' +
      '<label class="field"><span>시간 <em>선택</em></span><input type="time" id="eTime" value="' + esc(cur ? cur.time : '') + '"></label>' +
      '<label class="field wide"><span>제목</span><input type="text" id="eTitle" maxlength="80" placeholder="예: 구역예배 인도" value="' + esc(cur ? cur.title : '') + '"></label>' +
      '<label class="field"><span>구분</span><select class="status-select" id="eKind">' + kindOpts + '</select></label>' +
      '<label class="field wide"><span>메모 <em>선택</em></span><textarea id="eNote" rows="3" placeholder="장소, 준비물, 함께하는 사람처럼 기억해 둘 것을 적어 두세요">' + esc(cur ? (cur.note || '') : '') + '</textarea></label>' +
      '</div>' +
      (cur ? '<div class="entry-del"><button type="button" class="btn-line danger" id="eDel">이 일정 삭제</button></div>' : '');

    var modal = openModal({
      title: cur ? '일정 수정' : '일정 추가',
      okText: cur ? '저장' : '추가',
      cancelText: '취소',
      body: body,
      onOk: function () {
        var dEl = document.getElementById('eDate'), tEl = document.getElementById('eTime');
        var tiEl = document.getElementById('eTitle'), kEl = document.getElementById('eKind'), nEl = document.getElementById('eNote');
        var dv = ((dEl && dEl.value) || '').trim();
        var title = ((tiEl && tiEl.value) || '').trim();
        if (!dv) { toast('날짜를 골라 주세요'); return false; }
        if (!title) { toast('일정 제목을 적어 주세요'); if (tiEl) tiEl.focus(); return false; }
        var rec = cur || {
          id: 'e-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
          createdAt: new Date().toISOString(),
          done: false
        };
        rec.date = dv;
        rec.time = ((tEl && tEl.value) || '').trim();
        rec.title = title;
        rec.kind = kEl ? kEl.value : 'custom';
        rec.note = ((nEl && nEl.value) || '').trim();
        if (!cur) { db.entries = db.entries || []; db.entries.push(rec); }
        saveDb(true);
        if (ui.tab === 'schedule' && ui.scheduleView === 'calendar') { ui.calMonth = dv.slice(0, 7); ui.calDay = dv; }
        if (dv < ui.weekStart || dv > weekEndISO(ui.weekStart)) ui.weekStart = weekStartISO(dv);
        render();
        toast(cur ? '일정을 저장했습니다' : '일정을 추가했습니다');
      }
    });

    if (cur) {
      var delBtn = document.getElementById('eDel');
      if (delBtn) delBtn.addEventListener('click', function () {
        modal.closeModal();
        confirmModal({
          title: '이 일정을 삭제할까요?',
          body: '「' + cur.title + '」 일정을 지웁니다. 되돌릴 수 없습니다.',
          okText: '삭제', danger: true,
          onOk: function () {
            db.entries = (db.entries || []).filter(function (e) { return e.id !== cur.id; });
            saveDb(true); render(); toast('일정을 삭제했습니다');
          }
        });
      });
    }
    var ti = document.getElementById('eTitle');
    if (ti) ti.focus();
  }

  /* ---------------- progress ---------------- */
  function progressHTML() {
    var week = weekSermons();
    var avg = week.length ? Math.round(week.reduce(function (a, s) { return a + progress(s); }, 0) / week.length) : 0;
    var totalSlots = week.length * STATUS_FIELDS.length;
    var doneSlots = 0, reviewDone = 0;
    week.forEach(function (s) {
      STATUS_FIELDS.forEach(function (f) { if (statusOf(s, f.id) === '완료') doneSlots++; });
      reviewDone += reviewedCount(s);
    });
    var kpis = '<div class="kpis">' +
      kpi('이 주 전체 진행률', avg + '<small>%</small>', weekLabel(ui.weekStart)) +
      kpi('설교 편수', week.length + '<small>편</small>', '이 주에 준비하는 새벽예배 본문') +
      kpi('완료한 항목', doneSlots + '<small> / ' + totalSlots + '</small>', '원고 · 교재 · PPT · 기도문') +
      kpi('검토한 구성', reviewDone + '<small>/ ' + (week.length * 8) + '</small>', '효석패턴6 여덟 구성') +
      '</div>';

    /* weeks that hold sermons */
    var map = {};
    liveSermons().forEach(function (s) { var w = weekStartISO(s.date); (map[w] = map[w] || []).push(s); });
    var weeks = Object.keys(map).sort();
    var rows = weeks.map(function (w) {
      var list = map[w];
      var a = Math.round(list.reduce(function (x, s) { return x + progress(s); }, 0) / list.length);
      return '<div class="week-row"><div class="wl">' + weekLabel(w) + '<span>' + list.length + '편</span></div>' +
        '<div class="bar"><i style="width:' + a + '%"></i></div><div class="wp">' + a + '%</div></div>';
    }).join('') || '<p class="board-col-empty">아직 기록된 주차가 없습니다.</p>';

    var stats = STATUS_FIELDS.map(function (f) {
      var counts = {};
      STATUS_OPTIONS.forEach(function (o) { counts[o] = 0; });
      week.forEach(function (s) { counts[statusOf(s, f.id)] = (counts[statusOf(s, f.id)] || 0) + 1; });
      var total = week.length || 1;
      var segs = STATUS_OPTIONS.map(function (o) {
        var pct = (counts[o] / total) * 100;
        return pct > 0 ? '<i class="' + dotClass(o) + '" style="width:' + pct + '%"></i>' : '';
      }).join('');
      var label = STATUS_OPTIONS.filter(function (o) { return counts[o]; }).map(function (o) { return o + ' ' + counts[o]; }).join(' · ');
      return '<div class="stat-row"><div class="sl">' + esc(f.label.replace(' 상태', '')) + '</div>' +
        '<div><div class="stack">' + segs + '</div><div class="legend"><span>' + esc(label || '기록 없음') + '</span></div></div></div>';
    }).join('');

    var perSermon = week.map(function (s) {
      var t = s.title || '제목 없는 설교';
      return '<div class="week-row"><div class="wl">' + esc(dateLabel(s.date)) + ' ' + weekdayOf(s.date) + ' · ' + esc(s.passage || '본문 미정') +
        '<span>' + esc(t.length > 26 ? t.slice(0, 26) + '…' : t) + '</span></div>' +
        '<div class="bar"><i style="width:' + progress(s) + '%"></i></div><div class="wp">' + progress(s) + '%</div></div>';
    }).join('') || '<p class="board-col-empty">이 주에는 설교가 없습니다.</p>';

    return kpis +
      '<div class="section-card"><h2>주차별 진행률</h2><p class="hint">설교 서재에 담긴 모든 주차의 평균 진행률입니다.</p>' + rows + '</div>' +
      '<div class="section-card"><h2>상태별 통계 · ' + weekLabel(ui.weekStart) + '</h2><p class="hint">원고 · 교재 · PPT · 기도문 네 항목을 상태별로 나눠 봅니다.</p>' + stats +
      '<div class="legend" style="margin-top:14px">' + STATUS_OPTIONS.map(function (o) {
        return '<span><i class="' + dotClass(o) + '" style="background:' + statusColor(o) + '"></i>' + esc(o) + '</span>';
      }).join('') + '</div></div>' +
      '<div class="section-card"><h2>설교별 진행률</h2><p class="hint">완료 1 · 진행 중 0.5로 계산합니다.</p>' + perSermon + '</div>';
  }
  function kpi(k, v, sub) {
    return '<div class="kpi"><div class="k">' + esc(k) + '</div><div class="v">' + v + '</div><div class="sub">' + esc(sub) + '</div></div>';
  }
  function statusColor(o) {
    return { '완료': '#4E9C74', '진행 중': '#85AFD2', '추가 확인 필요': '#E4BC80', '시작 전': '#DCE3DE' }[o] || '#DCE3DE';
  }

  /* ---------------- review ---------------- */
  function reviewHTML() {
    var week = weekSermons();
    var reviewDone = 0, slots = 0;
    week.forEach(function (s) { reviewDone += reviewedCount(s); slots += 8; });
    var routines = (db.routines || []).map(function (r) {
      return '<div class="routine"><div class="routine-top"><h3>' + esc(r.name) + '</h3>' +
        '<span class="chip ' + (r.checked ? '완료' : '추가-확인-필요') + '">' + (r.checked ? '확인함' : '확인 필요') + '</span></div>' +
        '<div class="when">' + esc(r.when) + '</div><div class="detail">' + esc(r.detail) + '</div>' +
        '<div class="mark"><label class="check"><input type="checkbox" data-routine="' + esc(r.id) + '"' + (r.checked ? ' checked' : '') + '> 이번 주 확인</label>' +
        '<span class="kind ' + esc(r.tag === '쇼츠' ? 'shorts' : r.tag === '블로그' ? 'blog' : r.tag === 'PDF' ? 'pdf' : r.tag === '원고' ? 'docx' : 'podcast') + '">' + esc(r.tag) + '</span></div></div>';
    }).join('');

    var trash = trashedSermons();
    var trashHTML = trash.length ? trash.map(function (s) {
      return '<div class="trash-row"><div class="tm"><strong>' + esc(s.title || '제목 없는 설교') + '</strong>' +
        '<span>' + esc(s.date) + ' · ' + esc(s.passage || '본문 미정') + '</span></div>' +
        '<button type="button" class="btn-line" data-restore="' + esc(s.id) + '">복원</button>' +
        '<button type="button" class="btn-line danger" data-purge="' + esc(s.id) + '">영구 삭제</button></div>';
    }).join('') : '<p class="board-col-empty">휴지통이 비어 있습니다.</p>';

    return '<div class="section-card"><h2>이 주 검토 현황</h2>' +
      '<p class="hint">' + weekLabel(ui.weekStart) + ' · ' + week.length + '편 가운데 구성 검토 ' + reviewDone + '/' + slots + '을 마쳤습니다.</p>' +
      '<div class="bar"><i style="width:' + (slots ? Math.round(reviewDone / slots * 100) : 0) + '%"></i></div></div>' +
      '<div class="routines">' + routines + '</div>' +
      '<div class="section-card"><h2>데이터 관리</h2><p class="hint">모든 수정은 이 브라우저에 자동 저장됩니다. 기기를 옮길 때는 JSON으로 백업해 두세요.</p>' +
      '<div class="data-actions">' +
      '<button type="button" class="btn-solid" id="exportBtn2">JSON 백업 내려받기</button>' +
      '<button type="button" class="btn-line" id="importBtn2">JSON 불러오기</button>' +
      '<button type="button" class="btn-line danger" id="resetBtn">초기 데이터로 되돌리기</button>' +
      '</div></div>' +
      '<div class="section-card"><h2>휴지통</h2><p class="hint">삭제한 설교는 여기에서 복원하거나 완전히 지웁니다.</p>' + trashHTML + '</div>';
  }

  /* ---------------- 과거 설교 아카이브 ---------------- */
  var ARC = { index: null, loading: false, error: '', bodies: {}, selected: null, searching: false };

  function arcTotal() { return ARC.index ? ARC.index.count || ARC.index.items.length : 0; }
  function arcYearKey(it) { return it.year ? String(it.year) : 'unknown'; }
  function arcDateLabel(it) {
    if (!it.date) return '';
    var p = String(it.date).split('-');
    return (+p[1]) + '.' + (+p[2]);
  }
  function arcHeading(it) { return it.title || it.scripture || '설교 원고'; }

  function loadArchiveIndex() {
    if (ARC.index || ARC.loading) return;
    ARC.loading = true;
    fetch('archive/index.json').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      ARC.index = j;
      ARC.loading = false;
      var b = document.getElementById('arcBadge');
      if (b) b.textContent = String(j.count);
      if (ui.tab === 'archive') render();
    })['catch'](function (e) {
      ARC.loading = false;
      ARC.error = (e && e.message) ? e.message : '알 수 없는 오류';
      if (ui.tab === 'archive') render();
    });
  }

  function loadArcBodies(keys, cb) {
    var todo = keys.filter(function (k) { return !ARC.bodies[k]; });
    if (!todo.length) { if (cb) cb(); return; }
    var left = todo.length;
    todo.forEach(function (k) {
      fetch('archive/' + k + '.json').then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (j) {
        ARC.bodies[k] = j.bodies || {};
      })['catch'](function () {
        ARC.bodies[k] = {};
      }).then(function () {
        left -= 1;
        if (left === 0 && cb) cb();
      });
    });
  }

  function arcMatchesBody(it, q) {
    var key = arcYearKey(it);
    var bodies = ARC.bodies[key];
    if (!bodies) return false;
    var body = bodies[it.id];
    if (!body) return false;
    return body.toLowerCase().indexOf(q) !== -1;
  }

  function arcFilterItems() {
    var items = (ARC.index && ARC.index.items) || [];
    var q = (ui.arcQ || '').trim().toLowerCase();
    return items.filter(function (it) {
      if (ui.arcYear && ui.arcYear !== '전체') {
        if (ui.arcYear === '연도미상') { if (it.year) return false; }
        else if (String(it.year) !== ui.arcYear) return false;
      }
      if (ui.arcService && ui.arcService !== '전체' && it.service !== ui.arcService) return false;
      if (!q) return true;
      var hay = [it.title, it.scripture, it.date, it.service].join(' ').toLowerCase();
      if (hay.indexOf(q) !== -1) return true;
      return arcMatchesBody(it, q);
    });
  }

  function arcCountText(n, searching) {
    return (searching ? '찾은 설교 ' : '설교 ') + n + '편' + (ui.arcQ ? ' · 본문까지 검색' : '');
  }

  function arcToolbarHTML() {
    var years = ['전체'].concat((ARC.index.years || []).map(function (y) { return y.label; }));
    var yOpts = years.map(function (y) {
      var n = y === '전체' ? arcTotal() : ((ARC.index.years.filter(function (x) { return x.label === y; })[0] || {}).count || 0);
      return '<option value="' + esc(y) + '"' + (ui.arcYear === y ? ' selected' : '') + '>' + esc(y) + ' (' + n + ')</option>';
    }).join('');
    var svc = ['전체'].concat((ARC.index.services || []).map(function (s) { return s.label; }));
    var sOpts = svc.map(function (s) {
      var n = s === '전체' ? arcTotal() : ((ARC.index.services.filter(function (x) { return x.label === s; })[0] || {}).count || 0);
      return '<option value="' + esc(s) + '"' + (ui.arcService === s ? ' selected' : '') + '>' + esc(s) + ' (' + n + ')</option>';
    }).join('');
    return '<div class="arc-toolbar">' +
      '<div class="arc-filters">' +
      '<label class="arc-field"><span>연도</span><select id="arcYear">' + yOpts + '</select></label>' +
      '<label class="arc-field"><span>예배</span><select id="arcService">' + sOpts + '</select></label>' +
      '<label class="search arc-search">' + ICON.search +
      '<input type="search" id="arcSearch" placeholder="제목 · 본문 · 날짜 검색" value="' + esc(ui.arcQ || '') + '"></label>' +
      '</div>' +
      '<p class="arc-count" id="arcCount">' + arcCountText(arcFilterItems().length, false) + '</p>' +
      '</div>';
  }

  function arcListHTML() {
    var items = arcFilterItems();
    var q = (ui.arcQ || '').trim();
    var html = '';
    if (!items.length) {
      html = '<div class="empty"><strong>조건에 맞는 과거 설교가 없습니다</strong>연도나 예배 구분을 바꾸거나 다른 낱말로 검색해 보세요.</div>';
    } else {
      html = '<div class="arc-list">' + items.map(function (it) {
        return '<button type="button" class="arc-row" data-arc="' + esc(it.id) + '">' +
          '<span class="arc-date"><b>' + esc(arcDateLabel(it) || '연도') + '</b><i>' + esc(it.date ? weekdayOf(it.date) : '미상') + '</i></span>' +
          '<span class="arc-main">' +
          '<span class="arc-title">' + esc(arcHeading(it)) + '</span>' +
          '<span class="arc-meta">' +
          '<em class="arc-chip">' + esc(it.service) + '</em>' +
          (it.scripture ? '<span class="arc-ref">' + esc(it.scripture) + '</span>' : '') +
          (it.year ? '<span>' + esc(String(it.year)) + '년</span>' : '<span>연도 미상</span>') +
          '</span></span>' +
          ICON.arrow + '</button>';
      }).join('') + '</div>';
    }
    return html;
  }

  function arcReaderHTML(it) {
    var key = arcYearKey(it);
    var body = (ARC.bodies[key] || {})[it.id] || '';
    var paras = body ? body.split('\n') : [];
    var bodyHTML = paras.map(function (line) {
      return line ? '<p>' + esc(line) + '</p>' : '';
    }).join('');
    var when = it.date ? ((+it.date.split('-')[0]) + '. ' + (+it.date.split('-')[1]) + '. ' + (+it.date.split('-')[2]) + ' (' + weekdayOf(it.date) + ')') : (it.year ? it.year + '년' : '연도 미상');
    var svcLine = (it.service && it.service !== '기타') ? ' · ' + it.service + '예배' : '';
    return '<div class="arc-reader' + (ARC.big ? ' arc-big' : '') + '">' +
      '<div class="arc-actions">' +
      '<button type="button" class="btn-line arc-back" id="arcBack">' + ICON.chevL + '목록으로</button>' +
      '<span class="arc-actions-right">' +
      '<button type="button" class="btn-line" id="arcBig">큰 글씨 (18pt)</button>' +
      '<button type="button" class="btn-line" id="arcCopy">내용 복사</button>' +
      '<button type="button" class="btn-solid" id="arcPrint">인쇄 / PDF 저장</button>' +
      '</span></div>' +
      '<article class="arc-doc">' +
      '<p class="arc-kicker">' + esc(when) + esc(svcLine) + '</p>' +
      '<h1 class="arc-doc-title">' + esc(arcHeading(it)) + '</h1>' +
      (it.scripture ? '<p class="arc-doc-ref">본문 · ' + esc(it.scripture) + '</p>' : '') +
      '<div class="arc-body">' + (bodyHTML || '<p class="arc-note">본문을 불러오는 중입니다…</p>') + '</div>' +
      '</article></div>';
  }

  function archiveHTML() {
    if (!ARC.index) {
      if (ARC.error) {
        return '<div class="empty"><strong>과거 설교 목록을 불러오지 못했습니다</strong>' +
          esc(ARC.error) + ' · 잠시 뒤 새로고침해 주세요.</div>';
      }
      return '<div class="section-card arc-loading"><h2>과거 설교를 불러오는 중입니다…</h2>' +
        '<p class="hint">2020년부터 2026년까지의 설교 원고를 연도별로 나누어 두었습니다. 목록만 먼저 읽고, 설교를 열 때 그 해 원고를 받아옵니다.</p></div>';
    }
    var it = ARC.selected ? ARC.index.items.filter(function (x) { return x.id === ARC.selected; })[0] : null;
    if (ARC.selected && !it) { ARC.selected = null; }
    if (it) return arcReaderHTML(it);
    var list = arcListHTML();
    return arcToolbarHTML() + list;
  }

  function openArcItem(id) {
    var it = ARC.index.items.filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    ARC.selected = id;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var key = arcYearKey(it);
    if (!ARC.bodies[key]) {
      loadArcBodies([key], function () { if (ARC.selected === id) render(); });
    }
  }

  function printArchiveDoc() {
    var it = ARC.index.items.filter(function (x) { return x.id === ARC.selected; })[0];
    if (!it) return;
    document.body.classList.add('arc-print');
    setTimeout(function () {
      try { window.print(); } catch (e) {}
      setTimeout(function () { document.body.classList.remove('arc-print'); }, 900);
    }, 60);
  }

  /* ---------------- render ---------------- */
  function render() {
    syncNav();
    var body;
    if (ui.tab === 'board') body = toolbarHTML() + boardHTML();
    else if (ui.tab === 'schedule') body = (ui.scheduleView === 'calendar' ? '' : toolbarHTML()) + scheduleHTML();
    else if (ui.tab === 'library') {
      var s = sermonById(ui.selectedId);
      if (ui.view === 'detail' && s && !s.deleted) body = toolbarHTML() + detailHTML(s);
      else { ui.view = 'list'; body = toolbarHTML() + listHTML(); }
    } else if (ui.tab === 'archive') { body = archiveHTML(); if (!ARC.index) loadArchiveIndex(); }
    else if (ui.tab === 'progress') body = toolbarHTML() + progressHTML();
    else body = reviewHTML();

    document.getElementById('view').innerHTML = heroHTML() + '<div class="content">' + body + '</div>';
    bind();
    saveUi();
    if (ui.tab === 'library' && ui.view === 'detail') mountEditor();
  }

  function bind() {
    var $ = function (id) { return document.getElementById(id); };
    var top = $('newSermonTop');
    if (top) top.addEventListener('click', createSermon);

    if ($('weekPrev')) $('weekPrev').addEventListener('click', function () { shiftWeek(-7); });
    if ($('weekNext')) $('weekNext').addEventListener('click', function () { shiftWeek(7); });
    if ($('thisWeek')) $('thisWeek').addEventListener('click', function () { ui.weekStart = weekStartISO(todayISO()); render(); });

    var search = $('searchInput');
    if (search) search.addEventListener('input', function () {
      ui.search = search.value; saveUi(); refreshFiltered();
    });
    var filter = $('statusFilter');
    if (filter) filter.addEventListener('change', function () {
      ui.filter = filter.value; saveUi(); refreshFiltered();
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-id]'), function (el) {
      el.addEventListener('click', function () { openSermon(el.getAttribute('data-id')); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-open]'), function (el) {
      el.addEventListener('click', function (e) { e.stopPropagation(); openSermon(el.getAttribute('data-open')); });
    });

    if ($('newSermonBtn')) $('newSermonBtn').addEventListener('click', createSermon);
    if ($('dupTemplate')) $('dupTemplate').addEventListener('click', createSermon);
    if ($('backToList')) $('backToList').addEventListener('click', function () { ui.view = 'list'; render(); });
    if ($('deleteSermon')) $('deleteSermon').addEventListener('click', deleteCurrent);
    if ($('reuseContent')) $('reuseContent').addEventListener('click', openReuseModal);
    if ($('genPpt')) $('genPpt').addEventListener('click', function () { generatePptx(this); });
    if ($('genStudy')) $('genStudy').addEventListener('click', openStudyDoc);
    if ($('genPrayer')) $('genPrayer').addEventListener('click', openPrayerDoc);
    if ($('genCard')) $('genCard').addEventListener('click', openCardModal);
    var arcYearSel = $('arcYear');
    if (arcYearSel) arcYearSel.addEventListener('change', function () {
      ui.arcYear = arcYearSel.value; saveUi(); render();
    });
    var arcSvcSel = $('arcService');
    if (arcSvcSel) arcSvcSel.addEventListener('change', function () {
      ui.arcService = arcSvcSel.value; saveUi(); render();
    });
    var arcQ = $('arcSearch');
    if (arcQ) {
      var arcTimer = null;
      arcQ.addEventListener('input', function () {
        ui.arcQ = arcQ.value; saveUi();
        clearTimeout(arcTimer);
        arcTimer = setTimeout(function () {
          var q = (ui.arcQ || '').trim().toLowerCase();
          if (q.length >= 2) {
            var keys = [];
            if (ui.arcYear && ui.arcYear !== '전체' && ui.arcYear !== '연도미상') keys = [ui.arcYear];
            else {
              keys = (ARC.index.years || []).map(function (y) { return y.label === '연도미상' ? 'unknown' : y.label; });
              if (ui.arcYear === '연도미상') keys = ['unknown'];
            }
            loadArcBodies(keys, function () { if (ui.tab === 'archive' && !ARC.selected) render(); });
          }
          if (ui.tab === 'archive' && !ARC.selected) {
            var row = document.getElementById('view');
            var cur = row.querySelector('.arc-list, .empty');
            if (cur) cur.outerHTML = arcListHTML();
            var cnt = document.getElementById('arcCount');
            if (cnt) cnt.textContent = arcCountText(arcFilterItems().length, true);
          }
        }, 220);
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-arc]'), function (el) {
      el.addEventListener('click', function () { openArcItem(el.getAttribute('data-arc')); });
    });
    if ($('arcBack')) $('arcBack').addEventListener('click', function () { ARC.selected = null; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    if ($('arcBig')) $('arcBig').addEventListener('click', function () {
      ARC.big = !ARC.big;
      this.classList.toggle('on', ARC.big);
      this.textContent = ARC.big ? '기본 글씨' : '큰 글씨 (18pt)';
      var r = document.querySelector('.arc-reader');
      if (r) r.classList.toggle('arc-big', ARC.big);
    });
    if ($('arcCopy')) $('arcCopy').addEventListener('click', function () {
      var it = ARC.index.items.filter(function (x) { return x.id === ARC.selected; })[0];
      if (!it) return;
      var body = (ARC.bodies[arcYearKey(it)] || {})[it.id] || '';
      var head = [it.title || it.scripture, it.date, it.service + '예배', it.scripture].filter(Boolean).join(' · ');
      copyText(head + '\n\n' + body, '설교 원고');
    });
    if ($('arcPrint')) $('arcPrint').addEventListener('click', printArchiveDoc);


    var t = $('fTitle'), p = $('fPassage'), d = $('fDate');
    if (t) t.addEventListener('input', function () { var s = sermonById(ui.selectedId); if (!s) return; s.title = t.value; saveDb(); });
    if (p) p.addEventListener('input', function () { var s = sermonById(ui.selectedId); if (!s) return; s.passage = p.value; saveDb(); });
    if (d) d.addEventListener('change', function () {
      var s = sermonById(ui.selectedId); if (!s || !d.value) return;
      s.date = d.value; saveDb(); render();
    });

    Array.prototype.forEach.call(document.querySelectorAll('.status-field select'), function (sel) {
      sel.addEventListener('change', function () {
        var s = sermonById(ui.selectedId); if (!s) return;
        s.status = s.status || {};
        s.status[sel.getAttribute('data-field')] = sel.value;
        sel.setAttribute('data-status', sel.value);
        saveDb();
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('.outline-item'), function (btn) {
      btn.addEventListener('click', function () {
        var s = sermonById(ui.selectedId); if (!s) return;
        stashEditor(s);
        ui.section = btn.getAttribute('data-section');
        Array.prototype.forEach.call(document.querySelectorAll('.outline-item'), function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.getElementById('sectionTitle').textContent = currentSection().name;
        var chk = document.getElementById('reviewCheck');
        chk.checked = !!(s.reviewed && s.reviewed[ui.section]);
        mountEditor();
        saveUi();
      });
    });

    var chk = $('reviewCheck');
    if (chk) chk.addEventListener('change', function () {
      var s = sermonById(ui.selectedId); if (!s) return;
      s.reviewed = s.reviewed || {};
      s.reviewed[ui.section] = chk.checked;
      var item = document.querySelector('.outline-item.active');
      if (item) item.classList.toggle('reviewed', chk.checked);
      saveDb();
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-routine]'), function (box) {
      box.addEventListener('change', function () {
        (db.routines || []).forEach(function (r) { if (r.id === box.getAttribute('data-routine')) r.checked = box.checked; });
        saveDb();
        var chip = box.closest('.routine').querySelector('.chip');
        chip.className = 'chip ' + (box.checked ? '완료' : '추가-확인-필요');
        chip.textContent = box.checked ? '확인함' : '확인 필요';
      });
    });

    ['exportBtn', 'exportBtn2'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('click', exportJson); });
    ['importBtn', 'importBtn2'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('click', function () { $('importFile').click(); }); });
    if ($('resetBtn')) $('resetBtn').addEventListener('click', resetData);

    if ($('entryAddTop')) $('entryAddTop').addEventListener('click', function () {
      var today = todayISO();
      openEntryModal(null, (today >= ui.weekStart && today <= weekEndISO(ui.weekStart)) ? today : ui.weekStart);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-sched-view]'), function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-sched-view');
        if (v === ui.scheduleView) return;
        ui.scheduleView = v;
        if (v === 'calendar') ui.calMonth = (ui.calDay || todayISO()).slice(0, 7);
        saveUi(); render();
      });
    });
    if ($('calPrev')) $('calPrev').addEventListener('click', function () { shiftMonth(-1); });
    if ($('calNext')) $('calNext').addEventListener('click', function () { shiftMonth(1); });
    if ($('calThisMonth')) $('calThisMonth').addEventListener('click', function () {
      ui.calMonth = todayISO().slice(0, 7); ui.calDay = todayISO(); saveUi(); render();
    });
    if ($('calAddTop')) $('calAddTop').addEventListener('click', function () {
      var m = calMonthStr(), today = todayISO();
      var base = (ui.calDay && ui.calDay.slice(0, 7) === m) ? ui.calDay : (today.slice(0, 7) === m ? today : m + '-01');
      openEntryModal(null, base);
    });
    if ($('calDayClose')) $('calDayClose').addEventListener('click', function () { ui.calDay = ''; saveUi(); render(); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cal-day]'), function (b) {
      b.addEventListener('click', function () { selectCalDay(b.getAttribute('data-cal-day')); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cal-cell]'), function (cell) {
      cell.addEventListener('click', function (e) {
        if (e.target && e.target.closest && e.target.closest('button,a')) return;
        selectCalDay(cell.getAttribute('data-cal-cell'));
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-entry-add]'), function (el) {
      el.addEventListener('click', function () { openEntryModal(null, el.getAttribute('data-entry-add')); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-entry-edit]'), function (el) {
      el.addEventListener('click', function () { openEntryModal(el.getAttribute('data-entry-edit'), null); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-entry-check]'), function (box) {
      box.addEventListener('change', function () {
        var rec = entryById(box.getAttribute('data-entry-check'));
        if (!rec) return;
        rec.done = box.checked;
        saveDb();
        if (ui.tab === 'schedule' && ui.scheduleView === 'calendar') {
          render(); toast(box.checked ? '완료로 표시했습니다' : '완료 표시를 풀었습니다'); return;
        }
        var row = box.closest('.day-item');
        if (row) row.classList.toggle('done', box.checked);
        toast(box.checked ? '완료로 표시했습니다' : '완료 표시를 풀었습니다');
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-entry-del]'), function (el) {
      el.addEventListener('click', function () {
        var rec = entryById(el.getAttribute('data-entry-del'));
        if (!rec) return;
        confirmModal({
          title: '이 일정을 삭제할까요?',
          body: '「' + rec.title + '」 일정을 지웁니다. 되돌릴 수 없습니다.',
          okText: '삭제', danger: true,
          onOk: function () {
            db.entries = (db.entries || []).filter(function (e) { return e.id !== rec.id; });
            saveDb(true); render(); toast('일정을 삭제했습니다');
          }
        });
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-restore]'), function (el) {
      el.addEventListener('click', function () {
        var s = sermonById(el.getAttribute('data-restore'));
        if (s) { s.deleted = false; saveDb(true); render(); toast('설교를 복원했습니다'); }
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-purge]'), function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-purge');
        confirmModal({
          title: '완전히 삭제할까요?', body: '이 설교와 여덟 구성의 기록이 모두 사라지며 되돌릴 수 없습니다.',
          okText: '영구 삭제', danger: true, onOk: function () {
            db.sermons = db.sermons.filter(function (s) { return s.id !== id; });
            /* 새 data.js가 들어와도 지운 설교가 다시 생기지 않도록 기록해 둡니다. */
            db.retiredSermons = (db.retiredSermons || []).concat([id]).filter(function (x, i, a) { return a.indexOf(x) === i; });
            saveDb(true); render(); toast('영구 삭제했습니다');
          }
        });
      });
    });
  }

  function refreshFiltered() {
    if (ui.tab === 'library' && ui.view === 'list') {
      var rows = document.getElementById('listRows');
      if (rows) rows.innerHTML = listRowsHTML();
      var c = document.getElementById('listCount');
      if (c) c.textContent = weekSermons().filter(matchesFilter).length + '편 · ' + weekLabel(ui.weekStart);
      Array.prototype.forEach.call(document.querySelectorAll('[data-id]'), function (el) {
        el.addEventListener('click', function () { openSermon(el.getAttribute('data-id')); });
      });
    } else if (ui.tab === 'board') {
      var wrap = document.getElementById('boardWrap');
      if (wrap) {
        wrap.outerHTML = boardHTML();
        Array.prototype.forEach.call(document.querySelectorAll('[data-id]'), function (el) {
          el.addEventListener('click', function () { openSermon(el.getAttribute('data-id')); });
        });
      }
    }
  }

  function shiftWeek(n) {
    ui.weekStart = fmt(addDays(parseISO(ui.weekStart), n));
    if (ui.view === 'detail') ui.view = 'list';
    render();
  }

  function openSermon(id) {
    ui.selectedId = id; ui.view = 'detail'; ui.tab = 'library';
    var s = sermonById(id);
    if (s && !(s.reviewed && s.reviewed[ui.section])) { /* keep */ }
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------------- editor mount ---------------- */
  var editorTimer = null;
  function mountEditor() {
    var s = sermonById(ui.selectedId);
    var ed = document.getElementById('editor');
    if (!s || !ed) return;
    paintSection(ed, (s.sections && s.sections[ui.section]) || '');
    updateCharCount();
    ed.oninput = function () {
      updateCharCount();
      clearTimeout(editorTimer);
      editorTimer = setTimeout(function () {
        var cur = sermonById(ui.selectedId);
        if (!cur) return;
        cur.sections = cur.sections || {};
        cur.sections[ui.section] = readEditor(ed);
        saveDb();
      }, 420);
    };
    ed.onblur = function () { stashEditor(sermonById(ui.selectedId)); };
  }
  function stashEditor(s) {
    var ed = document.getElementById('editor');
    if (!s || !ed) return;
    s.sections = s.sections || {};
    s.sections[ui.section] = readEditor(ed);
    saveDb();
  }
  function updateCharCount() {
    var ed = document.getElementById('editor');
    var c = document.getElementById('charCount');
    if (!ed || !c) return;
    var n = ed.innerText.replace(/\s/g, '').length;
    c.textContent = n ? n.toLocaleString('ko-KR') + '자' : '아직 기록 없음';
  }

  /* ---------------- actions ---------------- */
  function createSermon() {
    var start = ui.weekStart;
    var used = {};
    weekSermons().forEach(function (s) { used[s.date] = true; });
    var date = null, today = todayISO();
    var startIdx = (today >= start && today <= weekEndISO(start)) ? weekOffset(parseISO(today).getDay()) : 0;
    for (var k = 0; k < 7; k++) {
      var d = fmt(addDays(parseISO(start), (startIdx + k) % 7));
      if (!used[d]) { date = d; break; }
    }
    if (!date) date = today;
    var blank = {};
    SECTIONS.forEach(function (sec) { blank[sec.id] = ''; });
    var st = {}; STATUS_FIELDS.forEach(function (f) { st[f.id] = '시작 전'; });
    var rv = {}; SECTIONS.forEach(function (sec) { rv[sec.id] = false; });
    var s = {
      id: 's-' + date + '-' + Date.now().toString(36),
      date: date, weekday: weekdayOf(date), series: '', title: '', passage: '', passageFull: '',
      central: '', theme: '', message: '', outline: [], reading: [], hymns: [],
      status: st, reviewed: rv, sections: blank, source: ''
    };
    db.sermons.push(s);
    saveDb(true);
    ui.selectedId = s.id; ui.view = 'detail'; ui.tab = 'library'; ui.section = 'analysis';
    render();
    toast('빈 템플릿으로 새 설교를 열었습니다');
    var t = document.getElementById('fTitle');
    if (t) t.focus();
  }

  function deleteCurrent() {
    var s = sermonById(ui.selectedId);
    if (!s) return;
    confirmModal({
      title: '이 설교를 삭제할까요?',
      body: '「' + (s.title || '제목 없는 설교') + '」을(를) 휴지통으로 옮깁니다. 언제든 복원할 수 있습니다.',
      okText: '휴지통으로 이동', danger: true, onOk: function () {
        s.deleted = true; s.deletedAt = new Date().toISOString();
        saveDb(true); ui.view = 'list'; render(); toast('휴지통으로 옮겼습니다');
      }
    });
  }

  function exportJson() {
    var payload = { app: '사역의 한 주', kind: 'ministry-workspace-backup', exportedAt: new Date().toISOString(), version: db.version, sermons: db.sermons, routines: db.routines, dayPlan: db.dayPlan, daily: db.daily, entries: db.entries || [], retiredSermons: db.retiredSermons || [] };
    var blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '사역의-한-주-백업-' + todayISO() + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    toast('JSON 백업 파일을 내려받았습니다');
  }

  function importJson(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var p = JSON.parse(String(reader.result));
        var arr = p.sermons || (p.data && p.data.sermons) || (Array.isArray(p) ? p : null);
        if (!arr || !arr.length) throw new Error('sermons');
        var newEntries = Array.isArray(p.entries) ? p.entries : [];
        confirmModal({
          title: 'JSON을 불러올까요?',
          body: '지금 브라우저에 저장된 기록을 불러온 파일의 ' + arr.length + '편 설교와 일정 ' + newEntries.length + '개로 바꿉니다. 먼저 백업을 받아 두시길 권합니다.',
          okText: '불러오기', onOk: function () {
            db.sermons = arr;
            if (p.routines) db.routines = p.routines;
            if (p.dayPlan) db.dayPlan = p.dayPlan;
            if (p.daily) db.daily = p.daily;
            if (Array.isArray(p.retiredSermons)) db.retiredSermons = p.retiredSermons;
            db.entries = newEntries;
            saveDb(true);
            ui.view = 'list'; ui.selectedId = null;
            render(); toast(arr.length + '편 설교와 일정 ' + newEntries.length + '개를 불러왔습니다');
          }
        });
      } catch (e) {
        confirmModal({ title: '불러오지 못했습니다', body: '이 파일에서 설교 목록을 찾지 못했습니다. 이 앱에서 내려받은 JSON 백업인지 확인해 주세요.', okText: '확인' });
      }
    };
    reader.readAsText(file);
  }

  function resetData() {
    confirmModal({
      title: '초기 데이터로 되돌릴까요?',
      body: '이 브라우저에서 고친 내용과 직접 추가한 일정이 모두 사라지고, 처음 넣어 둔 2026년 11월 23–29일 설교 일곱 편으로 돌아갑니다.',
      okText: '되돌리기', danger: true, onOk: function () {
        db = { version: DEFAULT.version, sermons: clone(DEFAULT.sermons), routines: clone(DEFAULT.routines), dayPlan: clone(DEFAULT.dayPlan), daily: clone(DEFAULT.daily), entries: clone(DEFAULT.entries || []), retiredSermons: [] };
        saveDb(true); ui.view = 'list'; ui.selectedId = null; render(); toast('초기 데이터로 되돌렸습니다');
      }
    });
  }

  /* ---------------- reuse modal ---------------- */
  function openReuseModal() {
    var cur = sermonById(ui.selectedId);
    if (!cur) return;
    var others = liveSermons().filter(function (s) { return s.id !== cur.id; }).sort(byDate);
    if (!others.length) { toast('재사용할 다른 설교가 없습니다'); return; }
    var body = '<div class="field"><span>구성 선택</span><select class="status-select" id="reuseSection" style="min-width:100%">' +
      SECTIONS.map(function (sec) {
        return '<option value="' + sec.id + '"' + (sec.id === ui.section ? ' selected' : '') + '>' + sec.no + '. ' + esc(sec.name) + '</option>';
      }).join('') + '</select></div>' +
      '<p style="font-size:12.5px;color:#8A968F;margin:4px 0 12px">어느 설교의 내용을 가져올까요? 지금 구성의 글이 선택한 설교의 같은 구성으로 바뀝니다.</p>' +
      others.map(function (s) {
        return '<button type="button" class="pick" data-src="' + esc(s.id) + '"><strong>' + esc(s.title || '제목 없는 설교') + '</strong>' +
          '<span>' + esc(s.date) + ' ' + weekdayOf(s.date) + ' · ' + esc(s.passage || '본문 미정') + '</span></button>';
      }).join('');
    var picked = others[others.length - 1].id;
    var modal = openModal({ title: '내용 재사용', body: body, okText: '가져오기', onOk: function () {
      var src = sermonById(document.getElementById('reuseSrcId') ? document.getElementById('reuseSrcId').value : picked);
      var secId = document.getElementById('reuseSection').value;
      if (!src) return;
      var text = (src.sections && src.sections[secId]) || '';
      if (!text) { toast('선택한 설교의 그 구성은 비어 있습니다'); return; }
      stashEditor(cur);
      cur.sections = cur.sections || {};
      cur.sections[secId] = text;
      cur.reviewed = cur.reviewed || {};
      cur.reviewed[secId] = false;
      saveDb(true);
      ui.section = secId;
      render();
      toast('「' + (src.title || '제목 없는 설교') + '」의 ' + (SECTIONS.filter(function (x) { return x.id === secId; })[0].name) + '을 가져왔습니다');
    } });
    var holder = document.createElement('input');
    holder.type = 'hidden'; holder.id = 'reuseSrcId'; holder.value = picked;
    modal.querySelector('.body').appendChild(holder);
    Array.prototype.forEach.call(modal.querySelectorAll('.pick'), function (b) {
      if (b.getAttribute('data-src') === picked) b.classList.add('sel');
      b.addEventListener('click', function () {
        picked = b.getAttribute('data-src');
        holder.value = picked;
        Array.prototype.forEach.call(modal.querySelectorAll('.pick'), function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
      });
    });
  }

  /* ---------------- 자료 자동 생성: PPT · 성경공부 교재 · 기도문 ---------------- */
  var ORD_LIST = ['첫째', '둘째', '셋째', '넷째', '다섯째'];

  function secText(s, id) { return (s.sections && s.sections[id]) || ''; }
  function toBlocks(t) {
    return String(t || '').replace(/\u00a0/g, ' ').split(/\n{2,}/)
      .map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function cut(t, n) {
    var x = String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
    if (x.length <= n) return x;
    return x.slice(0, n - 1).replace(/[\s,·:;—–\-]+$/, '') + '…';
  }
  function expandNums(ref) {
    var out = [], seen = {};
    String(ref || '').replace(/(\d+)\s*-\s*(\d+)/g, function (_, a, b) {
      for (var i = +a; i <= +b && i < +a + 30; i++) if (!seen[i]) { seen[i] = 1; out.push(i); }
      return ' ';
    }).replace(/(\d+)/g, function (_, a) {
      if (!seen[+a]) { seen[+a] = 1; out.push(+a); }
      return ' ';
    });
    return out;
  }
  function presetOf(s) {
    var map = {}, on = false;
    toBlocks(secText(s, 'analysis')).forEach(function (b) {
      if (/^1\.\s*본문 분석 프리셋/.test(b)) { on = true; return; }
      if (!on) return;
      var m = b.match(/^([^—\n]{1,18}?)\s*—\s*([\s\S]+)$/);
      if (m) { map[m[1].trim()] = m[2].trim(); return; }
      if (/^\d+\.\s/.test(b)) on = false;
    });
    return map;
  }
  function pointsOf(s) {
    var out = [];
    toBlocks(secText(s, 'group')).forEach(function (b) {
      var m = b.match(/^(첫째|둘째|셋째|넷째)\s*대지\s*·\s*([^·\n]+?)\s*·\s*([^·\n]+?)\s*·\s*([^\n]+)$/);
      if (m) out.push({ ord: m[1], ref: m[2].trim(), text: m[3].trim(), apply: m[4].trim() });
    });
    if (!out.length) {
      (s.outline || []).forEach(function (o, i) {
        out.push({ ord: ORD_LIST[i] || (i + 1) + '째', ref: o.ref || '', text: o.text || '', apply: '' });
      });
    }
    return out;
  }
  function questionsOf(s) {
    var bl = toBlocks(secText(s, 'group')), out = [];
    bl.forEach(function (b, i) {
      var m = b.match(/^질문\s*\d+\.\s*([^\n]+)(?:\n([\s\S]+))?$/);
      if (!m) return;
      var d = (m[2] || '').trim();
      if (!d && bl[i + 1] && !/^(질문|이번 주|[·•])/.test(bl[i + 1])) d = bl[i + 1];
      out.push({ q: m[1].trim(), d: d });
    });
    return out;
  }
  function practiceOf(s) {
    var out = [], on = false;
    toBlocks(secText(s, 'group')).forEach(function (b) {
      if (/실천 과제/.test(b) && b.length < 30) { on = true; return; }
      if (!on) return;
      if (/^[·•]/.test(b)) out.push(b.replace(/^[·•]\s*/, '').trim());
    });
    return out;
  }
  function hebrewRows(s) {
    var rows = [];
    toBlocks(secText(s, 'hebrew')).forEach(function (b) {
      if (/^원어 해석/.test(b)) return;
      if (b.indexOf(' · ') === -1) return;
      var p = b.split(' · ');
      if (p.length < 3) return;
      var word = p[0].trim();
      if (!word || word.length > 14) return;
      rows.push({
        word: word,
        tr: p[1].replace(/[()]/g, '').trim(),
        mean: p.slice(2).join(' · ').trim()
      });
    });
    return rows;
  }
  function contextRows(s) {
    var rows = [], cur = null;
    toBlocks(secText(s, 'context')).forEach(function (b) {
      if (/^\d\)\s*/.test(b)) { cur = { h: b, p: '' }; rows.push(cur); return; }
      if (cur && !cur.p && b.length > 24) cur.p = b;
    });
    return rows;
  }
  function prayerBody(s) {
    var bl = toBlocks(secText(s, 'prayer')), start = -1, end = bl.length;
    bl.forEach(function (b, i) {
      if (start < 0) {
        if (/마무리 기도/.test(b) && b.length < 40) start = i + 1;
      } else if (end === bl.length && /(새찬송가|찬송가 추천)/.test(b) && b.length < 40) {
        end = i;
      }
    });
    if (start < 0) start = 0;
    return bl.slice(start, end);
  }
  function hymnList(s) {
    var out = (s.hymns || []).filter(function (h) { return h && (h.no || h.title); })
      .map(function (h) { return { no: String(h.no || ''), title: h.title || '' }; });
    if (!out.length) {
      toBlocks(secText(s, 'prayer')).forEach(function (b) {
        var m = b.match(/^[\d.]*\s*새찬송가\s*(\d+)장\s*—\s*(.+)$/);
        if (m) out.push({ no: m[1], title: m[2].trim() });
      });
    }
    return out.slice(0, 3);
  }
  function readingLines(s) {
    var arr = (s.reading || []).slice();
    if (!arr.length) {
      var on = false;
      toBlocks(secText(s, 'analysis')).forEach(function (b) {
        if (/^2\.\s*본문 전체 인용/.test(b)) { on = true; return; }
        if (on && /^\d+\s/.test(b) && b.length > 6) arr.push(b);
      });
    }
    return arr;
  }
  function verseLines(s, ref, max) {
    var nums = expandNums(ref), lines = readingLines(s), out = [];
    lines.forEach(function (l) {
      var m = String(l).match(/^\s*(\d+)\s+([\s\S]+)$/);
      if (!m) return;
      if (!nums.length || nums.indexOf(+m[1]) > -1) out.push({ n: m[1], t: m[2].trim() });
    });
    if (!out.length) {
      lines.slice(0, 3).forEach(function (l) {
        var m = String(l).match(/^\s*(\d+)\s+([\s\S]+)$/);
        if (m) out.push({ n: m[1], t: m[2].trim() });
      });
    }
    return max ? out.slice(0, max) : out;
  }
  function centralVerses(s) {
    var out = [];
    String(s.central || '').split(',').forEach(function (p) {
      var m = p.match(/(\d+(?:\s*-\s*\d+)?)\s*절\s*$/);
      if (m) expandNums(m[1]).forEach(function (n) { if (out.indexOf(n) < 0) out.push(n); });
    });
    var got = verseLines(s, out.join(','), 4);
    var total = got.reduce(function (n, v) { return n + v.t.length; }, 0);
    while (got.length > 2 && total > 170) total -= got.pop().t.length;
    return got.map(function (v) { return v.t; });
  }
  function applyToPrayer(app) {
    var t = String(app || '').trim().replace(/[.。]$/, '');
    if (!t) return '';
    var m = t.match(/^(.*)기$/);
    if (m && m[1]) return '주님, 저희가 ' + m[1] + '게 하여 주시옵소서.';
    return '주님, ' + t + '의 자리로 저희를 이끌어 주시옵소서.';
  }

  function markStatus(key, msg) {
    var s = sermonById(ui.selectedId);
    if (!s) return;
    s.status = s.status || {};
    s.status[key] = '완료';
    saveDb(true);
    var sel = document.querySelector('.status-grid select[data-field="' + key + '"]');
    if (sel) { sel.value = '완료'; sel.setAttribute('data-status', '완료'); }
    if (msg) toast(msg);
  }

  /* ---- PPT ---- */
  function pptxFileName(s) {
    var pass = String(s.passage || '본문').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
    return String(s.date) + '_' + pass + '_설교PPT.pptx';
  }
  function buildDeck(s) {
    var PptxGenJS = window.PptxGenJS;
    if (!PptxGenJS) return null;
    var C = {
      forest: '1F5B3F', deep: '17452F', cream: 'F8FAF8', ink: '16202E',
      muted: '6E7C75', sage: 'E9F2EC', sageLine: 'DDE8E1', gold: 'C6A15B',
      soft: 'C9DBD0', dim: '9DBBA9'
    };
    var F = 'Apple SD Gothic Neo';
    var W = 13.333, H = 7.5, M = 0.95, CW = W - M * 2;

    var preset = presetOf(s);
    var points = pointsOf(s);
    var questions = questionsOf(s);
    var heb = hebrewRows(s);
    var pray = prayerBody(s);
    var hymns = hymnList(s);
    var verses = centralVerses(s);
    var theme = preset['중심 주제'] || s.theme || '';
    var core = preset['신학적 핵심'] || s.message || '';
    var motifs = preset['주요 모티프'] || '';
    var dateStr = dateLabel(s.date) + ' ' + weekdayOf(s.date);

    var pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = '효석패턴6';
    pptx.company = '세리토스장로교회';
    pptx.subject = s.passage || '';
    pptx.title = s.title || '설교 PPT';

    function foot(sl, n) {
      sl.addText('세리토스장로교회 · 효석패턴6', { x: M, y: H - 0.52, w: 5.4, h: 0.3, fontFace: F, fontSize: 10, color: C.muted });
      sl.addText(n + ' / 8', { x: W - M - 1.1, y: H - 0.52, w: 1.1, h: 0.3, fontFace: F, fontSize: 10, color: C.muted, align: 'right' });
    }
    function kicker(sl, txt) {
      sl.addText(txt, { x: M, y: 0.6, w: CW, h: 0.34, fontFace: F, fontSize: 12.5, bold: true, color: C.forest, charSpacing: 1.2 });
    }
    function heading(sl, txt, y, size) {
      sl.addText(txt, { x: M, y: y, w: CW, h: 0.92, fontFace: F, fontSize: size || 28, bold: true, color: C.ink, valign: 'middle', fit: 'shrink' });
    }

    /* 1. 표지 */
    var sl = pptx.addSlide();
    sl.background = { color: C.forest };
    sl.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.16, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    sl.addText((s.series ? s.series + '  ·  ' : '') + dateStr + '  ·  새벽예배',
      { x: M, y: 1.02, w: CW, h: 0.4, fontFace: F, fontSize: 15, color: C.soft, charSpacing: 1, valign: 'middle' });
    sl.addText(s.title || '제목 없는 설교',
      { x: M, y: 1.52, w: CW, h: 2.3, fontFace: F, fontSize: 40, bold: true, color: C.cream, lineSpacingMultiple: 1.12, valign: 'middle', fit: 'shrink' });
    sl.addShape(pptx.ShapeType.rect, { x: M, y: 4.12, w: 1.7, h: 0.055, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    sl.addText([
      { text: '본문   ', options: { color: C.dim, fontSize: 16 } },
      { text: (s.passageFull || s.passage || '본문 미정'), options: { color: C.cream, fontSize: 20, bold: true } }
    ], { x: M, y: 4.4, w: CW, h: 0.58, fontFace: F, valign: 'middle' });
    sl.addText(cut(theme, 160),
      { x: M, y: 5.12, w: CW - 1.2, h: 1.0, fontFace: F, fontSize: 14, color: C.soft, lineSpacingMultiple: 1.35, valign: 'top', fit: 'shrink' });
    sl.addText('세리토스장로교회  ·  효석패턴6 설교', { x: M, y: H - 0.7, w: 6.4, h: 0.3, fontFace: F, fontSize: 11, color: C.dim });

    /* 2. 중심 구절 · 모티프 */
    var vtxt = verses.length ? verses.join('\n') : (s.central || '');
    sl = pptx.addSlide();
    sl.background = { color: C.cream };
    kicker(sl, '중심 구절  ·  ' + (s.central || s.passage || ''));
    sl.addText(vtxt, { x: M, y: 1.12, w: CW, h: 2.6, fontFace: F, fontSize: 22, color: C.ink, lineSpacingMultiple: 1.4, valign: 'top', fit: 'shrink' });
    sl.addShape(pptx.ShapeType.rect, { x: M, y: 3.92, w: CW, h: 1.66, fill: { color: C.sage }, line: { color: C.sageLine, width: 1 } });
    sl.addText('신학적 핵심', { x: M + 0.34, y: 4.06, w: 4, h: 0.3, fontFace: F, fontSize: 11.5, bold: true, color: C.forest });
    sl.addText(cut(core, 230), { x: M + 0.34, y: 4.38, w: CW - 0.68, h: 1.05, fontFace: F, fontSize: 15, color: C.ink, lineSpacingMultiple: 1.35, valign: 'top', fit: 'shrink' });
    if (motifs) {
      sl.addText([
        { text: '주요 모티프   ', options: { color: C.forest, bold: true, fontSize: 11.5 } },
        { text: cut(motifs, 180), options: { color: C.muted, fontSize: 12.5 } }
      ], { x: M, y: 5.76, w: CW, h: 0.95, fontFace: F, valign: 'top', lineSpacingMultiple: 1.4 });
    }
    foot(sl, 2);

    /* 3. 핵심 원어 */
    sl = pptx.addSlide();
    sl.background = { color: C.cream };
    kicker(sl, '핵심 원어  ·  ' + (s.passage || ''));
    heading(sl, '말씀을 여는 히브리어', 0.98, 26);
    var rows = heb.slice(0, 8);
    var colW = (CW - 0.7) / 2;
    if (rows.length) {
      rows.forEach(function (r, i) {
        var cx = M + (i < 4 ? 0 : colW + 0.7);
        var cy = 2.12 + (i % 4) * 1.16;
        sl.addText([
          { text: r.word, options: { fontSize: 17, bold: true, color: C.forest } },
          { text: '   ' + r.tr, options: { fontSize: 13, color: C.muted } }
        ], { x: cx, y: cy, w: colW, h: 0.42, fontFace: F, valign: 'bottom' });
        sl.addText(cut(r.mean, 46), { x: cx, y: cy + 0.42, w: colW, h: 0.36, fontFace: F, fontSize: 12.5, color: C.ink, valign: 'top' });
        sl.addShape(pptx.ShapeType.line, { x: cx, y: cy + 0.84, w: colW, h: 0, line: { color: C.sageLine, width: 0.75 } });
      });
    } else {
      sl.addText('핵심 원어 구성이 아직 비어 있습니다.', { x: M, y: 2.2, w: CW, h: 0.5, fontFace: F, fontSize: 15, color: C.muted });
    }
    foot(sl, 3);

    /* 4-6. 대지 */
    points.slice(0, 3).forEach(function (p, i) {
      sl = pptx.addSlide();
      sl.background = { color: C.cream };
      sl.addShape(pptx.ShapeType.rect, { x: M, y: 0.72, w: 0.1, h: 0.44, fill: { color: C.forest }, line: { color: C.forest, width: 0 } });
      sl.addText(p.ord + ' 대지' + (p.ref ? '  ·  ' + p.ref : ''),
        { x: M + 0.3, y: 0.66, w: CW - 0.3, h: 0.46, fontFace: F, fontSize: 13, bold: true, color: C.forest, valign: 'middle', charSpacing: 0.8 });
      sl.addText(p.text || '', { x: M, y: 1.32, w: CW, h: 2.1, fontFace: F, fontSize: 30, bold: true, color: C.ink, lineSpacingMultiple: 1.22, valign: 'middle', fit: 'shrink' });
      var vv = verseLines(s, p.ref, 2);
      if (vv.length) {
        sl.addText(vv.map(function (v) { return v.n + '  ' + v.t; }).join('\n'),
          { x: M, y: 3.55, w: CW, h: 1.35, fontFace: F, fontSize: 13, color: C.muted, lineSpacingMultiple: 1.45, valign: 'top', fit: 'shrink' });
      }
      if (p.apply) {
        sl.addShape(pptx.ShapeType.rect, { x: M, y: 5.05, w: CW, h: 1.18, fill: { color: C.sage }, line: { color: C.sageLine, width: 1 } });
        sl.addText([
          { text: '삶의 적용    ', options: { fontSize: 11, bold: true, color: C.forest } },
          { text: cut(p.apply, 120), options: { fontSize: 14.5, color: C.ink } }
        ], { x: M + 0.3, y: 5.13, w: CW - 0.6, h: 1.02, fontFace: F, valign: 'middle', lineSpacingMultiple: 1.3, fit: 'shrink' });
      }
      foot(sl, 4 + i);
    });

    /* 7. 소그룹 적용 질문 */
    sl = pptx.addSlide();
    sl.background = { color: C.cream };
    kicker(sl, '소그룹 나눔  ·  ' + (s.passage || ''));
    heading(sl, questions.length ? '삶을 향한 세 가지 질문' : '이번 주 실천', 0.98, 26);
    if (questions.length) {
      questions.slice(0, 3).forEach(function (q, i) {
        var qy = 2.16 + i * 1.58;
        sl.addText('0' + (i + 1), { x: M, y: qy, w: 0.72, h: 0.5, fontFace: F, fontSize: 20, bold: true, color: C.gold });
        sl.addText(cut(q.q, 68), { x: M + 0.72, y: qy - 0.08, w: CW - 0.72, h: 0.66, fontFace: F, fontSize: 19, bold: true, color: C.ink, valign: 'middle', fit: 'shrink' });
        if (q.d) sl.addText(cut(q.d, 110), { x: M + 0.72, y: qy + 0.62, w: CW - 0.72, h: 0.62, fontFace: F, fontSize: 12.5, color: C.muted, lineSpacingMultiple: 1.35, valign: 'top', fit: 'shrink' });
      });
    } else {
      var prac = practiceOf(s);
      sl.addText(prac.length ? prac.map(function (t, i) { return (i + 1) + '.  ' + t; }).join('\n\n') : '이번 주 실천 과제가 아직 비어 있습니다.',
        { x: M, y: 2.1, w: CW, h: 3.6, fontFace: F, fontSize: 16, color: C.ink, lineSpacingMultiple: 1.5, valign: 'top', fit: 'shrink' });
    }
    foot(sl, 7);

    /* 8. 마무리 기도 · 찬송 */
    sl = pptx.addSlide();
    sl.background = { color: C.cream };
    kicker(sl, '마무리 기도  ·  찬송');
    heading(sl, '함께 기도하며 마무리합니다', 0.98, 24);
    var pblk = pray.filter(function (b) { return b.length > 12; }).slice(0, 3).map(function (b) { return cut(b, 170); });
    while (pblk.length > 1 && pblk.join('\n').length > 460) pblk.pop();
    var ptext = pblk.join('\n');
    sl.addText(ptext, { x: M, y: 1.6, w: 7.5, h: 3.5, fontFace: F, fontSize: 13.5, color: C.ink, lineSpacingMultiple: 1.5, valign: 'top', fit: 'shrink' });
    sl.addText('우리 구주 예수 그리스도의 이름으로 기도드립니다. 아멘.',
      { x: M, y: 5.2, w: 7.5, h: 0.4, fontFace: F, fontSize: 12.5, bold: true, color: C.forest, valign: 'middle' });
    sl.addShape(pptx.ShapeType.rect, { x: 8.9, y: 1.6, w: 3.45, h: 3.9, fill: { color: C.sage }, line: { color: C.sageLine, width: 1 } });
    sl.addText('추천 찬송', { x: 9.12, y: 1.76, w: 3.0, h: 0.3, fontFace: F, fontSize: 11.5, bold: true, color: C.forest });
    sl.addText(hymns.length ? hymns.map(function (h, i) {
      var tag = i === 0 ? '설교 전' : i === 1 ? '설교 후' : '묵상';
      return tag + '\n' + (h.no ? h.no + '장' : '') + (h.title ? '  ' + h.title : '');
    }).join('\n\n') : '추천 찬송이 아직 없습니다.',
      { x: 9.12, y: 2.12, w: 3.05, h: 3.2, fontFace: F, fontSize: 12, color: C.ink, lineSpacingMultiple: 1.45, valign: 'top', fit: 'shrink' });
    foot(sl, 8);

    return pptx;
  }
  function generatePptx(btn) {
    var s = sermonById(ui.selectedId);
    if (!s) return;
    stashEditor(s);
    if (!window.PptxGenJS) {
      toast('PPT 라이브러리를 아직 불러오지 못했습니다. 잠시 뒤 다시 눌러 주세요.');
      return;
    }
    var old = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="ico">⏳</span><span class="tx"><strong>만드는 중…</strong><small>잠시만 기다려 주세요</small></span>'; }
    var restore = function () { if (btn) { btn.disabled = false; btn.innerHTML = old; } };
    var deck;
    try { deck = buildDeck(s); } catch (e) { restore(); toast('PPT를 만들지 못했습니다 — ' + (e && e.message ? e.message : e)); return; }
    if (!deck) { restore(); toast('PPT 라이브러리를 불러오지 못했습니다.'); return; }
    deck.writeFile({ fileName: pptxFileName(s) }).then(function () {
      markStatus('slide', '설교 PPT를 내려받았습니다 · ' + pptxFileName(s));
      restore();
    })['catch'](function (err) {
      restore();
      toast('PPT 저장에 실패했습니다 — ' + (err && err.message ? err.message : err));
    });
  }

  /* ---- 문서 모달 (교재 · 기도문) ---- */
  function openDocModal(o) {
    var root = document.getElementById('modalRoot');
    var back = document.createElement('div');
    back.className = 'modal-back doc-back';
    back.innerHTML =
      '<div class="modal doc-modal" role="dialog" aria-modal="true">' +
      '<div class="doc-bar">' +
      '<div class="doc-bar-t"><strong>' + esc(o.title) + '</strong><span>' + esc(o.sub) + '</span></div>' +
      '<div class="doc-bar-b">' +
      '<button type="button" class="btn-line" data-doc-size>큰 글씨 (18pt)</button>' +
      '<button type="button" class="btn-solid" data-doc-print>인쇄 / PDF 저장</button>' +
      '<button type="button" class="btn-line" data-doc-copy>내용 복사</button>' +
      '<button type="button" class="btn-line" data-doc-close>닫기</button>' +
      '</div></div>' +
      '<div class="doc-body"></div></div>';
    var body = back.querySelector('.doc-body');
    body.innerHTML = o.html;
    root.appendChild(back);
    var doc = body.querySelector('.doc');
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    function close() {
      document.body.classList.remove('printing');
      document.removeEventListener('keydown', onKey);
      if (back.parentNode) root.removeChild(back);
    }
    document.addEventListener('keydown', onKey);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    back.querySelector('[data-doc-close]').addEventListener('click', close);
    var sizeBtn = back.querySelector('[data-doc-size]');
    sizeBtn.addEventListener('click', function () {
      var big = doc.classList.toggle('doc-lg');
      sizeBtn.textContent = big ? '기본 글씨' : '큰 글씨 (18pt)';
      sizeBtn.classList.toggle('on', big);
    });
    back.querySelector('[data-doc-copy]').addEventListener('click', function () {
      copyText(doc.innerText, o.copyLabel || '내용');
    });
    back.querySelector('[data-doc-print]').addEventListener('click', function () {
      document.body.classList.add('printing');
      setTimeout(function () {
        try { window.print(); } catch (e) {}
        setTimeout(function () { document.body.classList.remove('printing'); }, 900);
      }, 80);
    });
    return back;
  }
  function copyText(text, label) {
    var done = function (ok) { toast(ok ? label + ' 내용을 복사했습니다' : '복사하지 못했습니다 — 본문을 직접 선택해 주세요'); };
    var legacy = function () {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.top = '-1000px';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e) { return false; }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(legacy()); });
    } else done(legacy());
  }

  function docHeadHTML(s, kind, sub) {
    return '<div class="doc-head">' +
      '<p class="doc-kicker">효석패턴6 · ' + esc(kind) + '</p>' +
      '<h1 class="doc-title">' + esc(s.title || '제목 없는 설교') + '</h1>' +
      '<p class="doc-meta">' + esc(s.passageFull || s.passage || '본문 미정') + '  ·  ' + esc(s.date) + ' ' + esc(weekdayOf(s.date)) + '  ·  세리토스장로교회' + (sub ? '  ·  ' + esc(sub) : '') + '</p>' +
      '</div>';
  }
  function studyHTML(s) {
    var preset = presetOf(s), heb = hebrewRows(s), ctx = contextRows(s),
      points = pointsOf(s), qs = questionsOf(s), prac = practiceOf(s), vs = verseLines(s, '', 0);
    var html = '<article class="doc doc-study">' + docHeadHTML(s, '성경공부 교재', '소그룹 · 제자훈련용');
    if (!vs.length && !Object.keys(preset).length && !ctx.length && !heb.length && !points.length) {
      html += '<p class="doc-note">이 설교의 여덟 구성이 아직 비어 있습니다. 본문 분석과 소그룹 적용을 먼저 채우면 교재가 그 내용으로 만들어집니다.</p>';
    }

    if (vs.length) {
      html += '<section class="doc-sec"><h2>1. 본문 읽기</h2>' +
        vs.map(function (v) { return '<p class="doc-verse"><b>' + esc(v.n) + '</b><span>' + esc(v.t) + '</span></p>'; }).join('') +
        '</section>';
    }
    var keys = Object.keys(preset).filter(function (k) {
      return !/^(\d+\.|설교 제목|2\. 본문 전체 인용)/.test(k);
    });
    if (keys.length) {
      html += '<section class="doc-sec"><h2>2. 본문 분석 요약</h2>' +
        keys.map(function (k) {
          return '<div class="doc-row"><span class="k">' + esc(k) + '</span><span class="v">' + esc(preset[k]) + '</span></div>';
        }).join('') + '</section>';
    }
    if (ctx.length) {
      html += '<section class="doc-sec"><h2>3. 전후 맥락</h2>' +
        ctx.map(function (c) {
          return '<div class="doc-block"><h3>' + esc(c.h) + '</h3>' + (c.p ? '<p>' + esc(cut(c.p, 520)) + '</p>' : '') + '</div>';
        }).join('') + '</section>';
    }
    if (heb.length) {
      html += '<section class="doc-sec"><h2>4. 핵심 원어</h2><table class="doc-table"><thead><tr><th>단어</th><th>원어</th><th>뜻</th></tr></thead><tbody>' +
        heb.map(function (r) {
          return '<tr><td>' + esc(r.word) + '</td><td>' + esc(r.tr) + '</td><td>' + esc(r.mean) + '</td></tr>';
        }).join('') + '</tbody></table></section>';
    }
    if (points.length) {
      html += '<section class="doc-sec"><h2>5. 대지별 정리</h2>' +
        points.map(function (p) {
          return '<div class="doc-block"><h3>' + esc(p.ord + ' 대지 · ' + (p.ref || '')) + '</h3>' +
            '<p class="doc-pt">' + esc(p.text) + '</p>' +
            (p.apply ? '<p class="doc-note">삶의 적용 · ' + esc(p.apply) + '</p>' : '') + '</div>';
        }).join('') + '</section>';
    }
    if (qs.length) {
      html += '<section class="doc-sec"><h2>6. 소그룹 나눔 질문</h2>' +
        qs.map(function (q, i) {
          return '<p class="doc-q"><b>Q' + (i + 1) + '.</b> ' + esc(q.q) + '</p>' +
            (q.d ? '<p class="doc-note">' + esc(q.d) + '</p>' : '');
        }).join('') + '</section>';
    }
    if (prac.length) {
      html += '<section class="doc-sec"><h2>7. 이번 주 실천</h2><ul class="doc-list">' +
        prac.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></section>';
    }
    html += '<p class="doc-foot">본문 분석 · 전후 맥락 · 핵심 원어 · 소그룹 적용에서 자동으로 묶은 교재입니다. 필요에 따라 인쇄하거나 PDF로 저장해 나눠 주세요.</p>';
    return html + '</article>';
  }
  function prayerHTML(s) {
    var points = pointsOf(s), pray = prayerBody(s), hymns = hymnList(s);
    var html = '<article class="doc doc-prayer">' + docHeadHTML(s, '기도문', '예배 마무리 · 소그룹 나눔');
    if (!points.length && !pray.length) {
      html += '<p class="doc-note">이 설교의 마무리 기도와 소그룹 적용이 아직 비어 있습니다. 일곱째·여덟째 구성을 채우면 기도문이 그 내용으로 만들어집니다.</p>';
    }
    html += '<section class="doc-sec"><h2>1. 대지별 결단 기도</h2>';
    if (points.length) {
      points.forEach(function (p) {
        html += '<div class="doc-pray">' +
          '<p class="ph">' + esc(p.ord + ' 대지 · ' + (p.ref || '') + ' — ' + p.text) + '</p>' +
          '<p>' + esc(applyToPrayer(p.apply)) + '</p></div>';
      });
    } else {
      html += '<p class="doc-note">대지별 적용이 아직 정리되지 않았습니다.</p>';
    }
    html += '</section>';
    html += '<section class="doc-sec"><h2>2. 마무리 기도</h2>';
    if (pray.length) {
      html += pray.map(function (b) {
        return /^아멘\.?$/.test(b) ? '<p class="doc-amen">아멘.</p>' : '<p>' + esc(b) + '</p>';
      }).join('');
    } else {
      html += '<p class="doc-note">마무리 기도 구성이 아직 비어 있습니다.</p>';
    }
    html += '</section>';
    html += '<section class="doc-sec"><h2>3. 추천 찬송</h2>';
    if (hymns.length) {
      html += '<ul class="doc-list">' + hymns.map(function (h, i) {
        var tag = i === 0 ? '설교 전' : i === 1 ? '설교 후' : '묵상';
        return '<li><b>' + esc(tag) + '</b> · 새찬송가 ' + esc(h.no) + '장 「' + esc(h.title) + '」</li>';
      }).join('') + '</ul>';
    } else {
      html += '<p class="doc-note">추천 찬송이 아직 정리되지 않았습니다.</p>';
    }
    html += '</section>';
    html += '<p class="doc-foot">마무리 기도 · 소그룹 적용에서 자동으로 묶은 기도문입니다. 예배 마무리나 소그룹 나눔 뒤 함께 읽도록 준비했습니다.</p>';
    return html + '</article>';
  }
  function openStudyDoc() {
    var s = sermonById(ui.selectedId);
    if (!s) return;
    stashEditor(s);
    openDocModal({
      title: '성경공부 교재 미리보기',
      sub: (s.passage || '본문') + ' · 인쇄하거나 PDF로 저장할 수 있습니다',
      html: studyHTML(s),
      copyLabel: '성경공부 교재'
    });
    markStatus('study', '성경공부 교재를 만들었습니다 · 상태를 완료로 바꿨습니다');
  }
  function openPrayerDoc() {
    var s = sermonById(ui.selectedId);
    if (!s) return;
    stashEditor(s);
    openDocModal({
      title: '기도문 미리보기',
      sub: (s.passage || '본문') + ' · 예배·소그룹용 기도문',
      html: prayerHTML(s),
      copyLabel: '기도문'
    });
    markStatus('prayer', '기도문을 만들었습니다 · 상태를 완료로 바꿨습니다');
  }

  /* ---- 말씀 묵상카드 (Canvas 1080×1080 · 사역세트1 수채화 톤) ---- */
  var CARD_SIZE = 1080;
  var CARD_SERIF = '"Noto Serif KR","Nanum Myeongjo","Apple SD Gothic Neo",serif';
  var CARD_SANS = '"Pretendard Variable",Pretendard,"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif';
  var CARD_PANEL = { x: 84, y: 96, w: 912, h: 888 };
  var CARD_TOP = 172, CARD_BOTTOM = 888, CARD_CONTENT_W = 764;
  var CARD_THEMES = [
    {
      id: 'sage', name: '세이지 그린', sw: '#BFD3BC',
      bg: ['#E4EEDE', '#CBDBc4'], blobs: ['#A6C2A3', '#BCD4B7', '#E3D8BA', '#9DBB9A'],
      panel: '#FFFDF7', ink: '#1F2F25', inkSoft: '#455A4C', accent: '#547862',
      gold: '#B99A55', band: '#F1E7D2', frame: 'rgba(255,255,255,.58)'
    },
    {
      id: 'cream', name: '웜 크림 골드', sw: '#EBD5A8',
      bg: ['#F8EDD7', '#EBD6AF'], blobs: ['#DFC38D', '#EFDCB1', '#D0B077', '#F6ECD5'],
      panel: '#FFFDF8', ink: '#3A2E1C', inkSoft: '#655133', accent: '#9A7030',
      gold: '#B88322', band: '#F6E6C6', frame: 'rgba(255,255,255,.62)'
    },
    {
      id: 'dawn', name: '새벽 하늘', sw: '#BBD0E6',
      bg: ['#DEEAF5', '#C5D8EC'], blobs: ['#A6C2DE', '#C0D5E8', '#E4CBD4', '#96B6D4'],
      panel: '#FCFDFF', ink: '#1F2F44', inkSoft: '#455A72', accent: '#4B7093',
      gold: '#B2945A', band: '#E9EFF7', frame: 'rgba(255,255,255,.60)'
    },
    {
      id: 'rose', name: '로즈 수채화', sw: '#E8BFC0',
      bg: ['#F9E6E5', '#EBCED0'], blobs: ['#DFAFAF', '#EEC9C3', '#D2BACE', '#E5BAB4'],
      panel: '#FFFDFB', ink: '#3B2828', inkSoft: '#664C4C', accent: '#96606A',
      gold: '#BA8677', band: '#F8E7E2', frame: 'rgba(255,255,255,.62)'
    }
  ];

  function hexA(hex, a) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function mulberry32(a) {
    return function () {
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function cardSeed(str) {
    var h = 2166136261;
    str = String(str);
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function wrapText(ctx, text, maxWidth) {
    var out = [];
    String(text == null ? '' : text).replace(/\s+/g, ' ').trim().split(' ').forEach(function (word) {
      if (!word) return;
      if (out.length && ctx.measureText(out[out.length - 1] + ' ' + word).width <= maxWidth) {
        out[out.length - 1] += ' ' + word;
        return;
      }
      if (ctx.measureText(word).width <= maxWidth) { out.push(word); return; }
      var chunk = '';
      for (var i = 0; i < word.length; i++) {
        var t2 = chunk + word[i];
        if (chunk && ctx.measureText(t2).width > maxWidth) { out.push(chunk); chunk = word[i]; }
        else chunk = t2;
      }
      if (chunk) out.push(chunk);
    });
    return out.length ? out : [''];
  }
  function drawSpaced(ctx, text, x, y, size, spacing, color, weight, family, align, lw) {
    ctx.font = weight + ' ' + size + 'px ' + family;
    var chars = String(text).split('');
    var ws = chars.map(function (c) { return ctx.measureText(c).width; });
    var total = ws.reduce(function (a, b) { return a + b; }, 0) + spacing * Math.max(0, chars.length - 1);
    var sx = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
    ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.lineJoin = 'round'; ctx.miterLimit = 2; }
    for (var i = 0; i < chars.length; i++) {
      if (lw) ctx.strokeText(chars[i], sx, y);
      ctx.fillText(chars[i], sx, y);
      sx += ws[i] + spacing;
    }
    return total;
  }
  function cardText(ctx, text, x, y, lw, color) {
    if (lw) {
      ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.lineJoin = 'round'; ctx.miterLimit = 2;
      ctx.strokeText(text, x, y);
    }
    ctx.fillText(text, x, y);
  }

  function cardShortMessage(t, max) {
    var x = String(t || '').replace(/\s+/g, ' ').trim();
    if (x.length <= max) return x;
    var head = x.slice(0, max);
    var i = head.lastIndexOf('.');
    if (i > max * 0.4) return head.slice(0, i + 1).trim();
    return cut(x, max);
  }
  function parseVerses(text) {
    var out = [];
    String(text || '').split(/\n+/).forEach(function (line) {
      var t = line.replace(/\s+/g, ' ').trim();
      if (!t) return;
      var m = t.match(/^(\d{1,3})\s*[.)]?\s+([\s\S]+)$/);
      if (m) out.push({ n: m[1], t: m[2].trim() });
      else out.push({ n: '', t: t });
    });
    return out;
  }
  function cardDataOf(s) {
    var nums = [], verses = [];
    String(s.central || '').split(',').forEach(function (p) {
      var m = p.match(/(\d+(?:\s*-\s*\d+)?)\s*절/);
      if (m) expandNums(m[1]).forEach(function (n) { if (nums.indexOf(n) < 0) nums.push(n); });
    });
    var got = verseLines(s, nums.join(','), 2);
    if (!got.length) got = verseLines(s, '', 2);
    var total = 0;
    got.forEach(function (v) { total += v.t.length; });
    while (got.length > 1 && total > 150) total -= got.pop().t.length;
    got.forEach(function (v) { verses.push({ n: v.n, t: v.t }); });

    var msg = String(s.message || '').trim();
    if (!msg) {
      var prac = practiceOf(s);
      msg = prac[0] || String(s.theme || '').trim();
    }
    var d = parseISO(s.date || todayISO());
    var dateStr = d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + '. (' + WD[d.getDay()] + ')';
    return {
      kicker: dateStr + ' · 말씀 묵상',
      passage: String(s.passageFull || s.passage || '본문 미정').replace(/\s+/g, ' ').trim(),
      title: String(s.title || '제목 없는 설교').replace(/\s+/g, ' ').trim(),
      verses: verses,
      message: cardShortMessage(msg, 104)
    };
  }

  function paintCardWash(ctx, th, seed) {
    var S = CARD_SIZE;
    var g = ctx.createLinearGradient(0, 0, S * 0.92, S);
    g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    var rnd = mulberry32(seed);
    for (var i = 0; i < 11; i++) {
      var x = rnd() * S, y = rnd() * S, r = 150 + rnd() * 320;
      var c = th.blobs[Math.floor(rnd() * th.blobs.length)];
      var rg = ctx.createRadialGradient(x, y, r * 0.04, x, y, r);
      rg.addColorStop(0, hexA(c, (0.34 + rnd() * 0.18).toFixed(3)));
      rg.addColorStop(0.52, hexA(c, 0.16));
      rg.addColorStop(1, hexA(c, 0));
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    for (var k = 0; k < 3; k++) {
      var cx = rnd() * S, cy = rnd() * S, er = 130 + rnd() * 210;
      ctx.strokeStyle = hexA(th.blobs[k % th.blobs.length], 0.13);
      ctx.lineWidth = 10 + rnd() * 12;
      ctx.beginPath(); ctx.ellipse(cx, cy, er, er * (0.68 + rnd() * 0.5), rnd() * Math.PI, 0, Math.PI * 2); ctx.stroke();
    }
    for (var n = 0; n < 2400; n++) {
      var gx = rnd() * S, gy = rnd() * S;
      ctx.fillStyle = 'rgba(88,74,54,' + (0.014 + rnd() * 0.03).toFixed(3) + ')';
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }
    var vg = ctx.createRadialGradient(S / 2, S / 2, S * 0.28, S / 2, S / 2, S * 0.80);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(34,28,18,0.13)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = th.frame; ctx.lineWidth = 3;
    rr(ctx, 30, 30, S - 60, S - 60, 22); ctx.stroke();
  }

  function cardLayout(ctx, d, scale) {
    var blocks = [];
    var CW = CARD_CONTENT_W;
    var ks = Math.round(21 * scale);
    blocks.push({ t: 'kicker', size: ks, h: Math.round(ks * 1.5), gap: 0, text: d.kicker });
    var ps = Math.round(28 * scale);
    blocks.push({ t: 'passage', size: ps, h: Math.round(ps * 1.5), gap: Math.round(10 * scale), text: d.passage });
    blocks.push({ t: 'rule', h: 1, gap: Math.round(22 * scale), w: Math.round(70 * scale) });

    var ts = Math.round(58 * scale), tl;
    for (;;) {
      ctx.font = '700 ' + ts + 'px ' + CARD_SERIF;
      tl = wrapText(ctx, d.title, CW);
      if (tl.length <= 3 || ts <= 30) break;
      ts -= Math.max(1, Math.round(ts * 0.06));
    }
    blocks.push({ t: 'title', size: ts, lines: tl, lh: ts * 1.34, h: Math.round(tl.length * ts * 1.34), gap: Math.round(24 * scale) });

    if (d.verses.length) {
      var vs = Math.round(35 * scale), padY = Math.round(30 * scale), padX = Math.round(34 * scale), vGap = Math.round(15 * scale);
      var inner = CW - padX * 2;
      var rows = d.verses.map(function (v) {
        var numW = 0;
        if (v.n) {
          ctx.font = '700 ' + Math.round(vs * 0.62) + 'px ' + CARD_SANS;
          numW = ctx.measureText(v.n).width + vs * 0.62;
        }
        ctx.font = '400 ' + vs + 'px ' + CARD_SERIF;
        return { n: v.n, numW: numW, lines: wrapText(ctx, v.t, inner - numW) };
      });
      var lh = vs * 1.62, vh = padY * 2;
      rows.forEach(function (r, i) { vh += r.lines.length * lh + (i ? vGap : 0); });
      blocks.push({ t: 'verse', size: vs, padX: padX, padY: padY, vGap: vGap, lh: lh, rows: rows, h: Math.round(vh), gap: Math.round(28 * scale) });
    }
    if (d.message) {
      blocks.push({ t: 'rule', h: 1, gap: Math.round(24 * scale), w: Math.round(54 * scale) });
      var ms = Math.round(28 * scale), ml;
      for (;;) {
        ctx.font = '400 ' + ms + 'px ' + CARD_SANS;
        ml = wrapText(ctx, d.message, Math.min(CW, 700));
        if (ml.length <= 4 || ms <= 20) break;
        ms -= 1;
      }
      blocks.push({ t: 'message', size: ms, lines: ml, lh: ms * 1.66, h: Math.round(ml.length * ms * 1.66), gap: 0 });
    }
    return { blocks: blocks, total: blocks.reduce(function (n, b) { return n + b.h + b.gap; }, 0) };
  }

  function drawCardBlocks(ctx, th, lay, top) {
    var CX = CARD_SIZE / 2, y = top;
    lay.blocks.forEach(function (b) {
      y += b.gap || 0;
      if (b.t === 'kicker') {
        drawSpaced(ctx, b.text, CX, y + b.h / 2, b.size, b.size * 0.15, th.accent, '600', CARD_SANS, 'center', b.size * 0.018);
      } else if (b.t === 'passage') {
        drawSpaced(ctx, b.text, CX, y + b.h / 2, b.size, b.size * 0.03, th.accent, '600', CARD_SANS, 'center', b.size * 0.022);
      } else if (b.t === 'rule') {
        ctx.strokeStyle = hexA(th.gold, 0.55); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(CX - b.w / 2, y + 0.5); ctx.lineTo(CX + b.w / 2, y + 0.5); ctx.stroke();
      } else if (b.t === 'title') {
        ctx.font = '700 ' + b.size + 'px ' + CARD_SERIF;
        ctx.fillStyle = th.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        b.lines.forEach(function (ln, i) { cardText(ctx, ln, CX, y + i * b.lh + b.lh / 2, b.size * 0.045, th.ink); });
      } else if (b.t === 'verse') {
        rr(ctx, CARD_PANEL.x + 74, y, CARD_CONTENT_W, b.h, 18);
        ctx.fillStyle = hexA(th.band, 0.92); ctx.fill();
        ctx.strokeStyle = hexA(th.gold, 0.18); ctx.lineWidth = 1; ctx.stroke();
        var yy = y + b.padY;
        b.rows.forEach(function (r, i) {
          if (i) yy += b.vGap;
          r.lines.forEach(function (ln, j) {
            ctx.font = '400 ' + b.size + 'px ' + CARD_SERIF;
            var w = ctx.measureText(ln).width;
            var x = CX - w / 2;
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            if (j === 0 && r.n) {
              ctx.font = '700 ' + Math.round(b.size * 0.62) + 'px ' + CARD_SANS;
              ctx.fillStyle = hexA(th.accent, 0.95);
              cardText(ctx, r.n, x - r.numW + b.size * 0.1, yy + b.lh / 2, b.size * 0.035, hexA(th.accent, 0.95));
              ctx.font = '400 ' + b.size + 'px ' + CARD_SERIF;
            }
            ctx.fillStyle = th.ink;
            ctx.fillText(ln, x, yy + b.lh / 2);
            yy += b.lh;
          });
        });
      } else if (b.t === 'message') {
        ctx.font = '400 ' + b.size + 'px ' + CARD_SANS;
        ctx.fillStyle = th.inkSoft; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        b.lines.forEach(function (ln, i) { ctx.fillText(ln, CX, y + i * b.lh + b.lh / 2); });
      }
      y += b.h;
    });
  }

  function paintCard(canvas, d, th, seedStr) {
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CARD_SIZE, CARD_SIZE);
    paintCardWash(ctx, th, cardSeed(seedStr + '|' + th.id));

    var P = CARD_PANEL;
    ctx.save();
    ctx.shadowColor = 'rgba(52,40,26,.20)'; ctx.shadowBlur = 52; ctx.shadowOffsetY = 20;
    rr(ctx, P.x, P.y, P.w, P.h, 26); ctx.fillStyle = th.panel; ctx.fill();
    ctx.restore();
    ctx.strokeStyle = hexA(th.gold, 0.30); ctx.lineWidth = 1.4;
    rr(ctx, P.x, P.y, P.w, P.h, 26); ctx.stroke();
    ctx.strokeStyle = hexA(th.gold, 0.15); ctx.lineWidth = 1;
    rr(ctx, P.x + 14, P.y + 14, P.w - 28, P.h - 28, 18); ctx.stroke();

    var lay, scale = 1;
    for (var i = 0; i < 24; i++) {
      lay = cardLayout(ctx, d, scale);
      if (lay.total <= (CARD_BOTTOM - CARD_TOP) || scale <= 0.70) break;
      scale -= 0.03;
    }
    var startY = CARD_TOP + Math.max(0, ((CARD_BOTTOM - CARD_TOP) - lay.total) / 2);
    drawCardBlocks(ctx, th, lay, startY);

    var fy = P.y + P.h - 58;
    drawSpaced(ctx, '세리토스장로교회', P.x + 74, fy, 17, 2.4, hexA(th.accent, 0.9), '600', CARD_SANS, 'left', 0.4);
    drawSpaced(ctx, '하베스터 뮤직 유효석 목사', P.x + P.w - 74, fy, 17, 2.4, hexA(th.accent, 0.9), '600', CARD_SANS, 'right', 0.4);
    ctx.restore();
  }

  function ensureCardFonts(sample) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var t = String(sample || '');
    var faces = [
      '700 56px "Noto Serif KR"', '400 35px "Noto Serif KR"',
      '700 22px "Noto Sans KR"', '400 27px "Noto Sans KR"'
    ];
    return Promise.all(faces.map(function (f) {
      try { return document.fonts.load(f, t); } catch (e) { return Promise.resolve(); }
    })).then(function () { return document.fonts.ready; })['catch'](function () { });
  }

  function cardFileName(s) {
    var pass = String(s.passage || '본문').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
    return String(s.date) + '_' + pass + '_말씀묵상카드.png';
  }
  function saveCardPng(canvas, s, btn) {
    var old = btn ? btn.innerHTML : '';
    var restore = function () { if (btn) { btn.disabled = false; btn.innerHTML = old; } };
    if (btn) { btn.disabled = true; btn.innerHTML = '저장하는 중…'; }
    var finish = function (url, revoke) {
      restore();
      var name = cardFileName(s);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () {
        if (a.parentNode) a.parentNode.removeChild(a);
        if (revoke) URL.revokeObjectURL(url);
      }, 2000);
      toast('말씀 묵상카드를 저장했습니다 · ' + name);
    };
    try {
      if (canvas.toBlob) {
        canvas.toBlob(function (blob) {
          if (!blob) { restore(); toast('이미지를 만들지 못했습니다 — 잠시 뒤 다시 눌러 주세요'); return; }
          finish(URL.createObjectURL(blob), true);
        }, 'image/png');
      } else {
        finish(canvas.toDataURL('image/png'), false);
      }
    } catch (e) {
      restore();
      toast('이미지를 저장하지 못했습니다 — ' + (e && e.message ? e.message : e));
    }
  }

  function openCardModal() {
    var s = sermonById(ui.selectedId);
    if (!s) return;
    stashEditor(s);
    var data = cardDataOf(s);
    var state = {
      theme: 0,
      kicker: data.kicker,
      passage: data.passage,
      title: data.title,
      verse: data.verses.map(function (v) { return (v.n ? v.n + ' ' : '') + v.t; }).join('\n'),
      message: data.message,
      seed: String(s.id) + '|' + String(s.date)
    };
    var root = document.getElementById('modalRoot');
    var back = document.createElement('div');
    back.className = 'modal-back card-back';
    back.innerHTML =
      '<div class="modal card-modal" role="dialog" aria-modal="true">' +
      '<div class="doc-bar">' +
      '<div class="doc-bar-t"><strong>말씀 묵상카드 미리보기</strong><span>' + esc(data.passage) + ' · 1080×1080 PNG · 수채화 4가지 테마</span></div>' +
      '<div class="doc-bar-b">' +
      '<button type="button" class="btn-solid" data-card-save>PNG 이미지 저장</button>' +
      '<button type="button" class="btn-line" data-card-close>닫기</button>' +
      '</div></div>' +
      '<div class="card-body">' +
      '<div class="card-stage"><canvas id="cardCanvas" width="' + CARD_SIZE + '" height="' + CARD_SIZE + '"></canvas></div>' +
      '<div class="card-panel">' +
      '<div class="card-field"><span>배경 테마</span><div class="card-themes">' +
      CARD_THEMES.map(function (t, i) {
        return '<button type="button" class="card-theme' + (i === 0 ? ' on' : '') + '" data-theme="' + i + '">' +
          '<i style="background:' + t.sw + '"></i>' + esc(t.name) + '</button>';
      }).join('') +
      '</div></div>' +
      '<label class="card-field"><span>중심 구절</span>' +
      '<textarea data-card-verse rows="4" spellcheck="false"></textarea></label>' +
      '<label class="card-field"><span>묵상 한 줄</span>' +
      '<textarea data-card-message rows="3" spellcheck="false"></textarea></label>' +
      '<p class="card-hint">설교 제목과 본문 주소는 위의 제목·본문 칸에서 그대로 가져옵니다. 구절은 줄마다 절 번호를 앞에 두면 그대로 표시됩니다.</p>' +
      '<button type="button" class="btn-solid card-save" data-card-save>PNG 이미지 저장 (1080×1080)</button>' +
      '</div></div></div>';
    root.appendChild(back);

    var canvas = back.querySelector('#cardCanvas');
    var verseEl = back.querySelector('[data-card-verse]');
    var msgEl = back.querySelector('[data-card-message]');
    verseEl.value = state.verse;
    msgEl.value = state.message;

    var raf = 0;
    var draw = function () {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        try {
          paintCard(canvas, {
            kicker: state.kicker, passage: state.passage, title: state.title,
            verses: parseVerses(state.verse), message: state.message
          }, CARD_THEMES[state.theme], state.seed);
        } catch (e) { toast('카드를 그리지 못했습니다 — ' + (e && e.message ? e.message : e)); }
      });
    };
    draw();
    ensureCardFonts(data.title + data.verses.map(function (v) { return v.t; }).join('')).then(draw);

    Array.prototype.forEach.call(back.querySelectorAll('[data-theme]'), function (btn) {
      btn.addEventListener('click', function () {
        state.theme = +btn.getAttribute('data-theme') || 0;
        Array.prototype.forEach.call(back.querySelectorAll('[data-theme]'), function (b) { b.classList.toggle('on', b === btn); });
        draw();
      });
    });
    verseEl.addEventListener('input', function () { state.verse = verseEl.value; draw(); });
    msgEl.addEventListener('input', function () { state.message = msgEl.value; draw(); });

    var onKey = function (e) { if (e.key === 'Escape') close(); };
    function close() {
      document.removeEventListener('keydown', onKey);
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      if (back.parentNode) root.removeChild(back);
    }
    document.addEventListener('keydown', onKey);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    back.querySelector('[data-card-close]').addEventListener('click', close);
    Array.prototype.forEach.call(back.querySelectorAll('[data-card-save]'), function (btn) {
      btn.addEventListener('click', function () { saveCardPng(canvas, s, btn); });
    });
    return back;
  }

  /* ---------------- modal ---------------- */
  function openModal(opts) {
    var root = document.getElementById('modalRoot');
    var back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' +
      '<header><h3>' + esc(opts.title) + '</h3></header>' +
      '<div class="body"></div>' +
      '<footer><button type="button" class="btn-line" data-cancel>' + esc(opts.cancelText || '취소') + '</button>' +
      '<button type="button" class="' + (opts.danger ? 'btn-line danger' : 'btn-solid') + '" data-ok>' + esc(opts.okText || '확인') + '</button></footer></div>';
    if (typeof opts.body === 'string') back.querySelector('.body').innerHTML = opts.body;
    root.appendChild(back);
    function close() { root.removeChild(back); }
    back.querySelector('[data-cancel]').addEventListener('click', close);
    back.closeModal = close;
    back.querySelector('[data-ok]').addEventListener('click', function () {
      var keep = opts.onOk ? opts.onOk() : null;
      if (keep !== false) close();
    });
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
    return back;
  }
  function confirmModal(o) { return openModal(o); }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    buildNav();
    loadArchiveIndex();
    document.getElementById('menuBtn').addEventListener('click', openDrawer);
    document.getElementById('overlay').addEventListener('click', closeDrawer);
    document.getElementById('exportBtn').addEventListener('click', exportJson);
    document.getElementById('importBtn').addEventListener('click', function () { document.getElementById('importFile').click(); });
    document.getElementById('importFile').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) importJson(f);
      e.target.value = '';
    });
    if (ui.tab === 'library' && ui.view === 'detail' && !sermonById(ui.selectedId)) { ui.view = 'list'; }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
