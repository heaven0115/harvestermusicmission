(function () {
  'use strict';

  var DEFAULT = window.MINISTRY_DATA;
  var FULL_VER = '20261127a';
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

    var fullBtn = '<div class="full-bar"><div class="full-bar-t"><strong>원고 전체 보기</strong>' +
      '<span>표지부터 Ⅷ. 게시 제목까지 원본 워드 원고 그대로 이어서 읽습니다</span></div>' +
      '<button type="button" class="btn-solid" id="openFullDoc">📄 원고 전체 보기</button></div>';

    var gen = '<div class="gen-bar">' +
      '<div class="gen-head"><strong>자료 자동 생성</strong><span>효석패턴6 여덟 구성을 읽어 10분 원고·PPT·교재·기도문·말씀카드까지 만들어 드립니다</span></div>' +
      '<div class="gen-actions">' +
      '<button type="button" class="gen-btn" id="genPpt"><span class="ico">📊</span><span class="tx"><strong>PPT 만들기 (.pptx)</strong><small>표지부터 기도·찬송까지 8장</small></span></button>' +
      '<button type="button" class="gen-btn" id="genStudy"><span class="ico">📖</span><span class="tx"><strong>성경공부 교재 만들기</strong><small>인쇄 · PDF · 복사</small></span></button>' +
      '<button type="button" class="gen-btn" id="genPrayer"><span class="ico">🙏</span><span class="tx"><strong>기도문 만들기</strong><small>예배 · 소그룹용</small></span></button>' +
      '<button type="button" class="gen-btn" id="genCard"><span class="ico">🖼️</span><span class="tx"><strong>말씀 묵상카드 만들기</strong><small>정사각 1080 · PNG 저장</small></span></button>' +
      '<button type="button" class="gen-btn gen-ten" id="genTen"><span class="ico">📝</span><span class="tx"><strong>10분 설교 원고 만들기</strong><small>강단 낭독용 10분 압축 · 18pt 인쇄 · 복사 · 새벽예배 형식</small></span></button>' +
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
      fields + statuses + fullBtn + gen +
      '<div class="detail-body">' +
      '<div class="outline-pane"><div class="pane-title">효석패턴6 · 고정 구성</div>' + outline + '</div>' +
      '<div class="editor-pane">' +
      '<div class="editor-head"><h2 id="sectionTitle">' + esc(currentSection().name) + '</h2>' +
      '<label class="check"><input type="checkbox" id="reviewCheck"' + ((s.reviewed && s.reviewed[ui.section]) ? ' checked' : '') + '> 검토 완료</label></div>' +
      '<div class="editor" id="editor" contenteditable="true" spellcheck="false" data-placeholder="이 구성은 아직 비어 있습니다. 여기에 준비 내용을 적어 두세요."></div>' +
      '<div class="editor-foot"><span id="charCount"></span>' +
      '<button type="button" class="foot-link" id="openFullDocFoot">원고 전체 보기 →</button>' +
      '<span>' + esc(s.passage || '본문 미정') + ' · ' + esc(s.date) + '</span></div>' +
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
    fetch('archive/index.json', { cache: 'no-cache' }).then(function (r) {
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
      fetch('archive/' + k + '.json', { cache: 'no-cache' }).then(function (r) {
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

  function arcSearchKeys() {
    if (ui.arcYear && ui.arcYear !== '전체') return [ui.arcYear === '연도미상' ? 'unknown' : ui.arcYear];
    return (ARC.index.years || []).map(function (y) { return y.label === '연도미상' ? 'unknown' : y.label; });
  }

  function arcBodiesPending() {
    var q = (ui.arcQ || '').trim();
    if (q.length < 2) return false;
    return arcSearchKeys().some(function (k) { return !ARC.bodies[k]; });
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
    if ((ui.arcQ || '').trim().length >= 2 && arcBodiesPending()) return '본문을 불러오는 중…';
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
          (it.chars ? '<span>' + esc(String(it.chars).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) + '자</span>' : '') +
          '</span></span>' +
          ICON.arrow + '</button>';
      }).join('') + '</div>';
    }
    return html;
  }

  function arcGenBarHTML() {
    return '<div class="arc-gen"><div class="gen-bar">' +
      '<div class="gen-head"><strong>자료 자동 생성</strong><span>이 원고를 읽어 PPT·교재·기도문·말씀카드까지 만들어 드립니다</span></div>' +
      '<div class="gen-actions">' +
      '<button type="button" class="gen-btn" id="arcGenPpt"><span class="ico">📊</span><span class="tx"><strong>PPT 만들기 (.pptx)</strong><small>표지부터 기도·찬송까지</small></span></button>' +
      '<button type="button" class="gen-btn" id="arcGenStudy"><span class="ico">📖</span><span class="tx"><strong>성경공부 교재 만들기</strong><small>인쇄 · PDF · 복사</small></span></button>' +
      '<button type="button" class="gen-btn" id="arcGenPrayer"><span class="ico">🙏</span><span class="tx"><strong>기도문 만들기</strong><small>예배 · 소그룹용</small></span></button>' +
      '<button type="button" class="gen-btn" id="arcGenCard"><span class="ico">🖼️</span><span class="tx"><strong>말씀 묵상카드 만들기</strong><small>정사각 1080 · PNG 저장</small></span></button>' +
      '</div></div></div>';
  }

  function arcReaderHTML(it) {
    var key = arcYearKey(it);
    var body = (ARC.bodies[key] || {})[it.id] || '';
    var paras = body ? body.split('\n') : [];
    var bodyHTML = paras.map(function (line) {
      return line ? '<p>' + esc(line) + '</p>' : '';
    }).join('');
    var when = it.date ? ((+it.date.split('-')[0]) + '. ' + (+it.date.split('-')[1]) + '. ' + (+it.date.split('-')[2]) + ' (' + weekdayOf(it.date) + ')') : (it.year ? it.year + '년' : '연도 미상');
    var svcLine = (it.service && it.service !== '기타') ? ' · ' + (/예배$/.test(it.service) ? it.service : it.service + '예배') : '';
    return '<div class="arc-reader' + (ARC.big ? ' arc-big' : '') + '">' +
      '<div class="arc-actions">' +
      '<button type="button" class="btn-line arc-back" id="arcBack">' + ICON.chevL + '목록으로</button>' +
      '<span class="arc-actions-right">' +
      '<button type="button" class="btn-line" id="arcBig">큰 글씨 (18pt)</button>' +
      '<button type="button" class="btn-line" id="arcCopy">내용 복사</button>' +
      '<button type="button" class="btn-solid" id="arcPrint">' + (isStandaloneApp() ? 'PDF로 저장' : '인쇄 / PDF 저장') + '</button>' +
      '</span></div>' +
      '<article class="arc-doc">' +
      '<p class="arc-kicker">' + esc(when) + esc(svcLine) + '</p>' +
      '<h1 class="arc-doc-title">' + esc(arcHeading(it)) + '</h1>' +
      (it.scripture ? '<p class="arc-doc-ref">본문 · ' + esc(it.scripture) + '</p>' : '') +
      arcGenBarHTML() +
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
    var art = document.querySelector('.arc-doc');
    var btn = document.getElementById('arcPrint');
    var big = !!document.querySelector('.arc-reader.arc-big');
    var asPdf = function () {
      if (!art) { toast('원고를 찾지 못했습니다'); return; }
      pdfExport({ docEl: art, host: art.parentNode, before: art, strip: ['.arc-gen'], extraClass: big ? 'arc-big' : '', btn: btn });
    };
    if (isStandaloneApp() || typeof window.print !== 'function') { asPdf(); return; }
    document.body.classList.add('arc-print');
    var cleanup = function () {
      window.removeEventListener('afterprint', cleanup);
      document.removeEventListener('afterprint', cleanup);
      document.body.classList.remove('arc-print');
    };
    window.addEventListener('afterprint', cleanup);
    document.addEventListener('afterprint', cleanup);
    setTimeout(cleanup, 60000);
    try { window.print(); } catch (e) { cleanup(); asPdf(); }
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
    if ($('genTen')) $('genTen').addEventListener('click', tenOpenDoc);
    if ($('openFullDoc')) $('openFullDoc').addEventListener('click', function () { openFullDoc(sermonById(ui.selectedId)); });
    if ($('openFullDocFoot')) $('openFullDocFoot').addEventListener('click', function () { openFullDoc(sermonById(ui.selectedId)); });
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
    if (arcQ && (ui.arcQ || '').trim().length >= 2 && arcBodiesPending()) {
      loadArcBodies(arcSearchKeys(), function () {
        if (ui.tab === 'archive' && !ARC.selected) render();
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
    if ($('arcGenPpt')) $('arcGenPpt').addEventListener('click', function () { generateArcPptx(this); });
    if ($('arcGenStudy')) $('arcGenStudy').addEventListener('click', openArcStudy);
    if ($('arcGenPrayer')) $('arcGenPrayer').addEventListener('click', openArcPrayer);
    if ($('arcGenCard')) $('arcGenCard').addEventListener('click', openArcCard);


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

  /* ================= 자료 생성 공통 모델 ================= */
  function stripEnd(t) {
    return String(t == null ? '' : t).replace(/\s+/g, ' ').trim().replace(/[\s.。!?]+$/, '');
  }
  function firstSentence(t, max) {
    var x = String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
    if (!x) return '';
    var m = x.match(/^(.{8,}?[.!?])(\s|$)/);
    var s = m ? m[1] : x;
    return max ? cut(s, max) : s;
  }
  function quoteShort(t, max) {
    var x = String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
    var q = x.match(/[“"']([^”"']{6,90})[”"']/);
    if (q) return cut(q[1], max || 80);
    return cut(x, max || 80);
  }
  function versesByNums(list, nums, max) {
    var out = [];
    (list || []).forEach(function (v) {
      if (!nums || !nums.length || nums.indexOf(+v.n) > -1) out.push({ n: v.n, t: v.t });
    });
    return max ? out.slice(0, max) : out;
  }

  function sermonModel(s) {
    var preset = presetOf(s);
    var rows = Object.keys(preset).filter(function (k) {
      return !/^(\d+\.|설교 제목|2\. 본문 전체 인용)/.test(k);
    }).map(function (k) { return { k: k, v: preset[k] }; });
    var pts = pointsOf(s).map(function (p) {
      return { ord: p.ord, ref: p.ref, text: p.text, apply: p.apply, verses: verseLines(s, p.ref, 2), paras: [] };
    });
    return {
      filled: false,
      kind: 'sermon',
      id: s.id,
      title: s.title || '제목 없는 설교',
      passage: s.passageFull || s.passage || '본문 미정',
      passageShort: s.passage || '',
      date: s.date || '',
      when: s.date ? (dateLabel(s.date) + ' ' + weekdayOf(s.date)) : '',
      serviceText: '새벽예배',
      series: s.series || '',
      central: s.central || '',
      centralText: centralVerses(s),
      theme: preset['중심 주제'] || s.theme || '',
      core: preset['신학적 핵심'] || s.message || '',
      motifs: preset['주요 모티프'] || '',
      verses: verseLines(s, '', 0),
      summaryRows: rows,
      contexts: contextRows(s),
      hebrew: hebrewRows(s),
      keyLines: [],
      points: pts,
      questions: questionsOf(s),
      practice: practiceOf(s),
      prayer: prayerBody(s),
      hymns: hymnList(s)
    };
  }

  function pptxFileName(m) {
    var pass = String(m.passage || '본문').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
    return String(m.fileStamp || m.date || '') + '_' + pass + '_설교PPT.pptx';
  }

  /* ---- PPT (모델 → 8장 덱) ---- */
  function deckOf(m) {
    var PptxGenJS = window.PptxGenJS;
    if (!PptxGenJS) return null;
    var C = {
      forest: '1F5B3F', deep: '17452F', cream: 'F8FAF8', ink: '16202E',
      muted: '6E7C75', sage: 'E9F2EC', sageLine: 'DDE8E1', gold: 'C6A15B',
      soft: 'C9DBD0', dim: '9DBBA9'
    };
    var F = 'Apple SD Gothic Neo';
    var W = 13.333, H = 7.5, M = 0.95, CW = W - M * 2;

    var points = (m.points || []).slice(0, 3);
    if (!points.length && m.verses && m.verses.length) {
      points = [];
    }
    var total = 5 + (points.length || 1);
    var theme = m.theme || m.core || '';
    var core = m.core || m.theme || '';
    var dateStr = m.when || '';

    var pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = '효석패턴6';
    pptx.company = '세리토스장로교회';
    pptx.subject = m.passage || '';
    pptx.title = m.title || '설교 PPT';

    function foot(sl, n) {
      sl.addText('세리토스장로교회 · 설교 자료', { x: M, y: H - 0.52, w: 5.4, h: 0.3, fontFace: F, fontSize: 10, color: C.muted });
      sl.addText(n + ' / ' + total, { x: W - M - 1.1, y: H - 0.52, w: 1.1, h: 0.3, fontFace: F, fontSize: 10, color: C.muted, align: 'right' });
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
    sl.addText((m.series ? m.series + '  ·  ' : '') + (dateStr ? dateStr + '  ·  ' : '') + (m.serviceText || '예배'),
      { x: M, y: 1.02, w: CW, h: 0.4, fontFace: F, fontSize: 15, color: C.soft, charSpacing: 1, valign: 'middle' });
    sl.addText(m.title || '제목 없는 설교',
      { x: M, y: 1.52, w: CW, h: 2.3, fontFace: F, fontSize: 40, bold: true, color: C.cream, lineSpacingMultiple: 1.12, valign: 'middle', fit: 'shrink' });
    sl.addShape(pptx.ShapeType.rect, { x: M, y: 4.12, w: 1.7, h: 0.055, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    sl.addText([
      { text: '본문   ', options: { color: C.dim, fontSize: 16 } },
      { text: (m.passage || '본문 미정'), options: { color: C.cream, fontSize: 20, bold: true } }
    ], { x: M, y: 4.4, w: CW, h: 0.58, fontFace: F, valign: 'middle' });
    sl.addText(cut(theme, 170),
      { x: M, y: 5.12, w: CW - 1.2, h: 1.0, fontFace: F, fontSize: 14, color: C.soft, lineSpacingMultiple: 1.35, valign: 'top', fit: 'shrink' });
    sl.addText('세리토스장로교회  ·  말씀 자료', { x: M, y: H - 0.7, w: 6.4, h: 0.3, fontFace: F, fontSize: 11, color: C.dim });

    /* 2. 중심 구절 · 핵심 */
    var vtxt = (m.centralText && m.centralText.length) ? m.centralText.join('\n') : (m.central || theme || m.passage || '');
    sl = pptx.addSlide();
    sl.background = { color: C.cream };
    kicker(sl, '중심 구절  ·  ' + (m.central || m.passage || ''));
    sl.addText(vtxt, { x: M, y: 1.12, w: CW, h: 2.6, fontFace: F, fontSize: 22, color: C.ink, lineSpacingMultiple: 1.4, valign: 'top', fit: 'shrink' });
    sl.addShape(pptx.ShapeType.rect, { x: M, y: 3.92, w: CW, h: 1.66, fill: { color: C.sage }, line: { color: C.sageLine, width: 1 } });
    sl.addText('신학적 핵심', { x: M + 0.34, y: 4.06, w: 4, h: 0.3, fontFace: F, fontSize: 11.5, bold: true, color: C.forest });
    sl.addText(cut(core, 230), { x: M + 0.34, y: 4.38, w: CW - 0.68, h: 1.05, fontFace: F, fontSize: 15, color: C.ink, lineSpacingMultiple: 1.35, valign: 'top', fit: 'shrink' });
    if (m.motifs) {
      sl.addText([
        { text: '주요 모티프   ', options: { color: C.forest, bold: true, fontSize: 11.5 } },
        { text: cut(m.motifs, 180), options: { color: C.muted, fontSize: 12.5 } }
      ], { x: M, y: 5.76, w: CW, h: 0.95, fontFace: F, valign: 'top', lineSpacingMultiple: 1.4 });
    }
    foot(sl, 2);

    /* 3. 핵심 원어 (없으면 핵심 문장) */
    sl = pptx.addSlide();
    sl.background = { color: C.cream };
    var heb = (m.hebrew || []).slice(0, 8);
    if (heb.length) {
      kicker(sl, '핵심 원어  ·  ' + (m.passage || ''));
      heading(sl, '말씀을 여는 원어', 0.98, 26);
      var colW = (CW - 0.7) / 2;
      heb.forEach(function (r, i) {
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
      kicker(sl, '말씀을 여는 문장  ·  ' + (m.passage || ''));
      heading(sl, '본문의 핵심 문장', 0.98, 26);
      var kl = (m.keyLines && m.keyLines.length ? m.keyLines : (m.verses || []).filter(function (v) { return v.t.length > 24; }).map(function (v) { return v.t; })).slice(0, 3);
      if (!kl.length) kl = [m.central || core || m.title || ''];
      kl.forEach(function (t, i) {
        var qy = 2.12 + i * 1.5;
        sl.addShape(pptx.ShapeType.rect, { x: M, y: qy + 0.02, w: 0.07, h: 1.2, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
        sl.addText('“' + cut(stripEnd(t), 118) + '”',
          { x: M + 0.34, y: qy, w: CW - 0.34, h: 1.24, fontFace: F, fontSize: 17, color: C.ink, lineSpacingMultiple: 1.42, valign: 'middle', fit: 'shrink' });
      });
    }
    foot(sl, 3);

    /* 4-6. 대지 */
    var made = 0;
    points.forEach(function (p, i) {
      made += 1;
      sl = pptx.addSlide();
      sl.background = { color: C.cream };
      sl.addShape(pptx.ShapeType.rect, { x: M, y: 0.72, w: 0.1, h: 0.44, fill: { color: C.forest }, line: { color: C.forest, width: 0 } });
      sl.addText(p.ord + ' 대지' + (p.ref ? '  ·  ' + p.ref : ''),
        { x: M + 0.3, y: 0.66, w: CW - 0.3, h: 0.46, fontFace: F, fontSize: 13, bold: true, color: C.forest, valign: 'middle', charSpacing: 0.8 });
      sl.addText(p.text || '', { x: M, y: 1.32, w: CW, h: 2.1, fontFace: F, fontSize: 30, bold: true, color: C.ink, lineSpacingMultiple: 1.22, valign: 'middle', fit: 'shrink' });
      var vv = p.verses && p.verses.length ? p.verses : versesByNums(m.verses, expandNums(p.ref || ''), 2);
      if (vv.length) {
        sl.addText(vv.map(function (v) { return v.n + '  ' + v.t; }).join('\n'),
          { x: M, y: 3.55, w: CW, h: 1.35, fontFace: F, fontSize: 13, color: C.muted, lineSpacingMultiple: 1.45, valign: 'top', fit: 'shrink' });
      }
      if (p.apply) {
        sl.addShape(pptx.ShapeType.rect, { x: M, y: 5.05, w: CW, h: 1.18, fill: { color: C.sage }, line: { color: C.sageLine, width: 1 } });
        sl.addText([
          { text: '삶의 적용    ', options: { fontSize: 11, bold: true, color: C.forest } },
          { text: cut(p.sermonNoteForApply || p.applyShort || p.apply, 120), options: { fontSize: 14.5, color: C.ink } }
        ], { x: M + 0.3, y: 5.13, w: CW - 0.6, h: 1.02, fontFace: F, valign: 'middle', lineSpacingMultiple: 1.3, fit: 'shrink' });
      }
      foot(sl, 4 + i);
    });
    if (!made) {
      /* 대지가 없으면 본문 관찰 장면으로 대신한다 */
      sl = pptx.addSlide();
      sl.background = { color: C.cream };
      kicker(sl, '본문 관찰  ·  ' + (m.passage || ''));
      heading(sl, '말씀을 함께 읽습니다', 0.98, 26);
      var vl = (m.verses || []).slice(0, 4);
      sl.addText(vl.length ? vl.map(function (v) { return v.n + '  ' + cut(v.t, 90); }).join('\n\n') : (m.central || theme || ''),
        { x: M, y: 2.0, w: CW, h: 4.0, fontFace: F, fontSize: 15, color: C.ink, lineSpacingMultiple: 1.6, valign: 'top', fit: 'shrink' });
      foot(sl, 4);
    }

    /* 소그룹 질문 */
    sl = pptx.addSlide();
    sl.background = { color: C.cream };
    kicker(sl, '소그룹 나눔  ·  ' + (m.passage || ''));
    heading(sl, (m.questions && m.questions.length) ? '삶을 향한 세 가지 질문' : '이번 주 실천', 0.98, 26);
    if (m.questions && m.questions.length) {
      m.questions.slice(0, 3).forEach(function (q, i) {
        var qy = 2.16 + i * 1.58;
        sl.addText('0' + (i + 1), { x: M, y: qy, w: 0.72, h: 0.5, fontFace: F, fontSize: 20, bold: true, color: C.gold });
        sl.addText(cut(q.q, 68), { x: M + 0.72, y: qy - 0.08, w: CW - 0.72, h: 0.66, fontFace: F, fontSize: 19, bold: true, color: C.ink, valign: 'middle', fit: 'shrink' });
        if (q.d) sl.addText(cut(q.d, 110), { x: M + 0.72, y: qy + 0.62, w: CW - 0.72, h: 0.62, fontFace: F, fontSize: 12.5, color: C.muted, lineSpacingMultiple: 1.35, valign: 'top', fit: 'shrink' });
      });
    } else {
      var prac = m.practice || [];
      if (!prac.length) prac = points.map(function (p) { return cut(p.apply || p.text, 90); }).filter(Boolean);
      sl.addText(prac.length ? prac.map(function (t, i) { return (i + 1) + '.  ' + t; }).join('\n\n') : '이번 주 실천 과제가 아직 비어 있습니다.',
        { x: M, y: 2.1, w: CW, h: 3.6, fontFace: F, fontSize: 16, color: C.ink, lineSpacingMultiple: 1.5, valign: 'top', fit: 'shrink' });
    }
    foot(sl, total - 1);

    /* 마무리 기도 · 찬송 */
    sl = pptx.addSlide();
    sl.background = { color: C.cream };
    kicker(sl, '마무리 기도  ·  찬송');
    heading(sl, '함께 기도하며 마무리합니다', 0.98, 24);
    var pray = (m.prayer || []).filter(function (b) { return String(b).length > 12; }).slice(0, 3).map(function (b) { return cut(b, 170); });
    while (pray.length > 1 && pray.join('\n').length > 460) pray.pop();
    sl.addText(pray.length ? pray.join('\n') : (m.prayer || []).join('\n'),
      { x: M, y: 1.6, w: 7.5, h: 3.5, fontFace: F, fontSize: 13.5, color: C.ink, lineSpacingMultiple: 1.5, valign: 'top', fit: 'shrink' });
    sl.addText('우리 구주 예수 그리스도의 이름으로 기도드립니다. 아멘.',
      { x: M, y: 5.2, w: 7.5, h: 0.4, fontFace: F, fontSize: 12.5, bold: true, color: C.forest, valign: 'middle' });
    var hymns = (m.hymns || []).slice(0, 3);
    sl.addShape(pptx.ShapeType.rect, { x: 8.9, y: 1.6, w: 3.45, h: 3.9, fill: { color: C.sage }, line: { color: C.sageLine, width: 1 } });
    sl.addText(hymns.length ? '추천 찬송' : '이번 주 실천', { x: 9.12, y: 1.76, w: 3.0, h: 0.3, fontFace: F, fontSize: 11.5, bold: true, color: C.forest });
    var side = hymns.length ? hymns.map(function (h, i) {
      var tag = i === 0 ? '설교 전' : i === 1 ? '설교 후' : '묵상';
      return tag + '\n' + (h.no ? h.no + '장' : '') + (h.title ? '  ' + h.title : '');
    }).join('\n\n') : ((m.practice || []).slice(0, 3).map(function (t, i) { return (i + 1) + '.  ' + cut(t, 40); }).join('\n\n') || '이번 주 말씀을 붙들고 살아갑니다.');
    sl.addText(side, { x: 9.12, y: 2.12, w: 3.05, h: 3.2, fontFace: F, fontSize: 12, color: C.ink, lineSpacingMultiple: 1.45, valign: 'top', fit: 'shrink' });
    foot(sl, total);

    return pptx;
  }

  function buildDeck(s) { return deckOf(sermonModel(s)); }

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

  /* ---- 원고 전체(표지 ~ Ⅷ) ---- */
  var fullState = 'idle', fullQueue = [];
  function fullDocs() { return (window.MINISTRY_FULL && window.MINISTRY_FULL.docs) || null; }
  function loadFullDocs(cb) {
    var docs = fullDocs();
    if (docs) { cb(docs); return; }
    fullQueue.push(cb);
    if (fullState === 'loading' || fullState === 'error') return;
    fullState = 'loading';
    var sc = document.createElement('script');
    sc.src = 'full.js?v=' + FULL_VER;
    sc.onload = function () {
      fullState = fullDocs() ? 'done' : 'error';
      var q = fullQueue; fullQueue = [];
      q.forEach(function (fn) { fn(fullDocs()); });
    };
    sc.onerror = function () {
      fullState = 'error';
      var q = fullQueue; fullQueue = [];
      q.forEach(function (fn) { fn(null); });
    };
    document.head.appendChild(sc);
  }
  /* 원본 워드 원고가 없거나 불러오지 못할 때: 여덟 구성을 순서대로 이어 붙입니다. */
  function fallbackBlocks(s) {
    var out = [['sub', esc(s.passage || '') + '  ·  ' + esc(s.date || '')]];
    SECTIONS.forEach(function (sec) {
      var t = secText(s, sec.id);
      if (!t) return;
      out.push(['sec', esc(sec.no + '. ' + sec.name)]);
      String(t).split(/\n{2,}/).forEach(function (b) {
        var v = b.trim();
        if (v) out.push(['p', esc(v)]);
      });
    });
    return out;
  }
  function fullDocHTML(s) {
    var docs = fullDocs();
    var doc = docs && docs[s.id];
    var blocks = (doc && doc.blocks && doc.blocks.length) ? doc.blocks : fallbackBlocks(s);
    var out = '<div class="doc full-doc">';
    if (!doc) out += '<p class="doc-note">원본 워드 원고가 없어 여덟 구성을 순서대로 이어 붙였습니다.</p>';
    var open = false;
    blocks.forEach(function (b) {
      var k = b[0], v = b[1];
      if (k === 'table') {
        out += '<table class="doc-table">' + v.map(function (row, i) {
          var tag = i === 0 ? 'th' : 'td';
          return '<tr>' + row.map(function (c) { return '<' + tag + '>' + c + '</' + tag + '>'; }).join('') + '</tr>';
        }).join('') + '</table>';
        return;
      }
      if (k === 'sec') {
        if (open) out += '</section>';
        out += '<section class="doc-sec"><h2>' + v + '</h2>';
        open = true;
        return;
      }
      if (!open) { out += '<section class="doc-sec">'; open = true; }
      if (k === 'title') out += '<h1 class="doc-title">' + v + '</h1>';
      else if (k === 'sub') out += '<p class="doc-sub">' + v + '</p>';
      else if (k === 'meta') out += '<p class="doc-pt">' + v + '</p>';
      else if (k === 'h') out += '<h3 class="doc-h2">' + v + '</h3>';
      else if (k === 'sh') out += '<p class="doc-h3">' + v + '</p>';
      else if (k === 'v') out += '<p class="doc-v">' + v + '</p>';
      else if (k === 'bullet') out += '<p class="doc-v">' + v + '</p>';
      else out += '<p>' + v + '</p>';
    });
    if (open) out += '</section>';
    out += '<p class="doc-foot">' + esc(s.passage || '') + '  ·  ' + esc(s.date || '') +
      (doc && doc.source ? '  ·  ' + esc(doc.source) : '') + '  ·  세리토스장로교회</p>';
    return out + '</div>';
  }
  function openFullDoc(s) {
    if (!s) return;
    stashEditor(s);
    var back = openDocModal({
      title: (s.title || '설교 원고') + ' · 원고 전체',
      sub: (s.passage || '본문 미정') + ' · ' + (s.date || '') + ' · 표지부터 Ⅷ까지',
      html: '<div class="doc"><p class="doc-note">원고 전체를 불러오는 중입니다…</p></div>',
      copyLabel: '설교 원고'
    });
    var body = back.querySelector('.doc-body');
    var paint = function (ok) {
      body.innerHTML = fullDocHTML(s);
      if (ok) toast('원고 전체를 열었습니다 — 큰 글씨·인쇄·복사를 그대로 쓰실 수 있습니다');
      else toast('원고 전체 파일을 불러오지 못해 여덟 구성을 이어 붙였습니다');
    };
    if (fullDocs()) paint(true);
    else loadFullDocs(function (docs) { paint(!!docs); });
  }

  /* ================= 인쇄 · PDF 파일로 저장 =================
     아이패드·아이폰에서 홈 화면에 추가해 쓰는 웹앱(PWA standalone)은
     window.print() · window.open() 이 브라우저 차원에서 막혀 인쇄 창이 뜨지 않습니다.
     그래서 화면에 보이는 문서를 그대로 그려(html2canvas) A4 쪽으로 나누어
     PDF 파일로 만들어 저장·공유할 수 있게 합니다. 일반 브라우저에서는
     예전처럼 window.print() 를 그대로 씁니다. */
  var PDF_PAGE_W = 680;   /* A4 본문 폭 180mm (96dpi) */
  var PDF_PAGE_H = 990;   /* A4 본문 높이 263mm (96dpi) */
  var PDF_LIBS = {};
  var pdfBusy = false;

  function isStandaloneApp() {
    try {
      if (window.navigator && window.navigator.standalone === true) return true;
      if (!window.matchMedia) return false;
      var qs = ['(display-mode: standalone)', '(display-mode: fullscreen)', '(display-mode: minimal-ui)'];
      for (var i = 0; i < qs.length; i++) {
        try { if (window.matchMedia(qs[i]).matches) return true; } catch (e) {}
      }
    } catch (e) {}
    return false;
  }

  function pdfLoadScript(key, url) {
    if (PDF_LIBS[key]) return PDF_LIBS[key];
    PDF_LIBS[key] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.onload = function () { resolve(true); };
      s.onerror = function () { delete PDF_LIBS[key]; reject(new Error('라이브러리 연결 실패')); };
      document.head.appendChild(s);
    });
    return PDF_LIBS[key];
  }

  function ensurePdfLibs() {
    var jobs = [];
    if (!window.html2canvas) jobs.push(pdfLoadScript('h2c', 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'));
    if (!(window.jspdf && window.jspdf.jsPDF)) jobs.push(pdfLoadScript('jspdf', 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js'));
    return Promise.all(jobs).then(function () {
      if (!window.html2canvas) throw new Error('PDF 도구를 불러오지 못했습니다');
      if (!(window.jspdf && window.jspdf.jsPDF)) throw new Error('PDF 도구를 불러오지 못했습니다');
    });
  }

  function pdfFontsReady() {
    return new Promise(function (resolve) {
      var done = false;
      var go = function () { if (!done) { done = true; resolve(); } };
      try {
        if (document.fonts && document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(go, go);
        else go();
      } catch (e) { go(); }
      setTimeout(go, 3000);
    });
  }

  /* ---- 쪽 경계 ----
     글줄 한가운데가 잘리지 않도록, 실제로 그려진 그림에서 글자(잉크) 줄을 찾아
     글줄 사이 빈 줄에서 자른다. 그림과 자르는 자리가 같은 그림이라 배치가 몇 픽셀
     어긋나도 쪽 끝에서 글자가 반쯤 잘리지 않는다. 제목만 쪽 끝에 남는 일도 막는다. */
  var PDF_INK_LEVEL = 190;   /* 이보다 어두운 픽셀을 글자로 본다(배경색·테두리는 넘김) */

  function pdfInkRows(canvas) {
    var w = canvas.width, h = canvas.height;
    var ctx = null, data = null;
    try {
      ctx = canvas.getContext('2d');
      data = ctx.getImageData(0, 0, w, h).data;
    } catch (e) { return null; }
    var ink = new Uint8Array(h);   /* 글자(어두운 픽셀) */
    var any = new Uint8Array(h);   /* 글자·테두리·바탕색(흰색이 아닌 픽셀) */
    var stepX = w > 900 ? 2 : 1;
    for (var y = 0; y < h; y++) {
      var off = y * w * 4;
      for (var x = 0; x < w; x += stepX) {
        var p = off + x * 4;
        var r = data[p], g = data[p + 1], b = data[p + 2];
        if (r < 250 || g < 250 || b < 250) any[y] = 1;
        if (r < PDF_INK_LEVEL || g < PDF_INK_LEVEL || b < PDF_INK_LEVEL) { ink[y] = 1; break; }
      }
    }
    return { ink: ink, any: any };
  }

  /* 제목 바로 뒤에서 자르지 않도록, 제목 자리를 미리 재 둔다(문서 위 기준 CSS px) */
  function pdfKeepRanges(docEl) {
    var base = docEl.getBoundingClientRect().top;
    var out = [];
    var hs = docEl.querySelectorAll('h1,h2,h3,h4,h5,.tm-h,.tm-box-h,.tm-title,.doc-h2,.doc-h3');
    for (var i = 0; i < hs.length; i++) {
      var r = hs[i].getBoundingClientRect();
      if (!r.height) continue;
      out.push([Math.round(r.top - base) - 4, Math.round(r.bottom - base) + 96]);
    }
    /* 문단과 본문 읽기 한 절은 쪼개지 않는다(강단에서 읽기 좋게) */
    var ps = docEl.querySelectorAll('p,.tm-v,li,blockquote');
    for (var j = 0; j < ps.length; j++) {
      var pr = ps[j].getBoundingClientRect();
      if (!pr.height) continue;
      var top = Math.round(pr.top - base), bot = Math.round(pr.bottom - base);
      if (bot - top < 4) continue;
      out.push([top - 2, bot + 2]);
    }
    return out;
  }
  function pdfBoxEnds(docEl) {
    var base = docEl.getBoundingClientRect().top;
    var out = [];
    var bs = docEl.querySelectorAll('.tm-box,.tm-q,.tm-key,.tm-bless,blockquote');
    for (var i = 0; i < bs.length; i++) {
      var r = bs[i].getBoundingClientRect();
      if (!r.height) continue;
      out.push(Math.round(r.bottom - base));
    }
    return out.sort(function (a, b) { return a - b; });
  }
  function pdfBlocked(list, y) {
    if (!list) return false;
    for (var i = 0; i < list.length; i++) {
      if (y >= list[i][0] && y <= list[i][1]) return true;
    }
    return false;
  }

  /* 그려진 쪽에서 다음 쪽 시작 지점(이 쪽 안의 CSS px)을 찾는다 */
  /* 상자(본문 읽기·인용)가 쪽 끝에서 조금만 남으면 상자째 이 쪽에서 닫는다.
     다음 쪽 위에 상자 테두리 한 줄이 비치는 일을 막는다. */
  function pdfCloseBoxAt(cutCss, boxEnds, start, pageH) {
    if (!boxEnds || !boxEnds.length) return cutCss;
    for (var i = 0; i < boxEnds.length; i++) {
      var e = boxEnds[i];
      if (e > cutCss && e - cutCss <= 60 && e < start + pageH - 20) return e + 2;
    }
    return cutCss;
  }

  function pdfCutRow(rows, scale, start, pageH, keep, boxEnds) {
    var inkRows = rows.ink || rows;
    var anyRows = rows.any || rows;
    var h = inkRows.length;
    if (!h) return h;
    var minGap = Math.max(5, Math.round(6 * scale));      /* 글줄 사이 최소 빈 줄 */
    var y = h - 1;
    while (y >= 0 && !inkRows[y]) y--;
    var lastInk = y;
    if (lastInk < 0) return h;                             /* 빈 쪽 */
    if (lastInk < h - minGap) return h;                    /* 아래가 비어 있으면 그대로 */
    /* 위로 올라가며 빈 줄(구간)을 모은다 — 넓은 구간(문단 사이)을 먼저 고른다 */
    var limit = Math.max(0, lastInk - Math.round(pageH * 0.55 * scale));
    var bands = [];
    var run = 0;
    for (var i = lastInk; i >= limit; i--) {
      if (!inkRows[i]) { run += 1; continue; }
      if (run >= minGap) bands.push({ mid: i + Math.round(run / 2), width: run });
      run = 0;
    }
    if (run >= minGap) bands.push({ mid: limit + Math.round(run / 2), width: run });
    if (!bands.length) return h;
    /* 쪽을 꽉 채우도록 아래쪽 빈 줄을 먼저 보고, 가까운 것들 중에서는 넓은
       빈 줄(문단 사이)을 고른다 */
    var lowest = 0;
    for (var n = 0; n < bands.length; n++) if (bands[n].mid > lowest) lowest = bands[n].mid;
    var nearLimit = lowest - Math.round(60 * scale);
    var near = bands.filter(function (b) { return b.mid >= nearLimit; });
    near.sort(function (a, b) { return (b.width - a.width) || (b.mid - a.mid); });
    for (var k = 0; k < near.length; k++) {
      var pos = start + near[k].mid / scale;
      if (pos > start + pageH * 0.45 && !pdfBlocked(keep, pos)) {
        return Math.round((pdfCloseBoxAt(pos, boxEnds, start, pageH) - start) * scale);
      }
    }
    /* 문단 안이라도 글자가 잘리는 것보다는 낫다 — 쪽 끝에 가장 가까운 빈 줄 */
    return Math.round((pdfCloseBoxAt(start + lowest / scale, boxEnds, start, pageH) - start) * scale);
  }

  function pdfCropCanvas(canvas, keepCssPx, pageW) {
    var scale = canvas.width / pageW;
    var h = Math.max(1, Math.min(canvas.height, Math.round(keepCssPx * scale)));
    if (h >= canvas.height - 1) return canvas;
    var out = document.createElement('canvas');
    out.width = canvas.width;
    out.height = h;
    try { out.getContext('2d').drawImage(canvas, 0, 0); } catch (e) { return canvas; }
    return out;
  }

  function pdfRenderPages(docEl, onStep) {
    var pages = [];
    var start = 0;
    var guard = 0;
    var total = Math.ceil(docEl.getBoundingClientRect().height) || 1;
    var keep = null;
    var boxEnds = null;
    function step() {
      guard += 1;
      if (guard > 300) return Promise.resolve(pages);
      var left = total - start;
      if (left <= 4) return Promise.resolve(pages);
      var lastPage = (left <= PDF_PAGE_H);
      /* 마지막 쪽은 배치가 조금 길어도 끝(푸터)까지 담기도록 여유를 둔다 */
      var hPx = lastPage ? (left + 140) : PDF_PAGE_H;
      if (onStep) onStep(pages.length + 1, Math.max(pages.length + 1, Math.ceil(total / PDF_PAGE_H)));
      var page = document.createElement('div');
      page.className = 'pdf-page pdf-sheet';
      page.setAttribute('aria-hidden', 'true');
      page.style.cssText = 'position:relative;width:' + PDF_PAGE_W + 'px;height:' + hPx +
        'px;overflow:hidden;background:#fff;';
      var inner = document.createElement('div');
      inner.style.cssText = 'position:absolute;left:0;top:' + (-start) + 'px;width:' + PDF_PAGE_W + 'px;background:#fff;';
      inner.appendChild(docEl.cloneNode(true));
      page.appendChild(inner);
      document.body.appendChild(page);
      return window.html2canvas(page, {
        scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false,
        width: PDF_PAGE_W, height: hPx,
        windowWidth: 1024, windowHeight: 1200, scrollX: 0, scrollY: 0
      }).then(function (canvas) {
        if (page.parentNode) page.parentNode.removeChild(page);
        if (!keep) keep = pdfKeepRanges(docEl);
        if (!boxEnds) boxEnds = pdfBoxEnds(docEl);
        var scale = canvas.width / PDF_PAGE_W;
        var rows = pdfInkRows(canvas);
        var cutRow = 0;
        if (rows) {
          if (lastPage) {
            /* 마지막 쪽: 마지막 글자 아래에서 끊는다 */
            var y = rows.length - 1;
            while (y >= 0 && !rows[y]) y--;
            cutRow = (y < 0) ? rows.length : Math.min(rows.length, y + Math.round(8 * scale));
          } else {
            cutRow = pdfCutRow(rows, scale, start, PDF_PAGE_H, keep, boxEnds);
            /* 다음 쪽과 겹치지 않게: 이 쪽 안에서 끊는다 */
            if (cutRow >= canvas.height - 1) cutRow = canvas.height;
          }
        }
        var keptCss = cutRow ? (cutRow / scale) : hPx;
        pages.push(pdfCropCanvas(canvas, Math.max(8, keptCss), PDF_PAGE_W));
        start = start + Math.max(8, keptCss);
        return step();
      }, function (err) {
        if (page.parentNode) page.parentNode.removeChild(page);
        throw err;
      });
    }
    return step();
  }

  function pdfBuild(canvases) {
    var JsPDF = window.jspdf.jsPDF;
    var pdf = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    var left = 15, top = 16, bw = 180;
    for (var i = 0; i < canvases.length; i++) {
      if (i) pdf.addPage();
      var bh = canvases[i].height * (bw / canvases[i].width);
      pdf.addImage(canvases[i].toDataURL('image/jpeg', 0.95), 'JPEG', left, top, bw, bh, 'p' + i, 'FAST');
    }
    return pdf;
  }

  function pdfFileName(docEl) {
    var h = docEl.querySelector('.doc-title') || docEl.querySelector('.tm-title') || docEl.querySelector('.arc-doc-title');
    var t = h ? String(h.textContent || '') : '';
    t = t.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
    if (!t) t = '설교원고';
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + t + '.pdf';
  }

  function pdfNote(host, before) {
    var el = host.querySelector('[data-pdf-note]');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'pdf-note';
    el.setAttribute('data-pdf-note', '');
    el.innerHTML = '<span data-pdf-note-txt></span>' +
      '<button type="button" class="btn-solid" data-pdf-save hidden>PDF 저장 / 공유</button>' +
      '<button type="button" class="btn-line" data-pdf-again hidden>다시 만들기</button>';
    if (before && before.parentNode === host) host.insertBefore(el, before);
    else host.appendChild(el);
    return el;
  }

  function pdfDownload(blob, name) {
    try {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        if (a.parentNode) a.parentNode.removeChild(a);
        URL.revokeObjectURL(url);
      }, 4000);
      toast('PDF를 저장했습니다 · ' + name);
    } catch (e) {
      toast('PDF를 저장하지 못했습니다 — 공유 버튼을 이용해 주세요');
    }
  }

  function pdfSaveBlob(blob, name) {
    var file = null;
    try { file = new File([blob], name, { type: 'application/pdf' }); } catch (e) { file = null; }
    var can = false;
    if (file && navigator.share && navigator.canShare) {
      try { can = navigator.canShare({ files: [file] }); } catch (e) { can = false; }
    }
    if (can) {
      navigator.share({ files: [file], title: name }).then(function () {
        toast('PDF를 내보냈습니다 · ' + name);
      }, function (err) {
        if (err && err.name === 'AbortError') return;
        pdfDownload(blob, name);
      });
      return;
    }
    pdfDownload(blob, name);
  }

  /* ================= 워드(.docx)로 저장 =================
     teaching/vendor/docx-lite.js 하나를 두 앱이 같이 쓴다(외부 라이브러리 없이
     브라우저 안에서 .docx 를 만든다). 화면에 보이는 10분 설교 원고의 제목·본문
     읽기·대지·인용·결론·기도문을 18pt 서식 그대로 워드 문단으로 옮긴다. */
  var DOCX_LIB = null;
  function ensureDocxLib() {
    if (window.DocxLite && typeof window.DocxLite.makeDocx === 'function') return Promise.resolve();
    if (DOCX_LIB) return DOCX_LIB;
    DOCX_LIB = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'teaching/vendor/docx-lite.js?v=20261127aa';
      s.async = true;
      s.onload = function () {
        if (window.DocxLite && typeof window.DocxLite.makeDocx === 'function') resolve();
        else { DOCX_LIB = null; reject(new Error('워드 생성기를 불러오지 못했습니다')); }
      };
      s.onerror = function () { DOCX_LIB = null; reject(new Error('워드 생성기 연결 실패')); };
      document.head.appendChild(s);
    });
    return DOCX_LIB;
  }

  function tenDocxBlocks(root) {
    var out = [];
    var T = function (el) { return String(el.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim(); };
    var clsOf = function (el) { return typeof el.className === 'string' ? el.className : ''; };
    var has = function (el, name) { return clsOf(el).split(/\s+/).indexOf(name) > -1; };
    var walk = function (el) {
      var kids = el.children;
      for (var i = 0; i < kids.length; i++) {
        var n = kids[i];
        if (n.tagName === 'SECTION') { walk(n); continue; }
        if (has(n, 'tm-q') || n.tagName === 'BLOCKQUOTE') {
          var q = n.querySelector('p'), c = n.querySelector('cite');
          if (q) out.push({ text: T(q), size: 36, bold: true, color: '2A2418', shade: 'FAF6EC', indent: 240, before: 120, after: 60 });
          if (c) out.push({ text: T(c), size: 22, color: '6B5C42', indent: 240, after: 160 });
          continue;
        }
        if (n.tagName === 'HR') {
          out.push({ text: '', size: 4, line: 240, after: 200, borderBottom: true, borderColor: '24332B' });
          continue;
        }
        if (n.tagName === 'H1' || has(n, 'tm-title')) {
          out.push({ text: T(n), size: 50, bold: true, align: 'center', color: '12251A', line: 300, after: 140, keepNext: true });
          continue;
        }
        if (has(n, 'tm-kicker')) { out.push({ text: T(n), size: 20, bold: true, color: '6E7C75', align: 'center', after: 60 }); continue; }
        if (has(n, 'tm-lead')) { out.push({ text: T(n), size: 28, align: 'center', after: 80 }); continue; }
        if (has(n, 'tm-meta')) { out.push({ text: T(n), size: 22, align: 'center', color: '55655C', after: 200 }); continue; }
        if (has(n, 'tm-box-h')) { out.push({ text: T(n), size: 28, bold: true, color: '453B22', shade: 'FAF6EC', before: 120, after: 80, keepNext: true }); continue; }
        if (has(n, 'tm-h')) { out.push({ text: T(n), size: 34, bold: true, color: '12251A', before: 240, after: 100, keepNext: true, borderBottom: true }); continue; }
        if (has(n, 'tm-v')) {
          var num = n.querySelector('b'), body = n.querySelector('span');
          out.push({
            text: '', shade: 'FAF6EC', size: 36, line: 340, after: 80,
            runs: [
              { text: (num ? T(num) : '') + '  ', bold: true, color: '3A2F1C' },
              { text: body ? T(body) : T(n) }
            ]
          });
          continue;
        }
        if (has(n, 'tm-key') || has(n, 'tm-trans')) { out.push({ text: T(n), size: 36, bold: true, before: 120, after: 120, keepNext: true }); continue; }
        if (has(n, 'tm-bless')) { out.push({ text: T(n), size: 36, bold: true, before: 120, after: 120 }); continue; }
        if (has(n, 'tm-foot')) { out.push({ text: T(n), size: 17, align: 'center', color: '8A968F', before: 240 }); continue; }
        if (n.tagName === 'P') { out.push({ text: T(n), size: 36, after: 140 }); continue; }
        if (n.children && n.children.length) walk(n);
      }
    };
    walk(root);
    return out;
  }

  function docxFileName(docEl, ext) {
    var h = docEl.querySelector('.doc-title') || docEl.querySelector('.tm-title') || docEl.querySelector('.arc-doc-title');
    var t = h ? String(h.textContent || '') : '';
    t = t.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
    if (!t) t = '설교원고';
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + t + '.' + ext;
  }

  function docxDownload(blob, name) {
    try {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        if (a.parentNode) a.parentNode.removeChild(a);
        URL.revokeObjectURL(url);
      }, 4000);
      toast('워드 파일을 저장했습니다 · ' + name);
    } catch (e) {
      toast('워드 파일을 저장하지 못했습니다 — 공유 버튼을 이용해 주세요');
    }
  }

  function docxSave(blob, name) {
    var file = null;
    try { file = new File([blob], name, { type: blob.type }); } catch (e) { file = null; }
    var can = false;
    if (file && navigator.share && navigator.canShare) {
      try { can = navigator.canShare({ files: [file] }); } catch (e) { can = false; }
    }
    if (can) {
      navigator.share({ files: [file], title: name }).then(function () {
        toast('워드 파일을 내보냈습니다 · ' + name);
      }, function (err) {
        if (err && err.name === 'AbortError') return;
        docxDownload(blob, name);
      });
      return;
    }
    docxDownload(blob, name);
  }

  function docxExport(docEl, btn) {
    if (!docEl) { toast('문서를 찾지 못했습니다'); return; }
    var label = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '워드 만드는 중…'; }
    var restore = function () { if (btn) { btn.disabled = false; btn.innerHTML = label; } };
    ensureDocxLib().then(function () {
      var h = docEl.querySelector('.tm-title') || docEl.querySelector('.doc-title');
      var title = h ? String(h.textContent || '').trim() : '설교 원고';
      var blocks = tenDocxBlocks(docEl);
      if (!blocks.length) throw new Error('문서 내용을 읽지 못했습니다');
      var bytes = window.DocxLite.makeDocx({
        title: title,
        subject: '10분 설교 원고',
        creator: '사역의 한 주',
        blocks: blocks
      });
      var name = docxFileName(docEl, 'docx');
      var blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      restore();
      docxSave(blob, name);
    })['catch'](function (err) {
      restore();
      toast('워드를 만들지 못했습니다 — ' + (err && err.message ? err.message : '다시 시도해 주세요'));
    });
  }

  /* o: { docEl, host, before, btn, strip:[선택자], extraClass } */
  function pdfExport(o) {
    if (pdfBusy) { toast('PDF를 만드는 중입니다 — 조금만 기다려 주세요'); return; }
    var docEl = o.docEl;
    if (!docEl) { toast('문서를 찾지 못했습니다'); return; }
    var host = o.host || docEl.parentNode;
    var note = pdfNote(host, o.before || null);
    var txt = note.querySelector('[data-pdf-note-txt]');
    var saveBtn = note.querySelector('[data-pdf-save]');
    var againBtn = note.querySelector('[data-pdf-again]');
    var btn = o.btn || null;
    var btnHTML = btn ? btn.innerHTML : '';
    var name = pdfFileName(docEl);
    var standalone = isStandaloneApp();
    var stage = null;
    pdfBusy = true;
    note.hidden = false;
    note.className = 'pdf-note';
    saveBtn.hidden = true;
    againBtn.hidden = true;
    txt.textContent = 'PDF를 만드는 준비 중…';
    if (btn) { btn.disabled = true; btn.innerHTML = 'PDF 만드는 중…'; }
    var cleanStage = function () {
      if (stage && stage.parentNode) stage.parentNode.removeChild(stage);
      stage = null;
    };
    var restore = function () {
      pdfBusy = false;
      if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
    };

    ensurePdfLibs().then(pdfFontsReady).then(function () {
      stage = document.createElement('div');
      stage.className = 'pdf-stage pdf-sheet';
      stage.setAttribute('aria-hidden', 'true');
      var clone = docEl.cloneNode(true);
      var strip = o.strip || [];
      for (var i = 0; i < strip.length; i++) {
        var junk = clone.querySelectorAll(strip[i]);
        for (var j = 0; j < junk.length; j++) if (junk[j].parentNode) junk[j].parentNode.removeChild(junk[j]);
      }
      if (o.extraClass) clone.className += ' ' + o.extraClass;
      stage.appendChild(clone);
      document.body.appendChild(stage);
      return new Promise(function (resolve) { setTimeout(resolve, 40); }).then(function () {
        var h = Math.ceil(clone.getBoundingClientRect().height);
        if (!h) throw new Error('문서 높이를 재지 못했습니다');
        /* 쪽 경계는 화면(DOM)이 아니라 html2canvas 가 다시 그리는 사본에서 잰다.
           두 배치가 미세하게 다르면 쪽 끝에서 글줄이 반쯤 잘리고 다음 쪽에
           같은 줄이 겹쳐 보이기 때문이다. */
        return pdfRenderPages(clone, function (i, n) {
          txt.textContent = 'PDF 만드는 중… ' + i + '/' + n + '쪽';
        });
      });
    }).then(function (pages) {
      cleanStage();
      var blob = pdfBuild(pages).output('blob');
      var kb = Math.round(blob.size / 1024);
      var sizeTxt = kb >= 1024 ? (kb / 1024).toFixed(1) + 'MB' : kb + 'KB';
      restore();
      note.className = 'pdf-note ok';
      txt.textContent = 'PDF ' + pages.length + '쪽 · ' + sizeTxt + ' 파일을 만들었습니다. ' +
        (standalone ? '아래 「PDF 저장 / 공유」를 누르면 파일로 저장하거나 보낼 수 있습니다.'
                    : '저장되지 않았다면 「PDF 저장 / 공유」를 눌러 주세요.');
      saveBtn.hidden = false;
      againBtn.hidden = false;
      saveBtn.onclick = function () { pdfSaveBlob(blob, name); };
      againBtn.onclick = function () { pdfExport(o); };
      if (!standalone) pdfDownload(blob, name);
      toast('PDF ' + pages.length + '쪽을 만들었습니다 · ' + name);
    })['catch'](function (err) {
      cleanStage();
      restore();
      note.className = 'pdf-note err';
      txt.textContent = 'PDF를 만들지 못했습니다 — 인터넷 연결을 확인하고 다시 시도해 주세요.' +
        (err && err.message ? ' (' + err.message + ')' : '');
      againBtn.hidden = false;
      againBtn.onclick = function () { pdfExport(o); };
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
      '<button type="button" class="btn-solid" data-doc-print>' + (isStandaloneApp() ? 'PDF로 저장' : '인쇄 / PDF 저장') + '</button>' +
      (o.word ? '<button type="button" class="btn-line" data-doc-word>워드로 저장</button>' : '') +
      (isStandaloneApp() ? '' : '<button type="button" class="btn-line" data-doc-pdf>PDF 파일</button>') +
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
    var liveDoc = function () { return body.querySelector('.doc') || doc; };
    if (doc && doc.classList.contains('doc-lg')) {
      sizeBtn.textContent = '기본 글씨';
      sizeBtn.classList.add('on');
    }
    sizeBtn.addEventListener('click', function () {
      var big = liveDoc().classList.toggle('doc-lg');
      sizeBtn.textContent = big ? '기본 글씨' : '큰 글씨 (18pt)';
      sizeBtn.classList.toggle('on', big);
    });
    back.querySelector('[data-doc-copy]').addEventListener('click', function () {
      copyText(liveDoc().innerText, o.copyLabel || '내용');
    });
    var printBtn = back.querySelector('[data-doc-print]');
    var pdfBtn = back.querySelector('[data-doc-pdf]');
    var wordBtn = back.querySelector('[data-doc-word]');
    var pdfOpts = function (b) {
      return { docEl: liveDoc(), host: back.querySelector('.modal'), before: body, btn: b };
    };
    if (wordBtn) wordBtn.addEventListener('click', function () { docxExport(liveDoc(), wordBtn); });
    if (pdfBtn) pdfBtn.addEventListener('click', function () { pdfExport(pdfOpts(pdfBtn)); });
    printBtn.addEventListener('click', function () {
      /* 홈 화면 웹앱(PWA)은 인쇄 창 자체가 열리지 않으므로 PDF 파일로 만든다 */
      if (isStandaloneApp()) { pdfExport(pdfOpts(printBtn)); return; }
      if (typeof window.print !== 'function') {
        pdfExport(pdfOpts(printBtn));
        toast('이 화면에서는 인쇄 창이 열리지 않아 PDF로 저장합니다');
        return;
      }
      /* iOS Safari는 setTimeout 뒤의 window.print()를 무시하므로 클릭 안에서 바로 호출한다 */
      document.body.classList.add('printing');
      var cleanup = function () {
        window.removeEventListener('afterprint', cleanup);
        document.removeEventListener('afterprint', cleanup);
        document.body.classList.remove('printing');
      };
      window.addEventListener('afterprint', cleanup);
      document.addEventListener('afterprint', cleanup);
      setTimeout(cleanup, 60000);
      try { window.print(); }
      catch (e) { cleanup(); pdfExport(pdfOpts(printBtn)); }
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

  function docHead(m, kind, sub) {
    var wk = (m.date && /^\d{4}-\d{2}-\d{2}$/.test(m.date)) ? ' ' + weekdayOf(m.date) : '';
    return '<div class="doc-head">' +
      '<p class="doc-kicker">' + (m.kind === 'archive' ? '과거 설교 원고 · ' : '효석패턴6 · ') + esc(kind) + '</p>' +
      '<h1 class="doc-title">' + esc(m.title || '설교 원고') + '</h1>' +
      '<p class="doc-meta">' + esc(m.passage || '본문 미정') + '  ·  ' + esc(m.date || '연도 미상') + esc(wk) + '  ·  세리토스장로교회' + (sub ? '  ·  ' + esc(sub) : '') + '</p>' +
      '</div>';
  }

  function studyDoc(m) {
    var secs = [];
    if (m.verses && m.verses.length) {
      secs.push('<section class="doc-sec"><h2>__N. 본문 읽기</h2>' +
        m.verses.map(function (v) { return '<p class="doc-verse"><b>' + esc(v.n) + '</b><span>' + esc(v.t) + '</span></p>'; }).join('') +
        '</section>');
    }
    if (m.summaryRows && m.summaryRows.length) {
      secs.push('<section class="doc-sec"><h2>__N. 본문 분석 요약</h2>' +
        m.summaryRows.map(function (r) {
          return '<div class="doc-row"><span class="k">' + esc(r.k) + '</span><span class="v">' + esc(r.v) + '</span></div>';
        }).join('') + '</section>');
    }
    if (m.keyLines && m.keyLines.length) {
      secs.push('<section class="doc-sec"><h2>__N. 마음에 새길 핵심 문장</h2>' +
        m.keyLines.slice(0, 4).map(function (t) { return '<p class="doc-quote">“' + esc(stripEnd(t)) + '”</p>'; }).join('') +
        '</section>');
    }
    if (m.contexts && m.contexts.length) {
      secs.push('<section class="doc-sec"><h2>__N. 전후 맥락</h2>' +
        m.contexts.map(function (c) {
          return '<div class="doc-block"><h3>' + esc(c.h) + '</h3>' + (c.p ? '<p>' + esc(cut(c.p, 520)) + '</p>' : '') + '</div>';
        }).join('') + '</section>');
    }
    if (m.hebrew && m.hebrew.length) {
      secs.push('<section class="doc-sec"><h2>__N. 핵심 원어</h2><table class="doc-table"><thead><tr><th>낱말</th><th>원어</th><th>뜻</th></tr></thead><tbody>' +
        m.hebrew.map(function (r) {
          return '<tr><td>' + esc(r.word) + '</td><td>' + esc(r.tr) + '</td><td>' + esc(r.mean) + '</td></tr>';
        }).join('') + '</tbody></table></section>');
    }
    if (m.points && m.points.length) {
      secs.push('<section class="doc-sec"><h2>__N. 대지별 정리</h2>' +
        m.points.map(function (p) {
          var paras = (p.paras || []).slice(0, 2).map(function (t) { return '<p>' + esc(cut(t, 340)) + '</p>'; }).join('');
          return '<div class="doc-block"><h3>' + esc(p.ord + ' 대지' + (p.ref ? ' · ' + p.ref : '')) + '</h3>' +
            '<p class="doc-pt">' + esc(p.text) + '</p>' + paras +
            (p.apply ? '<p class="doc-apply">삶의 적용 · ' + esc(cut(p.apply, 220)) + '</p>' : '') + '</div>';
        }).join('') + '</section>');
    }
    if (m.questions && m.questions.length) {
      secs.push('<section class="doc-sec"><h2>__N. 소그룹 나눔 질문</h2>' +
        m.questions.map(function (q, i) {
          return '<p class="doc-q"><b>Q' + (i + 1) + '.</b> ' + esc(q.q) + '</p>' + (q.d ? '<p class="doc-note">' + esc(q.d) + '</p>' : '');
        }).join('') + '</section>');
    }
    if (m.practice && m.practice.length) {
      secs.push('<section class="doc-sec"><h2>__N. 이번 주 실천</h2><ul class="doc-list">' +
        m.practice.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></section>');
    }
    var html = '<article class="doc doc-study">' + docHead(m, '성경공부 교재', '소그룹 · 제자훈련용');
    if (!secs.length) {
      html += '<p class="doc-note">이 설교의 여덟 구성이 아직 비어 있습니다. 본문 분석과 소그룹 적용을 먼저 채우면 교재가 그 내용으로 만들어집니다.</p>';
    }
    var n = 0;
    html += secs.map(function (sec) { n += 1; return sec.replace('__N', String(n)); }).join('');
    html += '<p class="doc-foot">' + (m.kind === 'archive'
      ? '저장된 과거 설교 원고에서 본문 · 대지 · 핵심 문장 · 적용을 읽어 묶은 교재입니다. 원고의 문장을 그대로 살렸으니 필요에 따라 다듬어 인쇄하거나 PDF로 저장해 나눠 주세요.'
      : '본문 분석 · 전후 맥락 · 핵심 원어 · 소그룹 적용에서 자동으로 묶은 교재입니다. 필요에 따라 인쇄하거나 PDF로 저장해 나눠 주세요.') + '</p>';
    return html + '</article>';
  }

  function prayerDoc(m) {
    var pts = m.points || [], pray = m.prayer || [], hymns = m.hymns || [];
    var html = '<article class="doc doc-prayer">' + docHead(m, '기도문', '예배 마무리 · 소그룹 나눔');
    html += '<section class="doc-sec"><h2>1. 대지별 결단 기도</h2>';
    if (pts.length) {
      pts.forEach(function (p) {
        html += '<div class="doc-pray">' +
          '<p class="ph">' + esc(p.ord + ' 대지' + (p.ref ? ' · ' + p.ref : '') + ' — ' + p.text) + '</p>' +
          '<p>' + esc(m.kind === 'archive' ? arcApplyPrayer(p) : applyToPrayer(p.apply)) + '</p></div>';
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
    } else if (m.kind === 'archive') {
      html += '<p class="doc-note">이 원고에는 마무리 기도가 없어 오늘 말씀으로 결단 기도를 지었습니다.</p>' +
        arcComposePrayer(m).map(function (b) { return '<p>' + esc(b) + '</p>'; }).join('');
    } else {
      html += '<p class="doc-note">마무리 기도 구성이 아직 비어 있습니다.</p>';
    }
    html += '</section>';
    html += '<section class="doc-sec"><h2>3. 추천 찬송</h2>';
    if (hymns.length) {
      html += '<ul class="doc-list">' + hymns.map(function (h, i) {
        var tag = i === 0 ? '설교 전' : i === 1 ? '설교 후' : '묵상';
        return '<li><b>' + esc(tag) + '</b> · ' + (/새찬송가/.test(h.label || '') ? '새찬송가 ' : '찬송가 ') + esc(h.no) + '장' + (h.title ? ' 「' + esc(h.title) + '」' : '') + '</li>';
      }).join('') + '</ul>';
    } else if (m.kind === 'archive') {
      html += '<p class="doc-note">원고에 찬송 표기가 없습니다. 예배 순서에 따라 찬송을 더하시면 됩니다.</p>';
    } else {
      html += '<p class="doc-note">추천 찬송이 아직 정리되지 않았습니다.</p>';
    }
    html += '</section>';
    html += '<p class="doc-foot">' + (m.kind === 'archive'
      ? '저장된 과거 설교 원고의 대지와 적용, 마무리 기도에서 묶은 기도문입니다. 예배 마무리나 소그룹 나눔 뒤 함께 읽도록 준비했습니다.'
      : '마무리 기도 · 소그룹 적용에서 자동으로 묶은 기도문입니다. 예배 마무리나 소그룹 나눔 뒤 함께 읽도록 준비했습니다.') + '</p>';
    return html + '</article>';
  }

  function arcApplyPrayer(p) {
    var base = stripEnd(p.apply || '');
    if (!base || /^\d{1,3}[.)]?\s/.test(base)) {
      return '주님, “' + cut(stripEnd(p.text), 80) + '” 이 말씀을 붙들고 오늘 하루를 살아가게 하여 주시옵소서.';
    }
    return '주님, “' + cut(base, 110) + '” 이 말씀대로 살아가기를 원합니다. 저희의 결단을 붙드시고 순종의 걸음을 놓치지 않게 하여 주시옵소서.';
  }

  function studyHTML(s) { return studyDoc(sermonModel(s)); }
  function prayerHTML(s) { return prayerDoc(sermonModel(s)); }

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

  /* ================= 10분 설교 원고 (강단 낭독용 압축 원고) ================= */
  var TEN_ABBR = {
    '창세기': '창', '출애굽기': '출', '레위기': '레', '민수기': '민', '신명기': '신',
    '여호수아': '수', '사사기': '삿', '룻기': '룻', '사무엘상': '삼상', '사무엘하': '삼하',
    '열왕기상': '왕상', '열왕기하': '왕하', '역대상': '대상', '역대하': '대하', '에스라': '스',
    '느헤미야': '느', '에스더': '에', '욥기': '욥', '시편': '시', '잠언': '잠',
    '전도서': '전', '아가': '아', '이사야': '사', '예레미야': '렘', '예레미야애가': '애',
    '에스겔': '겔', '다니엘': '단', '호세아': '호', '요엘': '욜', '아모스': '암',
    '오바댜': '옵', '요나': '욘', '미가': '미', '나훔': '나', '하박국': '합',
    '스바냐': '습', '학개': '학', '스가랴': '슥', '말라기': '말',
    '마태복음': '마', '마가복음': '막', '누가복음': '눅', '요한복음': '요', '사도행전': '행',
    '로마서': '롬', '고린도전서': '고전', '고린도후서': '고후', '갈라디아서': '갈', '에베소서': '엡',
    '빌립보서': '빌', '골로새서': '골', '데살로니가전서': '살전', '데살로니가후서': '살후',
    '디모데전서': '딤전', '디모데후서': '딤후', '디도서': '딛', '빌레몬서': '몬', '히브리서': '히',
    '야고보서': '약', '베드로전서': '벧전', '베드로후서': '벧후', '요한일서': '요일',
    '요한이서': '요이', '요한삼서': '요삼', '유다서': '유', '요한계시록': '계'
  };
  var TEN_ORD_WORDS = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째'];
  var TEN_ORD_CNT = { 2: '두 가지', 3: '세 가지', 4: '네 가지', 5: '다섯 가지' };

  function tenEsc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function tenFlat(t) {
    return String(t == null ? '' : t).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function tenBlocks(t) {
    return String(t || '').replace(/\u00a0/g, ' ').split(/\n{2,}/)
      .map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function tenNorm(t) {
    return String(t || '').replace(/\s+/g, '').replace(/[\u201c\u201d"'\u2018\u2019]/g, '');
  }
  var TEN_VOC_A = /(?:사랑하는\s*)?성도\s*(?:여러분들?|님들)(?![가-힣])[\s!,.·]*/g;
  function tenClean(t) {
    var raw = String(t).replace(TEN_VOC_A, ' ');
    var x = tenFlat(raw)
      .replace(/^[\s,·\-–—]+/, '')
      .replace(/\s+([,.!?])/g, '$1')
      .replace(/\(\s*\)/g, '')
      .replace(/,\s*\)/g, ')')
      .replace(/축원합니다/g, '축복합니다')
      .replace(/축원하/g, '축복하')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return x;
  }
  function tenTrimLead(t) {
    var x = tenFlat(t);
    var parts = x.match(/[^.?!]+[.?!]+["'\u201d\u2019]?/g);
    if (!parts || parts.length < 2) return x;
    var lastIdx = x.lastIndexOf(parts[parts.length - 1].trim());
    var tail = parts[parts.length - 1].trim();
    if (lastIdx > 0 && tenLeadIn(tail) && tail.length < 60) {
      return x.slice(0, lastIdx).trim();
    }
    if (lastIdx > 0 && /(이렇게|그렇게)\s*(선포|말씀|기도|고백|외치|부르|기록)/.test(tail) && tail.length < 60) {
      return x.slice(0, lastIdx).trim();
    }
    return x;
  }
  function tenSentence(t) {
    var x = tenClean(t);
    if (!x) return '';
    return /[.!?…]$/.test(x) ? x : x + '.';
  }
  function tenFirst(t, max) {
    var x = tenFlat(t);
  if (!x) return '';
    var m = x.match(/^(.{8,}?[.!?])(\s|$)/);
    var s = m ? m[1] : x;
    if (max && s.length > max) s = s.slice(0, max - 1).replace(/[\s,·:;\u2014\u2013-]+$/, '') + '…';
    return s;
  }
  function tenNums(ref) {
    var out = [], seen = {}, s = String(ref || '');
    s.replace(/(\d+)\s*[-\u2013~]\s*(\d+)/g, function (_, a, b) {
      for (var i = +a; i <= +b && i < +a + 60; i++) {
        if (!seen[i]) { seen[i] = 1; out.push(i); }
      }
      return ' ';
    }).replace(/(\d+)/g, function (_, a) {
      if (!seen[+a]) { seen[+a] = 1; out.push(+a); }
      return ' ';
    });
    return out;
  }

  /* ---- 본문 절 ---- */
  function tenPassageVerses(s) {
    var lines = (s.reading || []).filter(function (l) { return /^\s*\d{1,3}\s+\S/.test(l); });
    if (!lines.length) {
      var on = false;
      tenBlocks((s.sections && s.sections.analysis) || '').forEach(function (b) {
        if (/^2\.\s*본문 전체 인용/.test(b)) { on = true; return; }
        if (on && /^\d{1,3}\s+\S/.test(b)) { lines.push(b); return; }
        if (on && /^\d+\.\s/.test(b)) on = false;
      });
    }
    return lines.map(function (l) {
      var m = String(l).match(/^\s*(\d{1,3})\s+([\s\S]+)$/);
      return m ? { n: m[1], t: tenFlat(m[2]) } : null;
    }).filter(Boolean);
  }
  function tenVerseIndex(s) {
    var idx = {};
    tenPassageVerses(s).forEach(function (v) { idx[tenNorm(v.t)] = 1; });
    return idx;
  }
  function tenIsVerse(t, idx) {
    var x = tenFlat(t);
    if (!x) return true;
    if (/^\d{1,3}\s+\S/.test(x)) return true;
    if (idx[tenNorm(x)]) return true;
    if (/^[\u201c"]/.test(x) && idx[tenNorm(x)]) return true;
    return false;
  }

  /* ---- 30분 원고 구조 해석 ---- */
  function tenParts(s) {
    var bl = tenBlocks((s.sections && s.sections.sermon) || '');
    var P = { introTitle: '', intro: [], points: [], outroTitle: '', outro: [], have: false };
    var mode = '', cur = null;
    bl.forEach(function (raw) {
      var t = tenFlat(raw);
      if (!t) return;
      if (/^설교\s*제목\s*:/.test(t)) return;
      var mi = t.match(/^(?:[ⅠⅡⅢⅣⅤⅥ]+\.\s*)?(서론|도입)\s*[\u2014\u2013:-]\s*(.+)$/);
      if (mi) { mode = 'intro'; P.introTitle = tenFlat(mi[2]); return; }
      var mo = t.match(/^(?:[ⅠⅡⅢⅣⅤⅥ]+\.\s*)?(결론|맺음|마무리)\s*[\u2014\u2013:-]\s*(.+)$/);
      if (mo) { mode = 'outro'; P.outroTitle = tenFlat(mo[2]); return; }
      var mp = t.match(/^(첫째|둘째|셋째|넷째|다섯째)\s*[,.]?\s*(.+?)\s*[(\uff08]([^)\uff09]{1,26})[)\uff09]\s*$/);
      if (mp && /\d/.test(mp[3])) {
        cur = { ord: mp[1], title: tenFlat(mp[2]), ref: tenFlat(mp[3]), blocks: [] };
        P.points.push(cur); mode = 'point'; return;
      }
      if (/^[ⅠⅡⅢⅣⅤⅥⅦⅧ]\.\s*/.test(t)) return;
      if (/^\d+\.\s/.test(t)) return;
      if (mode === 'intro') P.intro.push(t);
      else if (mode === 'point' && cur) cur.blocks.push(t);
      else if (mode === 'outro') P.outro.push(t);
    });
    P.have = P.points.length > 0;
    return P;
  }

  /* ---- 절별 주해(핵심 교훈) ---- */
  function tenExegesis(s) {
    var out = [], cur = null, on = false;
    tenBlocks((s.sections && s.sections.analysis) || '').forEach(function (b) {
      var t = tenFlat(b);
      if (/^\d+\.\s*절별\s*주해/.test(t)) { on = true; return; }
      if (!on) return;
      var m = t.match(/^(\d+(?:\s*[-\u2013]\s*\d+)?)절\s*[\u2014\u2013-]\s*(.+)$/);
      if (m) { cur = { ref: m[1].replace(/\s+/g, ''), head: tenFlat(m[2]), paras: [], key: '' }; out.push(cur); return; }
      if (!cur) return;
      if (/^핵심\s*교훈\s*[:\uff1a]\s*/.test(t)) { cur.key = tenFlat(t.replace(/^핵심\s*교훈\s*[:\uff1a]\s*/, '')); return; }
      if (/^\d{1,3}\s+\S/.test(t)) return;
      if (/^\d+\.\s/.test(t)) { on = false; return; }
      var c = tenClean(t);
      if (c) cur.paras.push(c);
    });
    return out;
  }

  /* ---- 문단 점수 ---- */
  function tenLeadIn(t) {
    var x = String(t).replace(/[.!?\s]+$/, '');
    return x.length < 110 && /(여기 있습니다|이렇게 시작합니다|이렇게 말합니다|이렇게 기도합니다|이렇게 기도하십시오|읽어 보겠습니다|보겠습니다|말씀합니다|말씀하십니다|말합니다|묻습니다|기록했습니다|증언합니다)$/.test(x);
  }
  function tenScore(t) {
    var n = t.length, s = 0;
    if (n >= 60 && n <= 220) s += 4;
    else if (n >= 40) s += 2;
    else if (n < 30) s -= 2;
    if (n > 300) s -= 1;
    if (/[?\uff1f]$/.test(t)) s -= 4;
    if (/^(혹시|지금|여러분)/.test(t)) s -= 1;
    if (/(입니다|습니다|하십니다|됩니다|십시오)[.?!]?$/.test(t)) s += 2;
    if (/(하나님|예수|주님|그리스도|말씀|믿음|은혜|성도|언약)/.test(t)) s += 1;
    if (/(절|히브리|원어|\u2018|\u2019)/.test(t)) s += 1;
    if (/^(그러나|그런데|그리고|그러므로|또|이제)/.test(t)) s += 1;
    if (/^(이|그|저)\s*(단어|것은|것을|절은|절의|말씀은|기도는|약속은|두|세|문장|표현|사실|자리|이야기|때문|사람)/.test(t)) s -= 3;
    if (/^(여기서|여기에|거기서|그때|이때)\b/.test(t)) s -= 2;
    if (/^.{0,24}(?:이|그)\s*(?:단어|절|표현|문장|기도|약속)(?:는|은|를|가|의)/.test(t)) s -= 3;
    if (/^(첫째|둘째|셋째|넷째|다섯째)\s*[,.]/.test(t) && t.length < 130) s -= 6;
    if (/^\u2018[^\u2019]+\u2019/.test(t)) s -= 3;
    return s;
  }

  function tenQuoteLine(t) {
    var x = tenFlat(t);
    if (!/^[\u201c"]/.test(x)) return false;
    if (x.length > 110) return false;
    return /[\u201d"]$/.test(x) || /[?\uff1f]$/.test(x);
  }

  /* ---- 구역(소제목)별 문단 후보 ---- */
  function tenGroups(blocks, idx) {
    var groups = [], cur = { h: '', items: [] };
    var skipNext = false;
    blocks.forEach(function (b) {
      var t = tenFlat(b);
      if (!t) return;
      var mh = t.match(/^\d+\)\s*(.+)$/);
      if (mh) {
        if (cur.items.length || cur.h) groups.push(cur);
        cur = { h: tenClean(mh[1]), items: [] };
        return;
      }
      if (tenIsVerse(t, idx)) { cur.items.push({ k: 'v', t: t }); skipNext = false; return; }
      var c = tenClean(t);
      if (!c) return;
      if (skipNext) { skipNext = false; return; }
      if (tenQuoteLine(c)) { cur.items.push({ k: 'q', t: c }); return; }
      if (tenLeadIn(c)) { skipNext = true; return; }
      cur.items.push({ k: 'p', t: c });
    });
    if (cur.items.length || cur.h) groups.push(cur);
    return groups;
  }

  function tenPointParas(blocks, idx, budget, maxG) {
    var groups = tenGroups(blocks, idx);
    var all = [];
    groups.forEach(function (g, gi) {
      g.cands = g.items.filter(function (it) { return it.k === 'p'; });
      g.cands.forEach(function (c, ci) {
        c.s = tenScore(c.t); c.gi = gi; c.ci = ci; c.g = g;
        all.push(c);
      });
      g.best = null;
      g.cands.forEach(function (c) { if (!g.best || c.s > g.best.s) g.best = c; });
    });
    var live = groups.filter(function (g) { return g.best; });
    if (!live.length) return [];
    if (live.length <= 2) {
      var tot = 0, outs = [];
      live.forEach(function (g) {
        g.cands.forEach(function (c) {
          if (c.s < -1) return;
          if (tot + c.t.length > budget) return;
          outs.push(c.t); tot += c.t.length;
        });
      });
      if (outs.length) return outs.map(tenTrimLead);
    }
    var picked = [];
    var chosen = live.slice();
    if (chosen.length > (maxG || 5)) {
      chosen.sort(function (a, b) { return b.best.s - a.best.s; });
      chosen = chosen.slice(0, maxG || 5);
    }
    chosen.forEach(function (g) { picked.push(g.best); });
    var total = picked.reduce(function (n, c) { return n + c.t.length; }, 0);
    /* 예산이 남으면 고른 문단 바로 뒤 문장으로 이어 붙인다 */
    var used = {}, perGroup = {};
    picked.forEach(function (c) { used[c.gi + ':' + c.ci] = 1; perGroup[c.gi] = 1; });
    var queue = picked.slice();
    queue.forEach(function (c) {
      var g = c.g;
      for (var k = 1; k <= 2; k++) {
        if (total >= budget) return;
        if ((perGroup[c.gi] || 0) >= 2) return;
        var sib = g.cands.filter(function (x) { return x.ci === c.ci + k; })[0];
        if (!sib || used[sib.gi + ':' + sib.ci]) continue;
        if (sib.s < 0) continue;
        picked.push(sib); used[sib.gi + ':' + sib.ci] = 1;
        perGroup[c.gi] = (perGroup[c.gi] || 0) + 1;
        total += sib.t.length;
        break;
      }
    });
    if (total < budget * 0.7) {
      var extra = all.filter(function (c) { return !used[c.gi + ':' + c.ci] && c.s >= 4; });
      extra.sort(function (a, b) { return b.s - a.s; });
      extra.forEach(function (c) {
        if (total >= budget * 0.95) return;
        if ((perGroup[c.gi] || 0) >= 2) return;
        picked.push(c); used[c.gi + ':' + c.ci] = 1;
        perGroup[c.gi] = (perGroup[c.gi] || 0) + 1;
        total += c.t.length;
      });
    }
    while (picked.length > 3 && total > budget) {
      var worst = 0;
      picked.forEach(function (c, i) { if (c.s < picked[worst].s) worst = i; });
      total -= picked[worst].t.length;
      picked.splice(worst, 1);
    }
    picked.sort(function (a, b) { return a.gi - b.gi || a.ci - b.ci; });
    return picked.map(function (c) { return tenTrimLead(c.t); });
  }

  /* ---- 들어가며 / 맺으며 문단 ---- */
  function tenFlow(blocks, idx, maxN, minLen) {
    var items = [];
    blocks.forEach(function (b) {
      var t = tenFlat(b);
      if (!t) return;
      if (tenIsVerse(t, idx)) return;
      var c = tenClean(t);
      if (!c) return;
      if (tenQuoteLine(c)) { items.push({ k: 'q', t: c }); return; }
      items.push({ k: 'p', t: c });
    });
    var paras = [];
    items.forEach(function (it) {
      if (it.k === 'q') {
        if (paras.length && /[?\uff1f]$/.test(paras[paras.length - 1])) paras[paras.length - 1] += ' ' + it.t;
        else if (paras.length && /(묻습니다|생각을 합니다|말합니다|기도합니다|외칩니다|부릅니다)$/.test(paras[paras.length - 1])) paras[paras.length - 1] += ' ' + it.t;
        else if (paras.length) paras[paras.length - 1] += ' ' + it.t;
        else paras.push(it.t);
        return;
      }
      paras.push(it.t);
    });
    var out = [];
    paras.forEach(function (t) {
      if (out.length >= maxN) return;
      if (t.length < (minLen || 42) && out.length) return;
      out.push(tenTrimLead(t));
    });
    return out;
  }

  /* ---- 중심 말씀 ---- */
  function tenShortRef(ref) {
    var t = tenFlat(String(ref || '').split(',')[0]);
    var m = t.match(/^(.+?)\s*(\d+)\s*[편장]\s*(\d+(?:\s*[-\u2013]\s*\d+)?)\s*절?$/) ||
      t.match(/^(.+?)\s*(\d+):(\d+(?:\s*[-\u2013]\s*\d+)?)$/);
    if (!m) return t;
    var ab = TEN_ABBR[m[1].trim()] || m[1].trim();
    return ab + ' ' + m[2] + ':' + m[3].replace(/\s*[-\u2013]\s*/, '-');
  }
  function tenCentralLabel(s) {
    var raw = tenFlat(s.central || '');
    if (!raw) return '';
    var base = tenFlat(s.passage || '');
    var bm = base.match(/^(.+?)\s*(\d+)\s*([편장])/);
    var book = bm ? bm[1].trim() : '';
    var chap = bm ? bm[2] : '';
    var unit = bm ? bm[3] : '장';
    return raw.split(',').map(function (part, i) {
      var p = part.trim();
      if (!p) return '';
      if (/^\d+\s*:\s*\d+/.test(p)) return (i === 0 && book ? book + ' ' : '') + p;
      if (/^\d/.test(p) && i === 0 && book) return book + ' ' + chap + unit + ' ' + p;
      return p;
    }).filter(Boolean).join(', ');
  }
  function tenCentral(s, idx) {
    var first = tenFlat(String(s.central || '')).split(',')[0];
    var nums = tenNums(first);
    var all = tenPassageVerses(s);
    var got = nums.length ? all.filter(function (v) { return nums.indexOf(+v.n) > -1; }) : all.slice(0, 1);
    var pick = [], len = 0;
    got.forEach(function (v) {
      if (pick.length >= 2) return;
      if (len + v.t.length > 130) return;
      pick.push(v); len += v.t.length;
    });
    if (!pick.length && all.length) pick = [all[0]];
    var label = tenCentralLabel(s);
    return {
      text: pick.map(function (v) { return v.t; }).join(' '),
      cite: pick.length ? tenShortRef(label || (s.passage || '')) : '',
      label: label
    };
  }

  /* ---- 포인트 핵심 문장 ---- */
  function tenKey(point, exeg) {
    var nums = tenNums(point.ref);
    var keys = [];
    exeg.forEach(function (e) {
      if (!nums.length) return;
      var hit = tenNums(e.ref).some(function (n) { return nums.indexOf(n) > -1; });
      if (hit && e.key) keys.push(tenClean(e.key));
    });
    if (keys.length) {
      var out = [];
      var len = 0;
      keys.forEach(function (k) {
        if (out.length >= 2) return;
        if (len + k.length > 150) return;
        out.push(tenSentence(k)); len += k.length;
      });
      if (out.length) return out.join(' ');
      return tenSentence(keys[0]);
    }
    if (point.apply) {
      var a = tenClean(point.apply);
      return '그러므로 오늘 우리는 ' + a.replace(/[.]$/, '') + '는 은혜에로 나아가야 합니다.';
    }
    return '이것이 오늘 우리에게 주시는 ' + point.ord + ' 번째 말씀입니다.';
  }

  /* ---- 모델 ---- */
  function tenModel(s) {
    var idx = tenVerseIndex(s);
    var P = tenParts(s);
    var exeg = tenExegesis(s);
    var points = P.points.length ? P.points : (s.outline || []).map(function (o, i) {
      return { ord: TEN_ORD_WORDS[i] || (i + 1) + '째', title: o.text || '', ref: o.ref || '', blocks: [] };
    });
    points = points.slice(0, 4);

    var theme = tenFlat(s.theme || '');
    var message = tenFlat(s.message || '');
    var lead = tenFirst(theme, 96) || tenFirst(message, 96) || '';

    var introBlocks = (P.intro || []).filter(function (b) {
      var t = tenClean(b);
      if (!t) return false;
      if (/축복합니다[.!]?$/.test(t) && t.length < 110) return false;
      if (/말씀의 자리에|예배의 자리에/.test(t) && t.length < 120) return false;
      return true;
    });
    var intro = introBlocks.length
      ? tenFlow(introBlocks, idx, 3, 42)
      : [];
    if (!intro.length) {
      intro = [tenFirst(theme, 170), tenFirst(message, 170)].filter(Boolean);
    }
    if (!intro.length) {
      intro = ['오늘 본문 ' + (s.passage || '') + ' 앞에 함께 섭니다.'];
    }

    var transition = tenFirst(message, 120);
    var cnt = TEN_ORD_CNT[points.length] || (points.length + ' 가지');
    var trans = '';
    if (points.length > 1) {
      trans = (transition && !/살펴보겠습니다$/.test(transition.replace(/[.]$/, '')) ? transition + ' ' : '') +
        '오늘 말씀에서 ' + cnt + '를 함께 살펴보겠습니다.';
    } else {
      trans = transition || '';
    }

    var outPoints = points.map(function (p, i) {
      var paras = tenPointParas(p.blocks || [], idx, 720, 5);
      if (!paras.length) {
        var fill = [];
        var pn = tenNums(p.ref);
        exeg.forEach(function (e) {
          if (!tenNums(e.ref).some(function (n) { return pn.indexOf(n) > -1; })) return;
          e.paras.forEach(function (t) { if (fill.length < 2 && t.length > 40) fill.push(t); });
        });
        if (!fill.length) fill = [tenSentence('오늘 본문은 ' + (p.title || '') ) ];
        paras = fill;
      }
      return {
        ord: p.ord, title: p.title, ref: p.ref,
        paras: paras, key: tenKey(p, exeg)
      };
    });

    /* 맺으며 */
    var outroParas = [];
    var outroBlocks = P.outro || [];
    var lastLine = '';
    var items = [], runs = [];
    outroBlocks.forEach(function (raw) {
      var t = tenFlat(raw);
      if (!t) return;
      if (tenIsVerse(t, idx)) return;
      var c = tenClean(t);
      if (!c) return;
      if (/^(첫째|둘째|셋째|넷째|다섯째)\s*[,.]\s/.test(c) && c.length < 110) {
        if (runs.length) runs[runs.length - 1].push(c);
        else runs.push([c]);
        return;
      }
      items.push(c);
      if (runs.length && runs[runs.length - 1].merged !== true) runs.push([]);
    });
    var listRun = [];
    runs.forEach(function (r) { r.forEach(function (x) { listRun.push(x); }); });
    var recapOk = items.length && /(살펴보았습니다|나누었습니다|살펴봤습니다|말씀하셨습니다|정리합니다|살펴보겠습니다)[.]?$/.test(items[0]);
    if (listRun.length) {
      if (recapOk) items[0] = items[0] + ' ' + listRun.join(' ');
      else items.splice(Math.min(1, items.length), 0, listRun.join(' '));
    }
    items.forEach(function (t, i) {
      if (t.length < 42 && !(i === 0 && t.length > 24)) return;
      outroParas.push(t);
    });
    var last = items.length ? items[items.length - 1] : '';
    var blessing = /축복합니다\.?$/.test(last) ? last : '';
    var pool = outroParas.filter(function (t) { return t !== blessing; });
    var body;
    if (pool.length <= 3) body = pool.slice();
    else {
      var mid = pool.slice(1).map(function (t, i) { return { t: t, i: i, s: tenScore(t) }; });
      mid.sort(function (a, b) { return b.s - a.s; });
      var pickMid = mid.slice(0, 2).sort(function (a, b) { return a.i - b.i; }).map(function (x) { return x.t; });
      body = [pool[0]].concat(pickMid);
    }
    if (!blessing) {
      blessing = '오늘 하루 이 말씀을 붙들고 살아가는 저와 여러분 모두가 되시기를 주님의 이름으로 축복합니다.';
      if (last && last.length >= 40 && pool.indexOf(last) < 0 && body.length) {
        blessing = last.replace(/[.]?$/, '.') + ' ' + blessing;
      }
    }
    if (!body.length) body = [tenFirst(message, 160) || ('오늘 말씀을 다시 마음에 새깁니다.')];
    var outro = { title: P.outroTitle || '오늘 말씀을 마음에 새기며', body: body, quote: null, blessing: blessing };

    if (!/축복합니다[.!]?$/.test(outro.blessing)) {
      outro.blessing = outro.blessing.replace(/[.]?\s*$/, '') + ' 주님의 이름으로 축복합니다.';
    }
    var central = tenCentral(s, idx);
    var verses = tenPassageVerses(s);
    var service = /^(일|주일|주일예배)$/.test(String(s.weekday || '')) ? '주일예배' : '새벽예배';

    return {
      id: s.id, title: tenFlat(s.title || '설교 원고'),
      passage: tenFlat(s.passage || '본문 미정'),
      passageFull: tenFlat(s.passageFull || ((s.passage || '본문') + ' (개역개정)')),
      centralLabel: central.label,
      lead: lead, service: service,
      verses: verses, central: central,
      intro: {
        title: P.introTitle || '', paras: intro, trans: trans,
        quote: (function () {
          if (!central.text) return null;
          var key = tenNorm(central.text).slice(0, 36);
          var dup = intro.some(function (p) { return key && tenNorm(p).indexOf(key) > -1; });
          return dup ? null : central;
        })()
      },
      points: outPoints,
      outro: outro,
      foot: tenFlat(s.passage || '') + ' · ' + service + ' 설교 원고 (10분)'
    };
  }

  /* ---- HTML ---- */
  function tenDoc(m) {
    var h = '<article class="doc doc-ten doc-lg">';
    h += '<p class="tm-kicker">' + tenEsc(m.service) + ' 설교 · 10분 원고</p>';
    h += '<h1 class="tm-title">' + tenEsc(m.title) + '</h1>';
    if (m.lead) h += '<p class="tm-lead">' + tenEsc(m.lead) + '</p>';
    h += '<p class="tm-meta">본문: ' + tenEsc(m.passageFull || m.passage) +
      (m.centralLabel ? ' · 중심 말씀: ' + tenEsc(m.centralLabel) : '') + '</p>';
    h += '<hr class="tm-rule">';

    if (m.verses.length) {
      h += '<section class="tm-box"><h2 class="tm-box-h">본문 읽기 - ' + tenEsc(m.passage) + '</h2>';
      h += m.verses.map(function (v) {
        return '<p class="tm-v"><b>' + tenEsc(v.n) + '</b><span>' + tenEsc(v.t) + '</span></p>';
      }).join('');
      h += '</section>';
    }

    h += '<section class="tm-sec">';
    h += '<h2 class="tm-h">들어가며' + (m.intro.title ? ' - ' + tenEsc(m.intro.title) : '') + '</h2>';
    h += m.intro.paras.map(function (p) { return '<p>' + tenEsc(p) + '</p>'; }).join('');
    if (m.intro.quote) {
      h += '<blockquote class="tm-q"><p>' + tenEsc(m.intro.quote.text) + '</p>' +
        (m.intro.quote.cite ? '<cite>(' + tenEsc(m.intro.quote.cite) + ')</cite>' : '') + '</blockquote>';
    }
    if (m.intro.trans) h += '<p class="tm-trans">' + tenEsc(m.intro.trans) + '</p>';
    h += '</section>';

    m.points.forEach(function (p) {
      h += '<section class="tm-sec">';
      h += '<h2 class="tm-h">' + tenEsc(p.ord) + ', ' + tenEsc(p.title) +
        (p.ref ? ' <span class="tm-ref">(' + tenEsc(p.ref) + ')</span>' : '') + '</h2>';
      h += p.paras.map(function (t) { return '<p>' + tenEsc(t) + '</p>'; }).join('');
      if (p.key) h += '<p class="tm-key">' + tenEsc(p.key) + '</p>';
      h += '</section>';
    });

    h += '<section class="tm-sec tm-last">';
    h += '<h2 class="tm-h">맺으며' + (m.outro.title ? ' - ' + tenEsc(m.outro.title) : '') + '</h2>';
    h += (m.outro.body[0] ? '<p>' + tenEsc(m.outro.body[0]) + '</p>' : '');
    h += m.outro.body.slice(1).map(function (t) { return '<p>' + tenEsc(t) + '</p>'; }).join('');
    if (m.central.text) {
      h += '<blockquote class="tm-q"><p>' + tenEsc(m.central.text) + '</p>' +
        (m.central.cite ? '<cite>(' + tenEsc(m.central.cite) + ')</cite>' : '') + '</blockquote>';
    }
    h += '<p class="tm-bless">' + tenEsc(m.outro.blessing) + '</p>';
    h += '</section>';

    h += '<div class="tm-foot">' + tenEsc(m.foot) + '</div>';
    h += '</article>';
    return h;
  }


  function tenOpenDoc() {
    var s = sermonById(ui.selectedId);
    if (!s) return;
    stashEditor(s);
    openDocModal({
      title: '10분 설교 원고 미리보기',
      sub: (s.passage || '본문') + ' · 강단 낭독용 10분 압축 원고 · 인쇄하거나 PDF·워드로 저장할 수 있습니다',
      html: tenDoc(tenModel(s)),
      copyLabel: '10분 설교 원고',
      word: true
    });
    toast('10분 설교 원고를 만들었습니다 — 큰 글씨·인쇄·복사 그대로 쓰실 수 있습니다');
  }

  /* ================= 과거 설교 원고 읽기 어댑터 ================= */
  var ARC_DASH_RE = /[\u2010-\u2015]/g;
  var ARC_NOISE_RE = /^(사랑하는 성도 ?여러분[!.]?|아멘\.?|설교 ?원고|설교원고|말씀 ?원고|찬송가.*|찬송 ?\d+장.*)$/;
  var ARC_LABEL_RE = /^(서론|도입|들어가며|마무리|결론|적용|정리|말씀의?\s*정리|내용분해|핵심 ?단어|절별 ?주해|본문 ?전체|설교의?\s*(세|두)\s*가지|설교 ?핵심 ?요약|설교에 ?어울리는|블로그|성경 ?본문 ?분석|강단 ?발화용|본문의?\s*(배경|구조|해석|개요|분석|문맥|전후|주요|문장|제목)|배경과?\s*문맥|본문 ?해석|원어|핵심 ?교훈|핵심 ?히브리어|관련 ?성경|주요 ?인물|신학적 ?의미|영적 ?교훈|오늘의?\s*말씀|말씀 ?나눔|나눔 ?질문|적용 ?질문)/;
  var ARC_ORD_KO = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째'];
  var ARC_ORD = { '첫째': 0, '둘째': 1, '셋째': 2, '넷째': 3, '다섯째': 4, '여섯째': 5 };
  var ARC_SENT_END = /(니다|입니다|습니다|하십니다|됩니다|십시오|십니까|까요|까|다|요)[.?!]?$/;
  var ARC_FAITH = /(하나님|예수|그리스도|말씀|믿음|성도|주님|은혜|복음|사랑|소망|순종|기도|영혼|십자가|부활|성령|교회|언약|구원|죄|회개|감사|신앙|목자|진리|지혜|복)/;
  var ARC_HEB = /[\u0590-\u05FF]/;

  function arcLines(body) {
    return String(body || '').split('\n').map(function (t) {
      return String(t).replace(ARC_DASH_RE, '-').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
    });
  }

  function arcServiceText(it) {
    var v = String(it.service || '');
    if (!v || v === '기타') return '예배';
    if (/예배$/.test(v)) return v;
    if (v === '늘푸른') return '늘푸른대학 예배';
    return v + '예배';
  }

  function arcInlineVerses(line) {
    var parts = String(line).split(/\s(?=(\d{1,3})\s+\S)/);
    if (parts.length < 7) return null;
    var out = [];
    for (var i = 1; i + 1 < parts.length; i += 2) out.push({ n: parts[i], t: String(parts[i + 1]).trim() });
    if (out.length < 3) return null;
    var asc = 0;
    for (var k = 1; k < out.length; k++) if (+out[k].n === +out[k - 1].n + 1) asc += 1;
    return asc >= out.length - 2 ? out : null;
  }

  function arcFindVerses(lines) {
    var best = { start: null, end: null, list: [] };
    var n = lines.length, i = 0;
    while (i < n) {
      var m = lines[i].match(/^(\d{1,3})[.)]?\s+(\S.{14,})$/);
      if (!m) {
        var iv = arcInlineVerses(lines[i]);
        if (iv && iv.length > best.list.length) best = { start: i, end: i + 1, list: iv };
        i += 1;
        continue;
      }
      var j = i, vs = [], last = -1;
      while (j < n) {
        var mm = lines[j].match(/^(\d{1,3})[.)]?\s+(\S.{14,})$/);
        if (!mm || ARC_NOISE_RE.test(lines[j])) break;
        var num = +mm[1];
        if (vs.length && !(num === last + 1 || num === last)) break;
        vs.push({ n: String(num), t: mm[2].trim() });
        last = num;
        j += 1;
      }
      if (vs.length < 4) {
        var iv2 = arcInlineVerses(lines[i]);
        if (iv2 && iv2.length > vs.length) vs = iv2;
      }
      if (vs.length >= 4 && vs.length > best.list.length) best = { start: i, end: j > i + 1 ? j : i + 1, list: vs };
      i = Math.max(j, i + 1);
    }
    return best;
  }

  function arcRefSplit(text) {
    var m = String(text).match(/[\(（]\s*(\d+\s*(?:-\s*\d+)?(?:\s*[,·]\s*\d+\s*(?:-\s*\d+)?)*)\s*절\s*[\)）]\s*$/);
    if (m) return { text: String(text).slice(0, m.index).trim(), ref: m[1].replace(/\s+/g, '') + '절' };
    return { text: String(text).trim(), ref: '' };
  }

  function arcRoman(lines) {
    var out = [];
    lines.forEach(function (t, i) {
      var m = t.match(/^([ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ])\.\s*(\S.*)$/);
      if (m) out.push({ i: i, no: m[1], title: m[2].trim() });
    });
    return out;
  }

  function arcDeIntro(t) {
    return String(t || '').replace(/^사랑하는 ?성도 ?여러분[!.,]?\s*/, '').trim();
  }
  function arcFragmentStart(t) {
    return /^(라고|하고|하며|하여|그리하여|합니다|입니다|때문입니다)[\s,.]/.test(t) || /^[”"’']/.test(t);
  }
  function arcPickCore(lines, points) {
    var used = (points || []).map(function (p) { return stripEnd(p.text); });
    var cands = [];
    lines.forEach(function (t) {
      if (!t || t.length < 30 || t.length > 230) return;
      if (ARC_NOISE_RE.test(t) || !ARC_SENT_END.test(t) || !ARC_FAITH.test(t)) return;
      if (arcFragmentStart(t) || used.indexOf(stripEnd(t)) > -1) return;
      cands.push(t);
    });
    if (!cands.length) return '';
    var tail = cands.slice(Math.floor(cands.length * 0.55));
    var pick = tail.length ? tail : cands;
    var best = pick[0];
    pick.forEach(function (t) { if (t.length >= best.length) best = t; });
    return cut(stripEnd(best), 180);
  }

  function arcCands(lines, range) {
    var out = [];
    lines.forEach(function (t, i) {
      if (!t || ARC_NOISE_RE.test(t) || t.length > 90) return;
      if (range && range.start != null && range.start <= i && i < range.end) return;      var m = t.match(/^(첫째|둘째|셋째|넷째|다섯째|여섯째)\s*대지\s*[|·]\s*([^|·]+)[|·]\s*([^|·]+)[|·]\s*(.+)$/);
      if (m) { out.push({ i: i, kind: 'ordtab', ord: m[1], ref: m[2].trim(), text: m[3].trim(), apply: m[4].trim() }); return; }
      m = t.match(/^(첫째|둘째|셋째|넷째|다섯째|여섯째)\s*[,、.]\s*(\S.{2,})$/);
      if (m) { var s1 = arcRefSplit(arcDeIntro(m[2])); out.push({ i: i, kind: 'ord', ord: m[1], text: s1.text, ref: s1.ref }); return; }
      m = t.match(/^(\d{1,2})\.(?!\d)\s*(\S.{2,})$/);
      if (m) {
        var ttl = m[2].trim();
        if (ARC_LABEL_RE.test(ttl) || /\?$/.test(ttl)) return;
        out.push({ i: i, kind: 'num', n: +m[1], text: ttl });
        return;
      }
      m = t.match(/^([①②③④⑤⑥])\s*(\S.{2,})$/);
      if (m) { out.push({ i: i, kind: 'circ', ord: m[1], text: m[2].trim() }); return; }
      m = t.match(/^(\d{1,3}(?:-\d{1,3})?)\s*절\s+(?!(?:말씀|은|는|을|를|이|가|에|의|도|과|와|에서|부터|까지|입니다|이다))(.{3,60})$/);
      if (m && !ARC_SENT_END.test(m[2])) { out.push({ i: i, kind: 'vsum', ref: m[1] + '절', text: m[2].trim() }); return; }
      /* 소제목처럼 놓인 명사구 (문장이 아닌 짧은 줄) */
      if (/^(제목|본문|설교 ?제목|설교 ?본문)/.test(t)) return;
      if (t.length >= 6 && t.length <= 40 && !ARC_SENT_END.test(t) && !/[?？:：]$/.test(t) &&
        !/^(\d|[①-⑥]|·|•|-|\[)/.test(t) && ARC_FAITH.test(t) && lines[i + 1] && lines[i + 1].length >= 40) {
        out.push({ i: i, kind: 'noun', text: t });
      }
    });
    return out;
  }

  function arcAssertRatio(items) {
    if (!items.length) return 0;
    var ok = 0;
    items.forEach(function (c) {
      if (ARC_SENT_END.test(c.text) || c.text.length >= 12 || c.ref) ok += 1;
    });
    return ok / items.length;
  }

  function arcPickPoints(cands, nlines, prefer) {
    var groups = {};
    cands.forEach(function (c) { (groups[c.kind] = groups[c.kind] || []).push(c); });
    var best = null;

    function consider(kind, cs) {
      if (cs.length < 2 || cs.length > 6) return;
      var span = 0;
      for (var k = 0; k < cs.length; k++) {
        var end = (k + 1 < cs.length) ? cs[k + 1].i : nlines;
        span += Math.min(end - cs[k].i, 80);
      }
      var avg = span / cs.length;
      var base = { ordtab: 108, ord: 100, vsum: 96, circ: 88, num: 72, noun: 66 }[kind] || 60;
      if (prefer && kind === prefer) base += 10;
      var withRef = 0;
      cs.forEach(function (c) { if (c.ref) withRef += 1; });
      var score = base + 16 * Math.min(cs.length, 4) + avg * 0.35 + arcAssertRatio(cs) * 10 + (withRef / cs.length) * 34;
      cs.forEach(function (c) {
        if (c.text.length < 6) score -= 0.9;
        if (/위해서$/.test(c.text)) score -= 4;
      });
      if (!best || score > best.score) best = { score: score, kind: kind, items: cs.slice() };
    }

    Object.keys(groups).forEach(function (kind) {
      var cs = groups[kind];
      if (kind === 'ord') {
        var runs = [], cur = [];
        cs.forEach(function (c) {
          var prev = cur[cur.length - 1];
          if (prev && ARC_ORD[prev.ord] != null && ARC_ORD[c.ord] === ARC_ORD[prev.ord] + 1) cur.push(c);
          else { if (cur.length) runs.push(cur); cur = [c]; }
        });
        if (cur.length) runs.push(cur);
        runs.forEach(function (r) { consider('ord', r); });
        return;
      }
      if (kind === 'num') {
        var runs2 = [], cur2 = [];
        cs.forEach(function (c) {
          if (c.n === 1) { if (cur2.length) runs2.push(cur2); cur2 = [c]; return; }
          var prev2 = cur2[cur2.length - 1];
          if (prev2 && c.n === prev2.n + 1) cur2.push(c);
          else { if (cur2.length) runs2.push(cur2); cur2 = []; }
        });
        if (cur2.length) runs2.push(cur2);
        runs2.forEach(function (r) { consider('num', r); });
        return;
      }
      consider(kind, cs);
    });
    return best;
  }

  function arcSentCands(lines, range) {
    var out = [];
    lines.forEach(function (t, i) {
      if (!t || t.length < 12 || t.length > 120) return;
      if (range && range.start != null && range.start <= i && i < range.end) return;
      if (ARC_NOISE_RE.test(t) || !ARC_FAITH.test(t)) return;
      if (/^(\d|[①-⑥]|·|•|-|제목|본문)/.test(t)) return;
      if (!ARC_SENT_END.test(t) || /\?$/.test(t)) return;
      if (/(찬송하시면서|예배를 ?드리겠습니다|페이지에 ?있습니다)/.test(t)) return;
      if (arcFragmentStart(t)) return;
      out.push({ i: i, kind: 'sent', text: cut(arcDeIntro(t), 64) });
    });
    return out;
  }

  function arcChunkPoints(lines) {
    var rows = [];
    lines.forEach(function (t, i) {
      if (!t || t.length < 8 || ARC_NOISE_RE.test(t)) return;
      rows.push({ i: i, t: t });
    });
    if (rows.length < 3) return [];
    var groups = rows.length >= 9 ? 3 : 2;
    var per = Math.ceil(rows.length / groups);
    var out = [];
    for (var g = 0; g < groups; g++) {
      var slice = rows.slice(g * per, (g + 1) * per);
      if (!slice.length) continue;
      out.push({
        ord: ARC_ORD_KO[out.length] || (out.length + 1) + '째',
        ref: '',
        text: cut(slice[0].t, 58),
        apply: '',
        verses: [],
        paras: slice.map(function (r) { return r.t; })
      });
    }
    return out;
  }

  function arcBuildPoints(pick, lines, nlines) {
    var pts = [];
    var items = pick.items;
    items.forEach(function (c, k) {
      var start = c.i + 1;
      var end = (k + 1 < items.length) ? items[k + 1].i : (c.last ? c.last : nlines);
      var raw = [];
      for (var bi = start; bi < end; bi++) {
        if (/^[ⅣⅤⅥⅦⅧⅨⅩ]\./.test(lines[bi])) break;   /* 기도·찬송·블로그 구간은 대지 본문에서 뺀다 */
        raw.push(lines[bi]);
      }
      var body = raw.filter(function (x) { return x && !ARC_NOISE_RE.test(x); });
      var apply = c.apply || '';
      if (!apply) {
        for (var j = body.length - 1; j >= 0; j--) {
          var t = body[j];
          if (t.indexOf(' | ') > -1) continue;
          if (/(적용|결단|실천|믿으십시오|붙드십시오|하십시오|됩시다|나누십시오|간구하십시오|구하십시오|기억하십시오)/.test(t) && t.length >= 20 && t.length <= 190) { apply = t; break; }
        }
      }
      if (!apply) {
        for (var k2 = body.length - 1; k2 >= 0; k2--) {
          var t2 = arcDeIntro(body[k2]);
          if (arcFragmentStart(t2) || /^\d{1,3}[.)]?\s/.test(t2)) continue;
          if (t2.indexOf(' | ') > -1) continue;
          if (t2.length >= 30 && t2.length <= 190) { apply = t2; break; }
        }
      }
      if (!apply) {
        var longest = '';
        body.forEach(function (t3) {
          var tt = arcDeIntro(t3);
          if (arcFragmentStart(tt) || tt.indexOf(' | ') > -1 || /^\d{1,3}[.)]?\s/.test(tt)) return;
          if (tt.length >= 30 && tt.length <= 190 && tt.length > longest.length) longest = tt;
        });
        apply = longest;
      }
      if (!apply) apply = '말씀을 붙들고 이번 주 삶의 자리에서 순종으로 살아갑니다.';
      pts.push({
        ord: ARC_ORD_KO[k] || (k + 1) + '째',
        ref: c.ref || '',
        text: c.text,
        apply: apply,
        verses: [],
        paras: body.slice(0, 4)
      });
    });
    return pts;
  }

  function arcVersePoints(verses) {
    var out = [];
    var groups = verses.length >= 9 ? 3 : (verses.length >= 4 ? 2 : 1);
    var per = Math.ceil(verses.length / groups);
    for (var g = 0; g < groups; g++) {
      var slice = verses.slice(g * per, Math.min((g + 1) * per, verses.length));
      if (!slice.length) continue;
      var first = slice[0], last = slice[slice.length - 1];
      out.push({
        ord: ARC_ORD_KO[out.length],
        ref: first.n === last.n ? first.n + '절' : first.n + '-' + last.n + '절',
        text: cut(first.t, 42),
        apply: '',
        verses: slice.slice(0, 2),
        paras: slice.map(function (v) { return v.n + ' ' + v.t; })
      });
    }
    return out;
  }

  function arcKeyLines(lines) {
    var out = [];
    lines.forEach(function (t) {
      var re = /[“"]([^”"]{12,110})[”"]/g, q;
      while ((q = re.exec(t))) {
        var s = stripEnd(q[1]);
        if (s.length < 16 || /[?？]$/.test(s) || /^(아멘|할렐루야)$/.test(s)) continue;
        if (out.indexOf(s) < 0) out.push(s);
      }
    });
    return out.slice(0, 4);
  }

  function arcHebrew(lines) {
    var rows = [], seen = {};
    var STOP = { '해당하는': 1, '은': 1, '는': 1, '이': 1, '가': 1, '것': 1, '말': 1, '단어': 1, '표현': 1, '기본형': 1 };
    lines.forEach(function (t, idx) {
      if (rows.length >= 8) return;
      var word = '', tr = '', heb = '', mean = '';
      var m = t.match(/['‘’"“]([가-힣]{1,10})['’"”]\s*(?:은|는|이|가)?\s*(?:에?\s*해당하는\s*)?히브리어\s*([가-힣A-Za-z·, ]{1,16}?)\s*[\(（]\s*([^)）]{0,26})\s*[\)）]/);
      if (m && !STOP[m[1]]) { word = m[1].trim(); tr = m[2].trim(); heb = ARC_HEB.test(m[3]) ? m[3].trim() : ''; }
      if (!word) {
        var g = t.match(/히브리어\s*([\u0590-\u05FF][^\(\n]{0,14})\s*[\(（]\s*([^)）]{0,30})[\)）]/);
        if (g) { heb = g[1].trim(); tr = g[2].trim(); word = ''; }
      }
      if (!word && !heb) return;
      var mm = t.match(/[“"]([^”"]{2,40})[”"]\s*를? ?뜻하는/);
      if (mm) mean = mm[1].trim();
      if (!mean) {
        var rest = t.replace(/^.*[\)）]\s*(입니다|이다|입니다\.)?\s*/, '');
        rest = rest.replace(/^[.。]\s*/, '').replace(/^(은|는|이|가|을|를|의|에|로|으로)[,\s]+/, '');
        if (rest.length >= 6) mean = firstSentence(rest, 46);
      }
      if (!mean && lines[idx + 1] && lines[idx + 1].length >= 8) mean = lines[idx + 1];
      if (!mean) mean = '';
      var key = word || tr;
      if (seen[key]) return;
      seen[key] = 1;
      rows.push({
        word: word || tr,
        tr: heb || tr,
        mean: cut(mean, 46) || cut(t, 46)
      });
    });
    return rows;
  }

  function arcHymns(lines) {
    var out = [];
    lines.forEach(function (t) {
      if (out.length >= 3) return;
      var m = t.match(/^\d*\.?\s*(새찬송가|찬송가)\s*(\d{1,3})장\s*[—\-–:]\s*(.+)$/);
      if (m) { out.push({ no: m[2], title: stripEnd(m[3]), label: m[1] }); return; }
      m = t.match(/(새찬송가|찬송가)\s*(\d{1,3})장\s*(?:구\s*찬송가는?\s*\d{1,3}장)?\s*[“"]?([^”"（）,]{2,26})?/);
      if (m) {
        var title = (m[3] || '').replace(/^(구|찬송하시면서|입니다|이요|입니다\.)/, '').trim();
        if (/^구찬송|^\d/.test(title)) title = '';
        var q = t.match(/[“"]([^”"]{2,26})[”"]/);
        if (q) title = q[1];
        out.push({ no: m[2], title: title, label: m[1] });
      }
    });
    var uniq = [];
    out.forEach(function (h) {
      if (!uniq.some(function (u) { return u.no === h.no; })) uniq.push(h);
    });
    return uniq.slice(0, 3);
  }

  function arcPrayerBody(lines, marks) {
    var start = -1, end = lines.length;
    if (marks && marks.length) {
      for (var k = 0; k < marks.length; k++) {
        if (/기도/.test(marks[k].title)) {
          start = marks[k].i + 1;
          end = (k + 1 < marks.length) ? marks[k + 1].i : lines.length;
          break;
        }
      }
    }
    if (start < 0) {
      for (var i = 0; i < lines.length; i++) {
        if (/^(Ⅳ\.|4\.)?\s*(마무리|마침|끝) ?기도/.test(lines[i]) || /^기도문?$/.test(lines[i])) {
          start = i + 1;
          for (var j = start; j < lines.length; j++) {
            if (/^(새찬송가|찬송가|Ⅴ\.|Ⅵ\.|Ⅶ\.|Ⅷ\.|\d+\.\s*설교 핵심)/.test(lines[j])) { end = j; break; }
          }
          break;
        }
      }
    }
    if (start < 0) return [];
    return lines.slice(start, end).filter(function (t) { return t && t.length > 6 && !/^[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]\./.test(t); }).slice(0, 12);
  }

  function arcContexts(lines, marks) {
    var out = [];
    if (marks && marks.length) {
      for (var k = 0; k < marks.length; k++) {
        if (/본문 분석/.test(marks[k].title)) {
          var end = (k + 1 < marks.length) ? marks[k + 1].i : lines.length;
          var cur = null;
          for (var i = marks[k].i + 1; i < end; i++) {
            var t = lines[i];
            var m = t.match(/^(\d)\)\s*(\S.*)$/);
            if (m) { cur = { h: t, p: '' }; out.push(cur); continue; }
            if (cur && !cur.p && t.length > 30) cur.p = t;
          }
          break;
        }
      }
    }
    return out.slice(0, 4);
  }

  function arcComposePrayer(m) {
    var out = [];
    out.push('사랑하고 자비하신 하나님 아버지, 오늘 ' + stripEnd(m.passage || '본문') + '의 말씀으로 우리를 찾아와 주심을 감사합니다.');
    if (m.core) out.push('주님, 오늘 주신 말씀의 중심은 이것입니다. “' + cut(stripEnd(m.core), 100) + '” 이 말씀이 우리의 삶에서 살아지게 하여 주시옵소서.');
    (m.points || []).slice(0, 3).forEach(function (p) {
      var t = stripEnd(p.text);
      if (m.core && t === stripEnd(m.core)) return;
      out.push('주님, “' + cut(t, 70) + '” 이 말씀이 저희의 삶의 자리에서 이루어지게 하여 주시옵소서.');
    });
    out.push('들은 말씀을 잊지 않고 이번 주 삶의 자리에서 순종으로 살아가게 하여 주시옵소서.');
    out.push('믿음이 연약한 저희를 붙드시고, 오늘 받은 은혜를 이웃과 나누는 걸음을 걷게 하여 주시옵소서.');
    out.push('우리 구주 예수 그리스도의 이름으로 기도드립니다. 아멘.');
    return out;
  }

  function arcComposeQuestions(m) {
    var out = [];
    out.push({ q: '본문 말씀을 다시 읽습니다. 가장 오래 마음에 남는 구절은 어디이며, 그 이유는 무엇입니까?', d: '' });
    var tmpl = [
      ' — 이 진리를 나는 지금 어디에서 가장 절실히 필요로 합니까?',
      ' — 이 말씀을 붙들지 못했던 순간은 언제였고, 오늘은 어떻게 달라질 수 있을까요?',
      ' — 이 말씀을 함께 나눌 사람은 누구이며, 무엇을 전하고 싶습니까?'
    ];
    (m.points || []).slice(0, 3).forEach(function (p, i) {
      out.push({ q: '“' + cut(stripEnd(p.text), 44) + '”' + (tmpl[i] || tmpl[0]), d: '' });
    });
    out.push({ q: '이번 주에 이 말씀을 붙들고 구체적으로 실천할 한 가지는 무엇입니까?', d: '' });
    return out.slice(0, 4);
  }

  function arcComposePractice(m) {
    var out = [];
    (m.points || []).slice(0, 3).forEach(function (p) {
      var t = p.apply ? cut(p.apply, 74) : '';
      if (t) out.push(p.ord + ' 대지 · ' + t);
      else out.push(p.ord + ' 대지 · “' + cut(stripEnd(p.text), 40) + '”를 하루 한 번 소리 내어 읽으며 기도하기');
    });
    if (!out.length) {
      out.push('본문을 하루 한 번 소리 내어 읽고, 마음에 남는 구절을 적어 두기');
      out.push('오늘 받은 은혜를 한 사람에게 나누기');
    }
    return out;
  }

  var ARC_BOOKS = '창세기|출애굽기|레위기|민수기|신명기|여호수아|사사기|사시기|룻기|사무엘상|사무엘하|열왕기상|열왕기하|역대상|역대하|에스라|느헤미야|에스더|욥기|시편|잠언|전도서|아가|이사야|예레미야|에스겔|다니엘서|다니엘|호세아|요엘|아모스|오바댜|요나|미가|나훔|하박국|스바냐|학개|스가랴|말라기|마태복음|마가복음|누가복음|요한복음|사도행전|로마서|고린도전서|고린도후서|갈라디아서|에베소서|빌립보서|골로새서|데살로니가전서|데살로니가후서|디모데 전서|디모데 후서|디모데전서|디모데후서|디도서|빌레몬서|히브리서|야고보서|베드로전서|베드로후서|요한1서|요한일서|요한2서|요한3서|유다서|요한계시록';

  function arcSniffPassage(lines) {
    var out = '';
    for (var i = 0; i < Math.min(lines.length, 12); i++) {
      var t = lines[i];
      if (!t) continue;
      var m = t.match(new RegExp('(' + ARC_BOOKS + ')\\s*(\\d{1,3})\\s*장\\s*(\\d{1,3})\\s*(?:[-–~,]\\s*(\\d{1,3}))?'));
      if (m) { out = m[1].replace(/\s+/g, ' ') + ' ' + m[2] + '장 ' + m[3] + (m[4] ? '-' + m[4] : '') + '절'; return out; }
      m = t.match(new RegExp('(' + ARC_BOOKS + ')\\s*(\\d{1,3})\\s*[:：]\\s*(\\d{1,3})\\s*(?:[-–~,]\\s*(\\d{1,3}))?'));
      if (m) { out = m[1].replace(/\s+/g, ' ') + ' ' + m[2] + '장 ' + m[3] + (m[4] ? '-' + m[4] : '') + '절'; return out; }
    }
    return '';
  }

  function arcModel(it, body) {
    var lines = arcLines(body);
    var meta = { title: '', passage: '', central: '', theme: '', core: '' };
    lines.forEach(function (t) {
      var m;
      if (!meta.title && (m = t.match(/^설교 제목\s*[:：]\s*(.+)$/))) meta.title = m[1].trim();
      if (!meta.passage && (m = t.match(/^본문\s*[:：]\s*(.+)$/))) meta.passage = m[1].replace(/\s*[\(（][^)）]*[\)）]\s*$/, '').trim();
      if (!meta.central && (m = t.match(/^중심 말씀\s*[:：]\s*(.+)$/))) meta.central = m[1].trim();
      if (!meta.theme && (m = t.match(/^중심 ?주제\s*[:：]\s*(.+)$/))) meta.theme = m[1].trim();
      if (!meta.core && (m = t.match(/^핵심 ?메시지\s*[:：]\s*(.+)$/))) meta.core = m[1].trim();
    });

    var vres = arcFindVerses(lines);
    var verses = vres.list || [];
    var marks = arcRoman(lines);
    var p6 = /효석패턴6/.test(body) || marks.length >= 4;

    var cands = arcCands(lines, { start: vres.start, end: vres.end });
    /* 대지 바로 다음 줄에 '본문: 시편 25편 1-3절'처럼 적힌 경우 본문 범위를 붙인다 */
    cands.forEach(function (c) {
      if (c.ref || !lines[c.i + 1]) return;
      var nx = lines[c.i + 1];
      var mm = nx.match(/^본문\s*[:：].*?(\d+)\s*[-–]\s*(\d+)\s*절/);
      if (mm) c.ref = mm[1] + '-' + mm[2] + '절';
      else {
        mm = nx.match(/^본문\s*[:：].*?(\d+)\s*절/);
        if (mm) c.ref = mm[1] + '절';
      }
    });
    if (p6 && marks.length) {
      for (var k = 0; k < marks.length; k++) {
        if (/강단/.test(marks[k].title) || /설교 원고/.test(marks[k].title)) {
          var end = (k + 1 < marks.length) ? marks[k + 1].i : lines.length;
          var sub = cands.filter(function (c) { return c.i >= marks[k].i && c.i < end; });
          if (sub.length >= 2) cands = sub;
          break;
        }
      }
    }
    var pick = arcPickPoints(cands, lines.length, p6 ? 'ord' : null);
    if (!pick || pick.items.length < 2) {
      var sc = arcSentCands(lines, { start: vres.start, end: vres.end });
      var picked = [], lastI = -99;
      sc.forEach(function (c) {
        if (c.i - lastI < 4) return;
        picked.push(c);
        lastI = c.i;
      });
      if (picked.length >= 2) pick = { kind: 'sent', items: picked.slice(0, 3) };
    }
    var points = pick ? arcBuildPoints(pick, lines, lines.length) : [];
    if (!points.length && verses.length) points = arcVersePoints(verses);
    if (!points.length) points = arcChunkPoints(lines);

    var keyLines = arcKeyLines(lines);
    var hebrew = arcHebrew(lines);
    var hymns = arcHymns(lines);
    var prayer = arcPrayerBody(lines, marks);
    var contexts = arcContexts(lines, marks);

    var title = it.title || meta.title || '';
    var passage = it.scripture || meta.passage || '';
    if (!passage) passage = arcSniffPassage(lines);
    if (!title) title = passage || '설교 원고';
    if (!passage) passage = meta.passage || '';

    var theme = meta.theme || '';
    if (!theme) {
      var body10 = lines.filter(function (t) { return t && t.length > 40 && !ARC_NOISE_RE.test(t) && !/^\d{1,3}\s/.test(t); });
      theme = body10.length ? cut(arcDeIntro(body10[0]), 260) : '';
    }
    var core = meta.core || '';
    if (!core) core = meta.theme ? firstSentence(meta.theme, 180) : '';
    if (!core) core = arcPickCore(lines, points);
    if (!core) core = points.length ? stripEnd(points[0].text) : '';
    if (!core) core = keyLines[0] || theme;

    var motifs = '';
    if (p6) {
      var mot = [];
      cands.forEach(function (c) {
        if (c.kind === 'ord' && c.text.length <= 26 && mot.length < 4) mot.push(c.text);
      });
      motifs = mot.join(' · ');
    }

    var nums = [];
    String(meta.central || '').replace(/(\d+)\s*(?:-\s*(\d+))?\s*절/g, function (_, a, b) {
      var from = +a, to = b ? +b : +a;
      for (var i = from; i <= to && i < from + 30; i++) if (nums.indexOf(i) < 0) nums.push(i);
      return ' ';
    });
    var centralText = versesByNums(verses, nums, 4).map(function (v) { return v.t; });
    var total = centralText.reduce(function (a, b) { return a + b.length; }, 0);
    while (centralText.length > 2 && total > 200) total -= centralText.pop().length;

    var m = {
      filled: true,
      kind: 'archive',
      id: it.id,
      title: title,
      passage: passage,
      passageShort: passage,
      date: it.date || '',
      fileStamp: it.date || (it.year ? String(it.year) : '연도미상'),
      when: it.date ? (dateLabel(it.date) + ' ' + weekdayOf(it.date)) : (it.year ? it.year + '년' : '연도 미상'),
      serviceText: arcServiceText(it),
      series: '',
      central: meta.central || '',
      centralText: centralText,
      theme: theme,
      core: core,
      motifs: motifs,
      verses: verses,
      summaryRows: [],
      contexts: contexts,
      hebrew: hebrew,
      keyLines: keyLines.slice(0, 4),
      points: points,
      questions: [],
      practice: [],
      prayer: prayer,
      hymns: hymns
    };

    var rows = [{ k: '본문', v: passage || '본문 미정' }];
    if (meta.theme) rows.push({ k: '중심 주제', v: meta.theme });
    if (core && core !== meta.theme) rows.push({ k: '핵심 메시지', v: cut(core, 220) });
    if (points.length) rows.push({ k: '대지', v: points.map(function (p) { return p.ord + ' ' + cut(stripEnd(p.text), 48); }).join(' / ') });
    if (motifs) rows.push({ k: '주요 모티프', v: motifs });
    m.summaryRows = rows;

    m.questions = arcComposeQuestions(m);
    m.practice = arcComposePractice(m);
    if (!m.prayer.length) m.prayer = arcComposePrayer(m);
    return m;
  }

  function arcSelected() {
    if (!ARC.index || !ARC.selected) return null;
    return ARC.index.items.filter(function (x) { return x.id === ARC.selected; })[0] || null;
  }
  function arcBodyOf(it) {
    return (ARC.bodies[arcYearKey(it)] || {})[it.id] || '';
  }
  function arcModelNow(btnMsg) {
    var it = arcSelected();
    if (!it) return null;
    var body = arcBodyOf(it);
    if (!body) {
      toast('본문을 아직 불러오지 못했습니다. 잠시 뒤 다시 눌러 주세요.');
      var key = arcYearKey(it);
      if (!ARC.bodies[key]) {
        loadArcBodies([key], function () { if (ARC.selected === it.id) render(); });
      }
      return null;
    }
    try { return arcModel(it, body); }
    catch (e) { toast((btnMsg || '자료를') + ' 만들지 못했습니다 — ' + (e && e.message ? e.message : e)); return null; }
  }

  function generateArcPptx(btn) {
    if (!window.PptxGenJS) {
      toast('PPT 라이브러리를 아직 불러오지 못했습니다. 잠시 뒤 다시 눌러 주세요.');
      return;
    }
    var m = arcModelNow('PPT를');
    if (!m) return;
    var old = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="ico">⏳</span><span class="tx"><strong>만드는 중…</strong><small>잠시만 기다려 주세요</small></span>'; }
    var restore = function () { if (btn) { btn.disabled = false; btn.innerHTML = old; } };
    var deck;
    try { deck = deckOf(m); } catch (e) { restore(); toast('PPT를 만들지 못했습니다 — ' + (e && e.message ? e.message : e)); return; }
    if (!deck) { restore(); toast('PPT 라이브러리를 불러오지 못했습니다.'); return; }
    var name = pptxFileName(m);
    deck.writeFile({ fileName: name }).then(function () {
      restore();
      toast('과거 설교 PPT를 내려받았습니다 · ' + name);
    })['catch'](function (err) {
      restore();
      toast('PPT 저장에 실패했습니다 — ' + (err && err.message ? err.message : err));
    });
  }

  function openArcStudy() {
    var m = arcModelNow('교재를');
    if (!m) return;
    openDocModal({
      title: '성경공부 교재 미리보기',
      sub: (m.passage || '본문') + ' · 과거 설교 원고에서 만든 교재',
      html: studyDoc(m),
      copyLabel: '성경공부 교재'
    });
  }
  function openArcPrayer() {
    var m = arcModelNow('기도문을');
    if (!m) return;
    openDocModal({
      title: '기도문 미리보기',
      sub: (m.passage || '본문') + ' · 예배·소그룹용 기도문',
      html: prayerDoc(m),
      copyLabel: '기도문'
    });
  }
  function openArcCard() {
    var m = arcModelNow('말씀 묵상카드를');
    if (!m) return;
    openCardModalFor(m);
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
  function cardData(m) {
    var nums = [];
    String(m.central || '').split(',').forEach(function (p) {
      var mm = p.match(/(\d+(?:\s*-\s*\d+)?)\s*절/);
      if (mm) expandNums(mm[1]).forEach(function (n) { if (nums.indexOf(n) < 0) nums.push(n); });
    });
    var got = versesByNums(m.verses, nums, 2);
    if (!got.length) got = (m.verses || []).slice(0, 2);
    var total = 0;
    got.forEach(function (v) { total += v.t.length; });
    while (got.length > 1 && total > 150) total -= got.pop().t.length;

    var msg = String(m.core || '').trim();
    if (!msg) msg = (m.practice && m.practice[0]) || String(m.theme || '');
    var iso = /^\d{4}-\d{2}-\d{2}$/.test(String(m.date || '')) ? m.date : '';
    var dateStr;
    if (iso) {
      var d = parseISO(iso);
      dateStr = d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + '. (' + WD[d.getDay()] + ')';
    } else {
      dateStr = String(m.when || '').trim() || (function () {
        var t = parseISO(todayISO());
        return t.getFullYear() + '. ' + (t.getMonth() + 1) + '. ' + t.getDate() + '. (' + WD[t.getDay()] + ')';
      })();
    }
    return {
      kicker: dateStr + ' · 말씀 묵상',
      passage: String(m.passage || '본문 미정').replace(/\s+/g, ' ').trim(),
      title: String(m.title || '제목 없는 설교').replace(/\s+/g, ' ').trim(),
      verses: got,
      message: cardShortMessage(msg, 104)
    };
  }
  function cardDataOf(s) { return cardData(sermonModel(s)); }

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
    return String(s.fileStamp || s.date || '') + '_' + pass + '_말씀묵상카드.png';
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

  function openCardModalFor(m) {
    var data = cardData(m);
    var state = {
      theme: 0,
      kicker: data.kicker,
      passage: data.passage,
      title: data.title,
      verse: data.verses.map(function (v) { return (v.n ? v.n + ' ' : '') + v.t; }).join('\n'),
      message: data.message,
      seed: String(m.id || '') + '|' + String(m.date || '')
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
      '<p class="card-hint">설교 제목과 본문 주소는 읽고 있는 설교의 제목·본문에서 그대로 가져옵니다. 구절은 줄마다 절 번호를 앞에 두면 그대로 표시됩니다.</p>' +
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
      btn.addEventListener('click', function () { saveCardPng(canvas, m, btn); });
    });
    return back;
  }
  function openCardModal() {
    var s = sermonById(ui.selectedId);
    if (!s) return;
    stashEditor(s);
    openCardModalFor(sermonModel(s));
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
