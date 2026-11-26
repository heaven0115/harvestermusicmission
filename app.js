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

  function loadDb() {
    var base = { version: DEFAULT.version, sermons: clone(DEFAULT.sermons), routines: clone(DEFAULT.routines), dayPlan: clone(DEFAULT.dayPlan), daily: clone(DEFAULT.daily), entries: clone(DEFAULT.entries || []) };
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (!raw) return base;
      var p = JSON.parse(raw);
      if (!p || !Array.isArray(p.sermons)) return base;
      return {
        version: p.version || DEFAULT.version,
        sermons: p.sermons,
        routines: p.routines || base.routines,
        dayPlan: p.dayPlan || base.dayPlan,
        daily: p.daily || base.daily,
        entries: Array.isArray(p.entries) ? p.entries : []
      };
    } catch (e) { return base; }
  }

  function loadUi() {
    var def = { tab: 'library', view: 'list', selectedId: null, weekStart: weekStartISO(todayISO()), search: '', filter: '전체 상태', section: 'analysis', scheduleView: 'list', calMonth: '', calDay: '' };
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
  var TAB_TITLES = { board: '주간 보드', schedule: '일정', library: '설교 서재', progress: '진행률', review: '연결 및 검토' };
  var TAB_ICONS = { board: ICON.grid, schedule: ICON.calendar, library: ICON.book, progress: ICON.chart, review: ICON.gear };

  function buildNav() {
    var nav = document.getElementById('nav');
    Array.prototype.forEach.call(nav.querySelectorAll('.nav-item'), function (btn) {
      var tab = btn.getAttribute('data-tab');
      btn.innerHTML = TAB_ICONS[tab] + '<span class="label">' + TAB_TITLES[tab] + '</span>' +
        (tab === 'library' ? '<span class="badge" id="libBadge">0</span>' : '');
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
      fields + statuses +
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
          '<i></i><span class="lbl-full">' + esc((e.time ? e.time + ' ' : '') + e.title) + '</span><span class="lbl-mini">' + esc(e.time || '일정') + '</span></button>';
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
    } else if (ui.tab === 'progress') body = toolbarHTML() + progressHTML();
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
    var payload = { app: '사역의 한 주', kind: 'ministry-workspace-backup', exportedAt: new Date().toISOString(), version: db.version, sermons: db.sermons, routines: db.routines, dayPlan: db.dayPlan, daily: db.daily, entries: db.entries || [] };
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
        db = { version: DEFAULT.version, sermons: clone(DEFAULT.sermons), routines: clone(DEFAULT.routines), dayPlan: clone(DEFAULT.dayPlan), daily: clone(DEFAULT.daily), entries: clone(DEFAULT.entries || []) };
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
