(function () {
  'use strict';

  /* ============================================================
     하베스터 교적부 — 세리토스장로교회
     단일 오프라인 HTML 앱 (외부 CDN·라이브러리 없음)
     ============================================================ */

  var ROWS = (window.__ROWS__ || []).slice();
  var TOTAL = ROWS.length;
  var CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  var TODAY = new Date();
  var CHUNK = 60;

  /* ---------- helpers ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function digits(s) { return String(s || '').replace(/[^0-9]/g, ''); }
  function nospace(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }
  function chosung(s) {
    var o = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      o += (c >= 0xAC00 && c <= 0xD7A3) ? CHO[Math.floor((c - 0xAC00) / 588)] : s.charAt(i);
    }
    return o;
  }
  function nf(n) { return (n || 0).toLocaleString('ko-KR'); }
  function ageOf(r) {
    if (!r.b) return '';
    var p = r.b.split('-'), y = +p[0], m = +p[1], d = +p[2];
    if (!y || !m || !d) return '';
    var a = TODAY.getFullYear() - y;
    var tm = TODAY.getMonth() + 1, td = TODAY.getDate();
    if (tm < m || (tm === m && td < d)) a--;
    return a >= 0 ? a : '';
  }
  function birthText(r) {
    if (!r.b) return r.by ? r.by + '년생 <span class="em">(월·일 미상)</span>' : '미상';
    var p = r.b.split('-');
    return p[0] + '년 ' + (+p[1]) + '월 ' + (+p[2]) + '일';
  }
  function birthPlain(r) {
    if (!r.b) return r.by ? r.by + '년생 · 월·일 미상' : '생년월일 미상';
    var p = r.b.split('-');
    return p[0] + '년 ' + (+p[1]) + '월 ' + (+p[2]) + '일';
  }
  function relClean(s) {
    return String(s || '').replace(/\s*의\s*/, ' · ').replace(/\s+/g, ' ').trim();
  }
  function icon(name) {
    var p = {
      star: '<path d="M12 3.6l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.9l6-.8z"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
      users: '<path d="M16 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19"/><circle cx="9" cy="7" r="3.4"/><path d="M22 19v-1.5a4 4 0 0 0-3-3.87"/><path d="M16.5 4.1a3.4 3.4 0 0 1 0 6.5"/>',
      cake: '<path d="M4 20h16"/><path d="M5 20v-5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/><path d="M12 13V9"/><path d="M12 6.5c.9-.9.9-2.1 0-3-.9.9-.9 2.1 0 3z"/><path d="M8 13V10"/><path d="M16 13V10"/>',
      bookmark: '<path d="M6 4h12v17l-6-4.2L6 21z"/>',
      chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
      phone: '<path d="M6.5 3.5h3l1.6 4-2 1.4a12 12 0 0 0 5.9 5.9l1.4-2 4 1.6v3a2.5 2.5 0 0 1-2.7 2.5A16.5 16.5 0 0 1 4 6.2 2.5 2.5 0 0 1 6.5 3.5z"/>',
      sms: '<path d="M21 12a8 8 0 0 1-8 8H8l-4 2 1.2-4A8 8 0 1 1 21 12z"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/>',
      map: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
      apple: '<path d="M15.5 3.5c0 1.4-.6 2.6-1.6 3.5-.9.8-2 1.3-3 1.2-.1-1.4.5-2.7 1.5-3.6 1-.9 2.4-1.4 3.1-1.1z"/><path d="M18.5 16.8c-.6 1.4-1.4 2.7-2.6 4-.9 1-1.7 1.4-2.6 1.3-.7 0-1.5-.2-2.3-.6-.8-.3-1.5-.5-2.1-.5-.7 0-1.4.2-2.2.5-.8.4-1.5.6-2 .6-.9 0-1.7-.5-2.6-1.5C-.1 17.6-.6 13.4 1 10.6c.8-1.4 2.1-2.5 3.6-2.6.8 0 1.7.3 2.8.7.9.3 1.4.5 1.8.5.3 0 .9-.2 1.9-.6 1.1-.4 2-.6 2.6-.5 1.8.2 3.2 1.1 4.1 2.6-1.6 1-2.4 2.4-2.3 4.2 0 1.4.6 2.6 1.6 3.4.3.2.5.4.8.5z"/>',
      close: '<path d="M6 6l12 12M18 6L6 18"/>',
      check: '<path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>',
      down: '<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M5 20h14"/>',
      up: '<path d="M12 20V9"/><path d="M7.5 13.5L12 9l4.5 4.5"/><path d="M5 4h14"/>',
      print: '<path d="M7 8V3h10v5"/><rect x="4" y="8" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
      csv: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/>',
      wheat: '<path d="M12 21V9"/><path d="M12 9c0-2.2 1.3-3.7 3.4-4.4-.2 2.3-1.5 3.7-3.4 4.4z"/><path d="M12 9c0-2.2-1.3-3.7-3.4-4.4.2 2.3 1.5 3.7 3.4 4.4z"/><path d="M12 13.5c0-2.2 1.3-3.7 3.4-4.4-.2 2.3-1.5 3.7-3.4 4.4z"/><path d="M12 13.5c0-2.2-1.3-3.7-3.4-4.4.2 2.3 1.5 3.7 3.4 4.4z"/><path d="M12 18c0-2.2 1.3-3.7 3.4-4.4-.2 2.3-1.5 3.7-3.4 4.4z"/><path d="M12 18c0-2.2-1.3-3.7-3.4-4.4.2 2.3 1.5 3.7 3.4 4.4z"/>',
      chev: '<path d="M6 9l6 6 6-6"/>',
      layers: '<path d="M12 3.2l8.4 4.4L12 12 3.6 7.6z"/><path d="M3.6 12.2L12 16.6l8.4-4.4"/><path d="M3.6 16.6L12 21l8.4-4.4"/>',
      camera: '<path d="M3.6 8.6h2.7L7.8 5.8h8.4l1.5 2.8h2.7a1.6 1.6 0 0 1 1.6 1.6v7.6a1.6 1.6 0 0 1-1.6 1.6H3.6A1.6 1.6 0 0 1 2 17.8v-7.6a1.6 1.6 0 0 1 1.6-1.6z"/><circle cx="12" cy="13.4" r="3.3"/>',
      trash: '<path d="M4 7h16"/><path d="M9.4 7V4.7h5.2V7"/><path d="M6.6 7l.9 12.1a1.7 1.7 0 0 0 1.7 1.6h5.6a1.7 1.7 0 0 0 1.7-1.6L17.4 7"/>',
      empty: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'
    }[name] || '';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  /* ---------- 전도회 (2026 세리토스장로교회 전도회 연령 기준) ---------- */
  var JD_LIST = [
    { k: 'youth', name: '청년부', short: '청년부', band: '만 19~34세', years: '1992~2007년생', memo: '기혼으로 표기된 분은 제1전도회' },
    { k: '1', name: '제1전도회', short: '1전도회', band: '~44세', years: '1981~1991년생', chair: '김다니엘 집사', vice: '정슬기 집사 · 안성혁 집사', pastor: '구자경 목사', memo: '청년부 연령대 기혼자 포함' },
    { k: '2', name: '제2전도회', short: '2전도회', band: '45~49세', years: '1976~1980년생', chair: '박사라 집사', vice: '김주훈 집사 · 김현주 집사', pastor: '박석영 목사' },
    { k: '3', name: '제3전도회', short: '3전도회', band: '50~54세', years: '1971~1975년생', chair: '천명준 집사', vice: '고관형 집사 · 권지희 집사', pastor: '유효석 목사' },
    { k: '4', name: '제4전도회', short: '4전도회', band: '55~59세', years: '1966~1970년생', chair: '이현천 집사', vice: '차정원 집사 · 허은형 집사', pastor: '최용진 목사' },
    { k: '5', name: '제5전도회', short: '5전도회', band: '60~64세', years: '1961~1965년생', chair: '유병길 집사', vice: '서성민 집사 · 이효찬 권사', pastor: '유효석 목사' },
    { k: '6', name: '제6전도회', short: '6전도회', band: '65~69세', years: '1956~1960년생', chair: '유병길 집사', vice: '서성민 집사 · 이효찬 권사', pastor: '유효석 목사' },
    { k: '7', name: '제7전도회', short: '7전도회', band: '70~74세', years: '1951~1955년생', chair: '이병구 집사', vice: '장인숙 권사', pastor: '최용진 목사' },
    { k: '8', name: '제8전도회', short: '8전도회', band: '75~79세', years: '1946~1950년생', chair: '이귀만 장로', vice: '홍의표 장로 · 김정민 권사', pastor: '박석영 목사' },
    { k: '9', name: '제9전도회', short: '9전도회', band: '80세 이상', years: '1945년생 이전', chair: '박금승 장로', vice: '홍광성 집사 · 심영숙 권사', pastor: '유연일 목사' },
    { k: 'cs', name: '교회학교·다음세대', short: '교회학교', band: '18세 이하', years: '2008년생 이후' },
    { k: 'nb', name: '생년월일 미상', short: '미상', band: '생일 미기재', years: '' }
  ];
  var JD_MAP = {};
  JD_LIST.forEach(function (d) { JD_MAP[d.k] = d; });
  function jdOf(x) {
    var y = x.b ? +x.b.slice(0, 4) : (x.by ? +x.by : 0);
    if (!y) return 'nb';
    if (y >= 2008) return 'cs';
    if (y >= 1992) return (x.mg === '기혼' || x.mg === '사별') ? '1' : 'youth';
    if (y >= 1981) return '1';
    if (y >= 1976) return '2';
    if (y >= 1971) return '3';
    if (y >= 1966) return '4';
    if (y >= 1961) return '5';
    if (y >= 1956) return '6';
    if (y >= 1951) return '7';
    if (y >= 1946) return '8';
    return '9';
  }

  /* ---------- index ---------- */
  for (var i = 0; i < ROWS.length; i++) {
    var r = ROWS[i];
    r.i = i;
    r._n = nospace(r.n);
    r._cho = chosung(r.n);
    r._num = [r.p1, r.p2, r.mn, r.ad, r.b].map(digits).filter(Boolean).join('|');
    r._phones = [digits(r.p1), digits(r.p2)].filter(Boolean);
    r._hay = [r.n, r.ad, r.sp, r.ld, r.c, r.d, r.g, r.rs, r.rc, r.em, r.mn, r.hr, r.inv, r.rt]
      .map(nospace).filter(Boolean).join('\u0001');
    r._age = ageOf(r);
    r._jd = jdOf(r);
  }
  var FAM = {};
  ROWS.forEach(function (x) {
    if (x.mn) { (FAM[x.mn] = FAM[x.mn] || []).push(x.i); }
  });

  /* ---------- store (localStorage) ---------- */
  var LS = 'hb_kyobo_v1';
  var FAV = {}, MEMO = {}, storeOK = true;
  try {
    var rawStore = localStorage.getItem(LS);
    if (rawStore) {
      var o = JSON.parse(rawStore);
      if (o && typeof o === 'object') { FAV = o.fav || {}; MEMO = o.memo || {}; }
    }
    localStorage.setItem(LS + '_t', '1');
    localStorage.removeItem(LS + '_t');
  } catch (e) { storeOK = false; FAV = FAV || {}; MEMO = MEMO || {}; }
  function persist() {
    if (!storeOK) return;
    try { localStorage.setItem(LS, JSON.stringify({ v: 1, fav: FAV, memo: MEMO })); }
    catch (e) { storeOK = false; showStoreBanner(); }
  }
  function showStoreBanner() {
    var b = document.getElementById('storeBanner');
    if (b) b.classList.add('on');
  }

  /* ---------- photo store (IndexedDB · 사진은 localStorage 5MB 제한 밖에 둡니다) ---------- */
  var PHOTO = {};        // 교인 index -> dataURL(JPEG 240px)
  var PHOTO_LOADED = false;  // 저장소에서 모두 읽어 왔는지
  var PHOTO_DB = null;
  var PHOTO_DB_FAILED = false;
  function photoDB(cb) {
    if (PHOTO_DB) { cb(PHOTO_DB); return; }
    if (PHOTO_DB_FAILED || !window.indexedDB) { cb(null); return; }
    var req;
    try { req = window.indexedDB.open('hb_kyobo_photos', 1); } catch (e) { PHOTO_DB_FAILED = true; cb(null); return; }
    req.onupgradeneeded = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains('p')) db.createObjectStore('p');
    };
    req.onsuccess = function () { PHOTO_DB = req.result; cb(PHOTO_DB); };
    req.onerror = function () { PHOTO_DB_FAILED = true; cb(null); };
    req.onblocked = function () { PHOTO_DB_FAILED = true; cb(null); };
  }
  function photosLoad(cb) {
    photoDB(function (db) {
      if (!db) { cb(false); return; }
      try {
        var out = {}, tx = db.transaction('p', 'readonly');
        var rq = tx.objectStore('p').openCursor();
        rq.onsuccess = function () {
          var cur = rq.result;
          if (cur) { if (typeof cur.value === 'string') out[cur.key] = cur.value; cur.continue(); }
          else { PHOTO = out; cb(true); }
        };
        rq.onerror = function () { cb(false); };
      } catch (e) { cb(false); }
    });
  }
  function photoPut(id, data, cb) {
    PHOTO[id] = data;
    photoDB(function (db) {
      if (!db) { if (cb) cb(false); return; }
      try {
        var tx = db.transaction('p', 'readwrite');
        tx.objectStore('p').put(data, id);
        tx.oncomplete = function () { if (cb) cb(true); };
        tx.onerror = function () { if (cb) cb(false); };
        tx.onabort = function () { if (cb) cb(false); };
      } catch (e) { if (cb) cb(false); }
    });
  }
  function photoRemove(id, cb) {
    delete PHOTO[id];
    photoDB(function (db) {
      if (!db) { if (cb) cb(false); return; }
      try {
        var tx = db.transaction('p', 'readwrite');
        tx.objectStore('p').delete(id);
        tx.oncomplete = function () { if (cb) cb(true); };
        tx.onerror = function () { if (cb) cb(false); };
      } catch (e) { if (cb) cb(false); }
    });
  }
  function photoCount() {
    var n = 0;
    for (var k in PHOTO) { if (PHOTO[k] && ROWS[k]) n++; }
    return n;
  }
  function avHTML(x, cls) {
    var p = PHOTO[x.i];
    if (p) return '<span class="' + cls + ' has-img"><img src="' + p + '" alt="' + esc(x.n) + ' 사진" loading="lazy"></span>';
    return '<span class="' + cls + '">' + esc(x.n.slice(0, 1)) + '</span>';
  }

  /* ---------- state ---------- */
  var S = {
    view: 'search', q: '', f: { c: '', jd: '', d: '', g: '', r: '', ct: '', photo: '' },
    onlyFav: false, sort: 'name', list: [], shown: 0,
    month: TODAY.getMonth() + 1, openC: {}, openD: {}, openJ: {}, modal: null
  };
  var TREE = null, STATS = null;

  /* ---------- dom ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var listEl = $('list'), resCount = $('resCount'), resNote = $('resNote');
  var qEl = $('q'), qClear = $('qclear');
  var modal = $('memberModal');
  var mHead = modal ? modal.querySelector('.sheet-head') : null;
  var mBody = modal ? modal.querySelector('.sheet-body') : null;
  var mFoot = modal ? modal.querySelector('.sheet-foot') : null;
  var dlg = $('dlg'), dlgCard = $('dlgCard');
  var toastEl = $('toast');
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2200);
  }

  /* ---------- filtering ---------- */
  function matchToken(x, t) {
    if (/^[ㄱ-ㅎ]+$/.test(t)) return x._cho.indexOf(t) === 0 || x._cho.indexOf(t) > -1;
    if (x._hay.indexOf(t) > -1) return true;
    var d = digits(t);
    if (d.length >= 2 && x._num.indexOf(d) > -1) return true;
    return false;
  }
  function passes(x, toks) {
    if (S.onlyFav && !FAV[x.i]) return false;
    if (S.f.c) {
      if (S.f.c === '__none__') { if (x.c) return false; }
      else if (x.c !== S.f.c) return false;
    }
    if (S.f.d) {
      if (S.f.d === '__none__') { if (x.d) return false; }
      else if (x.d !== S.f.d) return false;
    }
    if (S.f.g) {
      if (S.f.g === '__none__') { if (x.g) return false; }
      else if (x.g !== S.f.g) return false;
    }
    if (S.f.r) {
      if (S.f.r === '__none__') { if (x.rc) return false; }
      else if (x.rc !== S.f.r) return false;
    }
    if (S.f.ct === 'y' && !(x.p1 || x.p2)) return false;
    if (S.f.ct === 'n' && (x.p1 || x.p2)) return false;
    if (S.f.jd) {
      if (S.f.jd === '__none__') { if (x._jd !== 'nb') return false; }
      else if (x._jd !== S.f.jd) return false;
    }
    if (S.f.photo === 'y' && !PHOTO[x.i]) return false;
    if (S.f.photo === 'n' && PHOTO[x.i]) return false;
    for (var k = 0; k < toks.length; k++) { if (!matchToken(x, toks[k])) return false; }
    return true;
  }
  function score(x, toks) {
    var s = 0;
    for (var k = 0; k < toks.length; k++) {
      var t = toks[k], sc = 5;
      if (/^[ㄱ-ㅎ]+$/.test(t)) {
        if (x._cho === t) sc = 0;
        else if (x._cho.indexOf(t) === 0) sc = 1;
        else sc = 3;
      } else {
        if (x._n === t) sc = 0;
        else if (x._n.indexOf(t) === 0) sc = 1;
        else if (x._n.indexOf(t) > -1) sc = 2;
        else if (x._cho.indexOf(t) === 0) sc = 3;
        else sc = 5;
      }
      var dg = digits(t);
      if (dg && dg.length >= 2) {
        var pk = 6;
        for (var q = 0; q < x._phones.length; q++) {
          var pn = x._phones[q];
          if (pn === dg) { pk = 0; break; }
          else if (pn.slice(-dg.length) === dg) pk = Math.min(pk, 1);
          else if (pn.indexOf(dg) > -1) pk = Math.min(pk, 2);
        }
        if (!/^[0-9]+$/.test(t)) pk = Math.min(pk, sc);
        if (pk < sc) sc = pk;
      }
      s += sc;
    }
    return s;
  }
  function sortList(arr) {
    var toks = S.q.trim().split(/\s+/).filter(Boolean).map(function (t) { return t.toLowerCase(); });
    if (toks.length && S.sort === 'name') {
      var cache = {};
      arr.forEach(function (x) { cache[x.i] = score(x, toks); });
      arr.sort(function (a, b) {
        var d = cache[a.i] - cache[b.i];
        if (d) return d;
        return a.n.localeCompare(b.n, 'ko');
      });
      return;
    }
    if (S.sort === 'age-desc' || S.sort === 'age-asc') {
      var dir = S.sort === 'age-desc' ? -1 : 1;
      arr.sort(function (a, b) {
        var aa = a._age === '' ? -1 : a._age, bb = b._age === '' ? -1 : b._age;
        if (aa === bb) return a.n.localeCompare(b.n, 'ko');
        if (aa === -1) return 1;
        if (bb === -1) return -1;
        return (aa - bb) * dir;
      });
    } else if (S.sort === 'reg-desc') {
      arr.sort(function (a, b) {
        var ad = a.rd || '0000', bd = b.rd || '0000';
        if (ad === bd) return a.n.localeCompare(b.n, 'ko');
        return ad < bd ? 1 : -1;
      });
    } else {
      arr.sort(function (a, b) { return a.n.localeCompare(b.n, 'ko'); });
    }
  }
  function applyFilters() {
    var toks = S.q.trim().split(/\s+/).filter(Boolean).map(function (t) { return t.toLowerCase(); });
    var out = [];
    for (var k = 0; k < ROWS.length; k++) { if (passes(ROWS[k], toks)) out.push(ROWS[k]); }
    sortList(out);
    S.list = out;
    updateBar();
    renderList(true);
    syncFilterOptions();
  }
  function updateBar() {
    resCount.textContent = nf(S.list.length);
    var note = [];
    if (S.q.trim()) note.push('“' + S.q.trim() + '”');
    if (S.onlyFav) note.push('즐겨찾기만');
    var fl = [];
    if (S.f.c) fl.push(S.f.c === '__none__' ? '공동체 미지정' : S.f.c);
    if (S.f.d) fl.push(S.f.d === '__none__' ? '교구 미지정' : S.f.d);
    if (S.f.g) fl.push(S.f.g === '__none__' ? '순 미지정' : S.f.g);
    if (S.f.r) fl.push(S.f.r === '__none__' ? '직분 없음' : S.f.r);
    if (S.f.ct === 'y') fl.push('연락처 있음');
    if (S.f.ct === 'n') fl.push('연락처 없음');
    if (S.f.jd) fl.push(S.f.jd === '__none__' ? '생년월일 미상' : (JD_MAP[S.f.jd] ? JD_MAP[S.f.jd].name : S.f.jd));
    if (S.f.photo === 'y') fl.push('사진 등록됨');
    if (S.f.photo === 'n') fl.push('사진 없음');
    if (fl.length) note.push(fl.join(' · '));
    if (!note.length) note.push('');
    resNote.textContent = note.join(' ') ? '(' + note.join(' ') + ')' : '';
  }

  /* ---------- card ---------- */
  function cardHTML(x) {
    var fav = !!FAV[x.i];
    var memo = (MEMO[x.i] || '').trim();
    var fam = (FAM[x.mn] || []).length;
    var tel = x.p1 || x.p2 || '';
    var rel = [];
    if (x.c) rel.push(esc(x.c)); if (x.d) rel.push(esc(x.d)); if (x.g) rel.push(esc(x.g));
    var relTxt = rel.length ? rel.join('<span class="dot-sep">·</span>')
      : '<span class="unassigned">공동체 미지정</span>';
    var chips = '';
    if (fam > 1) chips += '<span class="chip fam">가족 ' + fam + '명</span>';
    if (memo) chips += '<span class="chip memo">메모</span>';
    if (x.b && +x.b.slice(5, 7) === TODAY.getMonth() + 1) {
      chips += '<span class="chip bday">' + (+x.b.slice(5, 7)) + '월 생일</span>';
    }
    return '<article class="card' + (fav ? ' has-fav' : '') + '" data-id="' + x.i + '" role="button" tabindex="0" aria-label="' + esc(x.n) + ' 상세 보기">' +
      (PHOTO[x.i] ? '<span class="card-av"><img src="' + PHOTO[x.i] + '" alt="' + esc(x.n) + ' 사진" loading="lazy"></span>' : '') +
      '<div class="card-main">' +
        '<div class="card-top"><span class="nm">' + esc(x.n) + '</span>' +
          (x.rs ? '<span class="role-b">' + esc(x.rs) + '</span>' : '') +
          (x.s ? '<span class="sex-b">' + esc(x.s) + '</span>' : '') +
          (x._age !== '' ? '<span class="age-t">만 ' + x._age + '세</span>' : '') +
        '</div>' +
        '<div class="card-sub">' + relTxt + '</div>' +
        (tel ? '<div class="card-tel">' + esc(tel) + '</div>'
             : (x.ad ? '<div class="card-addr">' + esc(x.ad) + '</div>' : '')) +
        (chips ? '<div class="card-chips">' + chips + '</div>' : '') +
      '</div>' +
      '<button class="fav' + (fav ? ' on' : '') + '" data-fav="' + x.i + '" aria-pressed="' + fav + '" aria-label="' + esc(x.n) + ' 즐겨찾기">' + icon('star') + '</button>' +
    '</article>';
  }
  function emptyHTML(title, msg) {
    return '<div class="empty">' + icon('empty') + '<strong>' + esc(title) + '</strong><p>' + msg + '</p></div>';
  }
  function clearListFooter() {
    var a = $('loadMore'); if (a) a.remove();
    var b = $('listEnd'); if (b) b.remove();
  }
  function updateListFooter() {
    clearListFooter();
    if (!S.list.length) return;
    if (S.shown < S.list.length) {
      listEl.insertAdjacentHTML('afterend', '<button class="loadmore" id="loadMore">더 보기 · ' + nf(S.list.length - S.shown) + '명 남음</button>');
    } else if (S.list.length > CHUNK) {
      listEl.insertAdjacentHTML('afterend', '<div class="list-end" id="listEnd">' + nf(S.list.length) + '명 모두 표시했습니다</div>');
    }
  }
  function renderList(reset) {
    if (reset) { listEl.innerHTML = ''; S.shown = 0; clearListFooter(); }
    if (!S.list.length) {
      listEl.innerHTML = emptyHTML('검색 결과가 없습니다', '이름·초성(ㄱㅌㅎ)·전화번호 뒤 4자리·주소·헌금번호로 다시 찾아보세요.<br>필터를 <b>초기화</b>하면 전체 명단이 보입니다.');
      clearListFooter();
      return;
    }
    var end = Math.min(S.shown + CHUNK, S.list.length);
    var html = '';
    for (var k = S.shown; k < end; k++) html += cardHTML(S.list[k]);
    listEl.insertAdjacentHTML('beforeend', html);
    S.shown = end;
    updateListFooter();
  }
  function moreItems() {
    if (S.shown >= S.list.length) return;
    renderList(false);
  }

  /* ---------- filters ---------- */
  function uniqBy(arr, key) {
    var m = {}, out = [];
    arr.forEach(function (x) { var v = x[key] || ''; if (!(v in m)) { m[v] = 0; out.push(v); } m[v]++; });
    out.counts = m;
    return out;
  }
  var COMM_ORDER = ['믿음공동체', '소망공동체', '사랑공동체', '생명공동체', '미분류 공동체', '미배정'];
  function buildFilterOptions() {
    var comms = {};
    ROWS.forEach(function (x) { if (x.c) comms[x.c] = (comms[x.c] || 0) + 1; });
    var order = [];
    COMM_ORDER.forEach(function (c) { if (comms[c]) order.push(c); });
    Object.keys(comms).forEach(function (c) { if (order.indexOf(c) < 0) order.push(c); });
    fillSelect($('f-comm'), '전체 공동체', order.map(function (c) { return { v: c, l: c + ' (' + nf(comms[c]) + ')' }; }),
      [{ v: '__none__', l: '공동체 미지정 (' + nf(TOTAL - order.reduce(function (s, c) { return s + comms[c]; }, 0)) + ')' }]);
    fillSelect($('f-role'), '전체 직분', ROLE_OPTS);
    fillSelect($('f-ct'), '연락처 전체', [{ v: 'y', l: '연락처 있음' }, { v: 'n', l: '연락처 없음' }]);
    var jc = {};
    ROWS.forEach(function (x) { jc[x._jd] = (jc[x._jd] || 0) + 1; });
    fillSelect($('f-jd'), '전체 전도회', JD_LIST.filter(function (d) { return jc[d.k]; }).map(function (d) {
      return { v: d.k, l: d.name + ' (' + nf(jc[d.k]) + ')' };
    }));
    syncFilterOptions();
  }
  var ROLE_OPTS = [];
  function fillSelect(sel, allLabel, opts, tail) {
    var h = '<option value="">' + allLabel + '</option>';
    opts.forEach(function (o) { h += '<option value="' + esc(o.v) + '">' + esc(o.l) + '</option>'; });
    if (tail) tail.forEach(function (o) { h += '<option value="' + esc(o.v) + '">' + esc(o.l) + '</option>'; });
    var cur = sel.value;
    sel.innerHTML = h;
    if (cur && sel.querySelector('option[value="' + cur + '"]')) sel.value = cur;
  }
  function syncFilterOptions() {
    // 교구: 공동체 선택에 연동
    var dmap = {}, gmap = {};
    ROWS.forEach(function (x) {
      if (S.f.c && (S.f.c === '__none__' ? !!x.c : x.c !== S.f.c)) return;
      if (x.d) dmap[x.d] = (dmap[x.d] || 0) + 1;
      if (S.f.d && (S.f.d === '__none__' ? !!x.d : x.d !== S.f.d)) return;
      if (x.g) gmap[x.g] = (gmap[x.g] || 0) + 1;
    });
    var dOrder = Object.keys(dmap).sort();
    fillSelect($('f-dist'), '전체 교구', dOrder.map(function (d) { return { v: d, l: d + ' (' + nf(dmap[d]) + ')' }; }),
      [{ v: '__none__', l: '교구 미지정' }]);
    var gOrder = Object.keys(gmap).sort(function (a, b) { return (+a.replace(/\D/g, '') || 99) - (+b.replace(/\D/g, '') || 99); });
    fillSelect($('f-grp'), '전체 순', gOrder.map(function (g) { return { v: g, l: g + ' (' + nf(gmap[g]) + ')' }; }),
      [{ v: '__none__', l: '순 미지정' }]);
    if (S.f.d && !$('f-dist').querySelector('option[value="' + S.f.d.replace(/"/g, '\\"') + '"]')) S.f.d = '';
    if (S.f.g && !$('f-grp').querySelector('option[value="' + S.f.g.replace(/"/g, '\\"') + '"]')) S.f.g = '';
    $('f-dist').value = S.f.d;
    $('f-grp').value = S.f.g;
    $('f-comm').value = S.f.c;
    $('f-role').value = S.f.r;
    $('f-ct').value = S.f.ct;
    if ($('f-jd')) $('f-jd').value = S.f.jd;
    if ($('f-photo')) $('f-photo').value = S.f.photo;
  }

  /* ---------- member sheet ---------- */
  function kvRow(label, val) {
    if (val === '' || val == null) return '';
    return '<dt>' + esc(label) + '</dt><dd>' + val + '</dd>';
  }
  function openMember(id) {
    var x = ROWS[id];
    if (!x) return;
    S.modal = id;
    var tel = digits(x.p1 || x.p2 || '');
    var mapsQ = encodeURIComponent(x.ad || x.n);
    var famIds = (FAM[x.mn] || []).filter(function (f) { return f !== x.i; });
    var memoVal = MEMO[x.i] || '';

    var kv1 = kvRow('공동체', x.c ? esc(x.c) : '<span class="em">미지정</span>') +
      kvRow('교구', x.d ? esc(x.d) : '<span class="em">미지정</span>') +
      kvRow('순', x.g ? esc(x.g) : '<span class="em">미지정</span>') +
      kvRow('순장', x.ld ? esc(x.ld) : '<span class="em">미지정</span>');

    var kv2 = kvRow('성별', esc(x.s || '미상')) +
      kvRow('직분', x.r ? esc(x.r) : '<span class="em">없음</span>') +
      kvRow('생년월일', birthText(x) + (x.b ? ' <span class="em">(' + (x.l || '양') + '력)</span>' : '')) +
      kvRow('나이', x._age !== '' ? '만 ' + x._age + '세' : '<span class="em">미상</span>') +
      kvRow('배우자', esc(x.sp || '')) +
      kvRow('결혼', esc(x.mg || '')) +
      kvRow('신앙세대주 관계', esc(relClean(x.hr))) +
      kvRow('헌금번호', x.mn ? esc(x.mn) : '<span class="em">없음</span>');

    var kv3 = kvRow('연락처 1', x.p1 ? '<a href="tel:' + digits(x.p1) + '">' + esc(x.p1) + '</a>' : '<span class="em">없음</span>') +
      kvRow('연락처 2', x.p2 ? '<a href="tel:' + digits(x.p2) + '">' + esc(x.p2) + '</a>' : '') +
      kvRow('이메일', x.em ? '<a href="mailto:' + esc(x.em) + '">' + esc(x.em) + '</a>' : '') +
      kvRow('주소', x.ad ? '<a href="https://www.google.com/maps/search/?api=1&query=' + mapsQ + '" target="_blank" rel="noopener">' + esc(x.ad) + '</a>' : '');

    var kv4 = kvRow('등록일', esc(x.rd || '')) +
      kvRow('등록구분', esc(x.rt || '')) +
      kvRow('최종수정일', esc(x.md || '')) +
      kvRow('최종심방일', x.vd ? esc(x.vd) : '<span class="em">기록 없음</span>') +
      kvRow('기타사항', x.nt ? esc(x.nt) : '');

    var famHTML = famIds.length ? '<div class="fam">' + famIds.map(function (fid) {
      var f = ROWS[fid];
      return '<button class="fam-btn" data-m="' + fid + '">' +
        avHTML(f, 'favatar') +
        '<span class="fmain"><span class="fname">' + esc(f.n) +
          (f.rs ? '<span class="role-b">' + esc(f.rs) + '</span>' : '') +
          (f._age !== '' ? '<span class="age-t">만 ' + f._age + '세</span>' : '') +
        '</span><span class="frel">' + esc(relClean(f.hr) || (f.sp ? '배우자 ' + f.sp : '')) +
          (f.p1 ? ' · ' + esc(f.p1) : '') + '</span></span>' +
        '<span class="fgo">' + icon('chev') + '</span></button>';
    }).join('') + '</div>'
      : '<p style="font-size:14px;color:#8A968F;font-weight:600">같은 헌금번호로 묶인 가족이 없습니다.</p>';

    mHead.innerHTML =
      '<div class="pbox"><button class="pav' + (PHOTO[x.i] ? ' has-img' : '') + '" data-act="pickPhoto" aria-label="' + (PHOTO[x.i] ? '사진 변경' : '사진 올리기') + '">' +
        (PHOTO[x.i] ? '<img src="' + PHOTO[x.i] + '" alt="' + esc(x.n) + ' 사진">' : '<span class="pini">' + esc(x.n.slice(0, 1)) + '</span>') +
        '<span class="pcam">' + icon('camera') + '</span>' +
      '</button></div>' +
      '<div class="ht"><h2>' + esc(x.n) + (x.rs ? '<span class="role-b">' + esc(x.rs) + '</span>' : '') + '</h2>' +
      '<div class="hsub">' + (x.s ? esc(x.s) + ' · ' : '') +
        (x._age !== '' ? '만 ' + x._age + '세 · ' : '') +
        (x.c ? esc(x.c) : '공동체 미지정') +
        (x.d ? ' · ' + esc(x.d) : '') + (x.g ? ' · ' + esc(x.g) : '') +
      '</div>' +
      '<div class="pacts"><button class="plink" data-act="pickPhoto">' + icon('camera') + (PHOTO[x.i] ? '사진 변경' : '사진 올리기') + '</button>' +
        (PHOTO[x.i] ? '<button class="plink del" data-act="delPhoto">' + icon('trash') + '사진 삭제</button>' : '') +
      '</div></div>' +
      '<button class="sheet-close" data-act="closeSheet" aria-label="닫기">' + icon('close') + '</button>';

    mBody.innerHTML =
      '<div class="actrow">' +
        '<a class="act" href="tel:' + tel + '" ' + (tel ? '' : 'aria-disabled="true"') + '>' + icon('phone') + '전화</a>' +
        '<a class="act" href="sms:' + tel + '" ' + (tel ? '' : 'aria-disabled="true"') + '>' + icon('sms') + '문자</a>' +
        '<a class="act" href="mailto:' + esc(x.em || '') + '" ' + (x.em ? '' : 'aria-disabled="true"') + '>' + icon('mail') + '이메일</a>' +
        '<a class="act" href="https://www.google.com/maps/search/?api=1&query=' + mapsQ + '" target="_blank" rel="noopener" ' + (x.ad ? '' : 'aria-disabled="true"') + '>' + icon('map') + '구글지도</a>' +
        '<a class="act" href="https://maps.apple.com/?q=' + mapsQ + '" target="_blank" rel="noopener" ' + (x.ad ? '' : 'aria-disabled="true"') + '>' + icon('apple') + '애플지도</a>' +
      '</div>' +
      '<div class="kvsec"><h3>소속</h3><dl class="kv">' + kv1 + '</dl></div>' +
      '<div class="kvsec"><h3>인적사항</h3><dl class="kv">' + kv2 + '</dl></div>' +
      '<div class="kvsec"><h3>연락·주소</h3><dl class="kv">' + kv3 + '</dl></div>' +
      '<div class="kvsec"><h3>행정</h3><dl class="kv">' + kv4 + '</dl></div>' +
      '<div class="kvsec"><h3>가족 ' + (famIds.length + 1) + '명</h3>' + famHTML + '</div>' +
      '<div class="kvsec"><h3>개인 메모</h3><div class="memobox">' +
        '<textarea id="memoText" placeholder="이 교인에 대한 메모를 남겨 두세요. (이 기기에만 저장됩니다)" maxlength="2000">' + esc(memoVal) + '</textarea>' +
        '<div class="memofoot"><span class="saved" id="memoSaved">' + '저장되었습니다' + '</span>' +
        '<span class="hint">자동 저장 · 이 기기 브라우저에만</span></div>' +
      '</div></div>';

    mFoot.innerHTML =
      '<button class="fbtn' + (FAV[x.i] ? ' on' : '') + '" data-act="toggleFav" id="footFav">' + icon('star') + (FAV[x.i] ? '즐겨찾기 해제' : '즐겨찾기') + '</button>' +
      '<button class="fbtn primary" data-act="closeSheet">닫기</button>';

    var mt = $('memoText');
    var tmr = null;
    mt.addEventListener('input', function () {
      clearTimeout(tmr);
      tmr = setTimeout(function () {
        var v = mt.value.trim();
        if (v) MEMO[x.i] = v; else delete MEMO[x.i];
        persist();
        var s = $('memoSaved');
        if (s) { s.classList.add('on'); clearTimeout(s._t); s._t = setTimeout(function () { s.classList.remove('on'); }, 1600); }
      }, 450);
    });

    modal.classList.add('on');
    document.body.style.overflow = 'hidden';
    pushModalState();
    var body = document.querySelector('.sheet-body');
    if (body) body.scrollTop = 0;
  }
  var modalPushed = false;
  function pushModalState() {
    if (modalPushed) return;
    try { history.pushState({ hbm: 1 }, ''); modalPushed = true; } catch (e) { }
  }
  function closeMember(skipHistory) {
    if (!modal.classList.contains('on')) return;
    modal.classList.remove('on');
    document.body.style.overflow = '';
    S.modal = null;
    refreshAfterEdit();
    if (modalPushed && !skipHistory) { modalPushed = false; try { history.back(); } catch (e) { } }
    else modalPushed = false;
  }
  function refreshAfterEdit() {
    if (S.view === 'search') { renderList(true); }
    else if (S.view === 'memo') renderMemos();
    updateTabBadges();
  }
  function toggleFav(id) {
    var k = Number(id);
    if (FAV[k]) delete FAV[k]; else FAV[k] = 1;
    persist();
    // update cards in place
    var cards = document.querySelectorAll('.card[data-id="' + k + '"]');
    for (var c = 0; c < cards.length; c++) {
      var btn = cards[c].querySelector('.fav');
      var on = !!FAV[k];
      if (btn) { btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on); }
      cards[c].classList.toggle('has-fav', on);
    }
    var ff = $('footFav');
    if (ff && S.modal === k) {
      ff.classList.toggle('on', !!FAV[k]);
      ff.innerHTML = icon('star') + (FAV[k] ? '즐겨찾기 해제' : '즐겨찾기');
    }
    updateTabBadges();
    toast(FAV[k] ? '즐겨찾기에 담았습니다' : '즐겨찾기에서 뺐습니다');
    if (S.view === 'memo') renderMemos();
  }

  /* ---------- 사진 올리기 · 매칭 ---------- */
  var photoTarget = null;
  var MATCH = null;

  function pickPhoto(id) {
    var f = $('photoFile');
    if (!f) { toast('이 기기에서는 사진을 고를 수 없습니다'); return; }
    photoTarget = Number(id);
    try { f.value = ''; } catch (e) { }
    f.click();
  }
  function shrinkImage(file, cb) {
    var url = null;
    try { url = URL.createObjectURL(file); } catch (e) { cb(null); return; }
    var img = new Image();
    img.onload = function () {
      try {
        var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        if (!w || !h) throw new Error('empty');
        var side = Math.min(w, h);
        var sx = Math.round((w - side) / 2), sy = Math.round((h - side) / 2);
        var SZ = 240;
        var c = document.createElement('canvas');
        c.width = SZ; c.height = SZ;
        var g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, SZ, SZ);
        g.drawImage(img, sx, sy, side, side, 0, 0, SZ, SZ);
        var data = c.toDataURL('image/jpeg', 0.72);
        try { URL.revokeObjectURL(url); } catch (e2) { }
        if (!data || data.indexOf('data:image/jpeg') !== 0) { cb(null); return; }
        cb(data);
      } catch (e) {
        try { URL.revokeObjectURL(url); } catch (e2) { }
        cb(null);
      }
    };
    img.onerror = function () {
      try { URL.revokeObjectURL(url); } catch (e) { }
      cb(null);
    };
    img.src = url;
  }
  function savePhotoFile(file) {
    var id = photoTarget;
    if (!file || id === null || id === undefined) return;
    var x = ROWS[id];
    if (!x) return;
    if (file.size > 25 * 1024 * 1024) { toast('사진이 너무 큽니다 · 25MB 이하만 가능'); return; }
    toast('사진을 준비하고 있습니다…');
    shrinkImage(file, function (data) {
      if (!data) { toast('이 사진은 열 수 없습니다 · JPG로 다시 시도해 주세요'); return; }
      photoPut(id, data, function (ok) {
        toast(ok ? (x.n + ' 사진을 저장했습니다') : '이번에만 표시됩니다 · 메모 백업으로 보관해 주세요');
        refreshPhotoUI(id);
        if (MATCH) { MATCH.k++; renderMatch(); }
      });
    });
  }
  function askDeletePhoto(id) {
    var x = ROWS[id];
    if (!x) return;
    openDlg('<h3>사진 삭제</h3><p><b>' + esc(x.n) + '</b> 님의 사진을 이 기기에서 지웁니다.</p>' +
      '<div class="dlg-actions"><button class="primary" data-dlg="photodel">삭제</button>' +
      '<button class="ghost" data-dlg="close">취소</button></div>');
  }
  function refreshPhotoUI(id) {
    var x = ROWS[id];
    if (!x) return;
    if (S.modal === id) {
      var pav = mHead.querySelector('.pav');
      if (pav) {
        if (PHOTO[id]) {
          pav.classList.add('has-img');
          pav.innerHTML = '<img src="' + PHOTO[id] + '" alt="' + esc(x.n) + ' 사진"><span class="pcam">' + icon('camera') + '</span>';
        } else {
          pav.classList.remove('has-img');
          pav.innerHTML = '<span class="pini">' + esc(x.n.slice(0, 1)) + '</span><span class="pcam">' + icon('camera') + '</span>';
        }
        pav.setAttribute('aria-label', PHOTO[id] ? '사진 변경' : '사진 올리기');
      }
      var pacts = mHead.querySelector('.pacts');
      if (pacts) {
        pacts.innerHTML = '<button class="plink" data-act="pickPhoto">' + icon('camera') + (PHOTO[id] ? '사진 변경' : '사진 올리기') + '</button>' +
          (PHOTO[id] ? '<button class="plink del" data-act="delPhoto">' + icon('trash') + '사진 삭제</button>' : '');
      }
    }
    var cards = document.querySelectorAll('.card[data-id="' + id + '"], .mini-av[data-photo-of="' + id + '"]');
    for (var c = 0; c < cards.length; c++) {
      var el = cards[c];
      if (el.classList.contains('card-av')) {
        if (PHOTO[id]) el.innerHTML = '<img src="' + PHOTO[id] + '" alt="' + esc(x.n) + ' 사진" loading="lazy">';
      }
    }
    var card = document.querySelector('.card[data-id="' + id + '"]');
    if (card) {
      var av = card.querySelector('.card-av');
      if (PHOTO[id]) {
        if (!av) { av = document.createElement('span'); av.className = 'card-av'; card.insertBefore(av, card.firstChild); }
        av.innerHTML = '<img src="' + PHOTO[id] + '" alt="' + esc(x.n) + ' 사진" loading="lazy">';
      } else if (av) {
        av.parentNode.removeChild(av);
      }
    }
    if (S.view === 'memo') renderMemos();
    else if (S.view === 'jd') renderJd();
    else if (S.view === 'stats') { STATS = null; renderStats(); }
    if (S.view === 'search' && S.f.photo) applyFilters();
    updateTabBadges();
  }

  /* ---------- 빠른 사진 매칭 ---------- */
  function openPhotoMatch(ids) {
    var list = ids || ROWS.filter(function (x) { return !PHOTO[x.i]; }).map(function (x) { return x.i; });
    if (!list.length) { toast('모든 교인에게 사진이 등록되어 있습니다'); return; }
    MATCH = { ids: list, k: 0 };
    renderMatch();
  }
  function renderMatch() {
    if (!MATCH) return;
    if (MATCH.k >= MATCH.ids.length) {
      openDlg('<h3>사진 매칭</h3><p>사진이 없는 교인을 모두 살펴보았습니다.<br>사진 등록 <b>' + nf(photoCount()) + '명</b> / 전체 ' + nf(TOTAL) + '명</p>' +
        '<div class="dlg-actions"><button class="primary" data-dlg="close">닫기</button></div>');
      MATCH = null;
      return;
    }
    var x = ROWS[MATCH.ids[MATCH.k]];
    if (!x) { MATCH.k++; renderMatch(); return; }
    var rel = [x.c, x.d, x.g].filter(Boolean).join(' · ') || '공동체 미지정';
    var jd = JD_MAP[x._jd] ? JD_MAP[x._jd].name : '';
    openDlg('<h3>사진 매칭</h3>' +
      '<p class="pm-prog">' + nf(MATCH.k + 1) + ' / ' + nf(MATCH.ids.length) + ' · 사진이 없는 교인</p>' +
      '<div class="pm-box"><div class="pm-av">' + esc(x.n.slice(0, 1)) + '</div>' +
        '<div class="pm-nm">' + esc(x.n) + (x.rs ? '<span class="role-b">' + esc(x.rs) + '</span>' : '') + '</div>' +
        '<div class="pm-sub">' + esc(birthPlain(x)) + (x._age !== '' ? ' · 만 ' + x._age + '세' : '') + '</div>' +
        '<div class="pm-sub">' + esc(rel) + (jd ? ' · ' + esc(jd) : '') + '</div>' +
      '</div>' +
      '<div class="dlg-actions"><button class="primary" data-dlg="pmpick">' + icon('camera') + '사진 올리기</button>' +
      '<button data-dlg="pmskip">건너뛰기</button><button class="ghost" data-dlg="close">닫기</button></div>');
  }

  /* ---------- groups ---------- */
  function buildTree() {
    if (TREE) return TREE;
    TREE = new Map();
    ROWS.forEach(function (x) {
      var c = x.c || '미지정', d = x.d || '미지정', g = x.g || '미지정';
      if (!TREE.has(c)) TREE.set(c, { n: c, total: 0, d: new Map() });
      var C = TREE.get(c); C.total++;
      if (!C.d.has(d)) C.d.set(d, { n: d, total: 0, g: new Map() });
      var D = C.d.get(d); D.total++;
      if (!D.g.has(g)) D.g.set(g, { n: g, list: [] });
      D.g.get(g).list.push(x.i);
    });
    return TREE;
  }
  function commOrder(list) {
    var known = COMM_ORDER.filter(function (c) { return list.indexOf(c) > -1; });
    var rest = list.filter(function (c) { return known.indexOf(c) < 0 && c !== '미지정'; }).sort();
    if (list.indexOf('미지정') > -1) rest.push('미지정');
    return known.concat(rest);
  }
  function renderGroups() {
    var tree = buildTree();
    var names = commOrder(Array.from(tree.keys()));
    var h = '<div class="sec-head"><h2>공동체 · 교구 · 순</h2><p>' + names.length + '개 공동체 · ' + nf(TOTAL) + '명</p></div><div class="stack">';
    names.forEach(function (cn) {
      var C = tree.get(cn);
      var open = !!S.openC[cn];
      var dnames = Array.from(C.d.keys()).sort(function (a, b) { return (+a.replace(/[^0-9]/g, '') || 99) - (+b.replace(/[^0-9]/g, '') || 99); });
      h += '<div class="gcard' + (open ? ' open' : '') + '">' +
        '<button class="ghead" data-gc="' + esc(cn) + '">' +
          '<span class="gname">' + esc(cn) + '</span>' +
          '<span class="gmeta">' + nf(C.total) + '명 · ' + dnames.length + '교구</span>' +
          '<span class="chev">' + icon('chev') + '</span>' +
        '</button>';
      if (open) {
        h += '<div class="gbody">';
        dnames.forEach(function (dn) {
          var D = C.d.get(dn);
          var dOpen = !!S.openD[cn + '|' + dn];
          h += '<div class="dcard' + (dOpen ? ' open' : '') + '">' +
            '<button class="dhead" data-gd="' + esc(cn) + '|' + esc(dn) + '">' +
              '<span class="dname">' + esc(dn) + '</span>' +
              '<span class="dmeta">' + nf(D.total) + '명 · ' + D.g.size + '순</span>' +
              '<span class="chev">' + icon('chev') + '</span>' +
            '</button>';
          if (dOpen) {
            h += '<div class="dbody">';
            Array.from(D.g.keys()).sort(function (a, b) { return (+a.replace(/[^0-9]/g, '') || 99) - (+b.replace(/[^0-9]/g, '') || 99); }).forEach(function (gn) {
              var G = D.g.get(gn);
              var leader = '';
              G.list.forEach(function (id) { if (ROWS[id].ld) leader = ROWS[id].ld; });
              h += '<div class="grp"><div class="grp-top">' +
                '<span class="grp-name">' + esc(gn) + '</span>' +
                '<span class="grp-lead">순장 ' + (leader ? esc(leader) : '미지정') + '</span>' +
                '<span class="grp-n">' + nf(G.list.length) + '명</span></div>' +
                '<div class="members">' + G.list.slice().sort(function (a, b) { return ROWS[a].n.localeCompare(ROWS[b].n, 'ko'); }).map(function (id) {
                  var x = ROWS[id];
                  return '<button class="mbtn" data-m="' + id + '">' + esc(x.n) + '</button>';
                }).join('') + '</div>' +
                '<button class="grp-more" data-go="' + esc(cn) + '|' + esc(dn) + '|' + esc(gn) + '">이 순 명단 보기 →</button>' +
              '</div>';
            });
            h += '</div>';
          }
          h += '</div>';
        });
        h += '</div>';
      }
      h += '</div>';
    });
    h += '</div>';
    $('v-groups').innerHTML = h;
  }

  /* ---------- 전도회 · 청년부 ---------- */
  function jdLists() {
    var out = {};
    JD_LIST.forEach(function (d) { out[d.k] = []; });
    ROWS.forEach(function (x) { if (out[x._jd]) out[x._jd].push(x.i); else out.nb.push(x.i); });
    return out;
  }
  function renderJd() {
    var lists = jdLists();
    var h = '<div class="sec-head"><h2>전도회 · 청년부</h2><p>2026년 전도회 연령 기준 · 총 ' + nf(TOTAL) + '명</p></div>';
    h += '<div class="jdgrid">';
    JD_LIST.forEach(function (d) {
      var ids = lists[d.k] || [];
      var open = !!S.openJ[d.k];
      h += '<div class="jdcard' + (open ? ' open' : '') + '">' +
        '<button class="jdhead" data-jd="' + esc(d.k) + '" aria-expanded="' + open + '">' +
          '<span class="jdrow1"><span class="jdname">' + esc(d.name) + '</span>' +
            '<span class="jdn">' + nf(ids.length) + '명</span></span>' +
          '<span class="jdmeta">' + esc(d.band) + (d.years ? ' · ' + esc(d.years) : '') + '</span>' +
          (d.chair ? '<span class="jdmeta lead">회장 ' + esc(d.chair) + ' · 부회장 ' + esc(d.vice) + '</span>' : '') +
          (d.pastor ? '<span class="jdmeta lead">담당 ' + esc(d.pastor) + '</span>' : '') +
          (d.memo ? '<span class="jdmeta memo">' + esc(d.memo) + '</span>' : '') +
          '<span class="chev">' + icon('chev') + '</span>' +
        '</button>';
      if (open) {
        var sorted = ids.slice().sort(function (a, b) { return ROWS[a].n.localeCompare(ROWS[b].n, 'ko'); });
        h += '<div class="jdbody">' +
          (sorted.length
            ? '<div class="members">' + sorted.map(function (id) {
                var x = ROWS[id];
                return '<button class="mbtn" data-m="' + id + '">' + esc(x.n) +
                  (x.b || x.by ? '<small>' + (x.b ? x.b.slice(0, 4) : x.by) + '</small>' : '') + '</button>';
              }).join('') + '</div>'
            : '<p class="jdempty">해당하는 교인이 없습니다.</p>') +
          '<div class="jdacts"><button class="grp-more" data-jdgo="' + esc(d.k) + '">검색에서 보기 →</button>' +
          '<button class="grp-more" data-jdprint="' + esc(d.k) + '">이 명단 인쇄 →</button></div>' +
        '</div>';
      }
      h += '</div>';
    });
    h += '</div>';
    $('v-jd').innerHTML = h;
  }

  /* ---------- birthdays ---------- */
  function renderBirth() {
    var by = {}; var counts = new Array(13).fill(0);
    ROWS.forEach(function (x) {
      if (!x.b) return;
      var m = +x.b.slice(5, 7);
      counts[m]++;
      (by[m] = by[m] || []).push(x);
    });
    Object.keys(by).forEach(function (m) {
      by[m].sort(function (a, b) {
        var ad = +a.b.slice(8, 10), bd = +b.b.slice(8, 10);
        if (ad !== bd) return ad - bd;
        return a.n.localeCompare(b.n, 'ko');
      });
    });
    var h = '<div class="sec-head"><h2>생일</h2><p>생년월일이 등록된 교인 기준 · 월별</p></div>';
    h += '<div class="months">';
    for (var m = 1; m <= 12; m++) {
      h += '<button class="mbtn-m" data-month="' + m + '" aria-pressed="' + (S.month === m) + '">' +
        m + '월<small>' + nf(counts[m] || 0) + '명</small></button>';
    }
    h += '</div>';
    var list = by[S.month] || [];
    var todayList = list.filter(function (x) { return +x.b.slice(8, 10) === TODAY.getDate(); });
    var isCur = S.month === TODAY.getMonth() + 1;
    h += '<div class="sec-head" style="margin-top:4px"><h2 style="font-size:18px">' + S.month + '월 생일</h2><p>' + nf(list.length) + '명' +
      (isCur && todayList.length ? ' · 오늘 ' + nf(todayList.length) + '명' : '') + '</p></div>';
    if (!list.length) {
      h += emptyHTML(S.month + '월 생일자가 없습니다', '다른 달을 눌러 확인해 보세요.');
    } else {
      h += '<div class="stack">'
        + list.map(function (x) { return bdayHTML(x, false); }).join('')
        + '</div>';
    }
    $('v-birth').innerHTML = h;
  }
  function bdayHTML(x, isToday) {
    var day = +x.b.slice(8, 10);
    var isT = isToday || (S.month === TODAY.getMonth() + 1 && day === TODAY.getDate());
    var rel = [];
    if (x.c) rel.push(x.c); if (x.d) rel.push(x.d); if (x.g) rel.push(x.g);
    return '<div class="bday-row' + (isT ? ' today' : '') + '" data-m="' + x.i + '">' +
      '<div class="bday-date"><b>' + day + '</b><span>일</span></div>' +
      '<div class="bday-main">' +
        '<div class="bn">' + esc(x.n) +
          (x.rs ? '<span class="role-b">' + esc(x.rs) + '</span>' : '') +
          (isT ? '<span class="today-tag">오늘</span>' : '') +
        '</div>' +
        '<div class="bm">' +
          '<span>' + x.b.replace(/-/g, '.') + '</span>' +
          '<span class="sex-b">' + esc(x.l || '양') + '력</span>' +
          (x._age !== '' ? '<span>만 ' + x._age + '세</span>' : '') +
          (rel.length ? '<span class="brel">' + esc(rel.join(' · ')) + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---------- memos / favorites ---------- */
  function renderMemos() {
    var favIds = Object.keys(FAV).filter(function (k) { return FAV[k]; }).map(Number)
      .filter(function (k) { return ROWS[k]; })
      .sort(function (a, b) { return ROWS[a].n.localeCompare(ROWS[b].n, 'ko'); });
    var memIds = Object.keys(MEMO).filter(function (k) { return (MEMO[k] || '').trim(); }).map(Number)
      .filter(function (k) { return ROWS[k]; })
      .sort(function (a, b) { return ROWS[a].n.localeCompare(ROWS[b].n, 'ko'); });
    var h = '<div class="sec-head"><h2>즐겨찾기 · 메모</h2><p>이 기기에만 저장됩니다</p></div>';
    h += '<div class="stack">';
    var phc = photoCount(), noPh = TOTAL - phc;
    var pct = TOTAL ? Math.round(phc / TOTAL * 1000) / 10 : 0;
    h += '<div class="card-panel"><div class="sec-head" style="margin:0 0 8px"><h2 style="font-size:17px">사진 매칭 현황</h2><p>등록 ' + nf(phc) + '명 · 미등록 ' + nf(noPh) + '명</p></div>' +
      '<div class="pm-meter"><span style="width:' + pct + '%"></span></div>' +
      '<div class="pm-meta">전체 ' + nf(TOTAL) + '명 중 ' + pct + '% 등록 · 사진은 이 기기 브라우저에만 저장됩니다</div>' +
      '<div class="pm-btns">' +
        '<button class="plink" data-act="photoMatch">' + icon('camera') + '한 분씩 사진 매칭</button>' +
        '<button class="plink ghost" data-photofilter="n">사진 없는 교인 보기</button>' +
        (phc ? '<button class="plink ghost" data-photofilter="y">사진 등록된 교인 보기</button>' : '') +
      '</div></div>';
    h += '<div class="card-panel"><div class="sec-head" style="margin:0 0 10px"><h2 style="font-size:17px">즐겨찾기</h2><p>' + nf(favIds.length) + '명</p></div>';
    if (!favIds.length) {
      h += '<p style="font-size:14px;color:#8A968F;font-weight:600;line-height:1.6">교인 카드 오른쪽의 별표(★)를 누르면 여기에 모입니다.</p>';
    } else {
      h += '<div class="stack">' + favIds.map(function (id) { return miniRow(ROWS[id], ''); }).join('') + '</div>';
    }
    h += '</div>';
    h += '<div class="card-panel"><div class="sec-head" style="margin:0 0 10px"><h2 style="font-size:17px">메모</h2><p>' + nf(memIds.length) + '건</p></div>';
    if (!memIds.length) {
      h += '<p style="font-size:14px;color:#8A968F;font-weight:600;line-height:1.6">교인 상세 화면에서 메모를 남기면 여기에 모입니다.</p>';
    } else {
      h += '<div class="stack">' + memIds.map(function (id) { return miniRow(ROWS[id], MEMO[id]); }).join('') + '</div>';
    }
    h += '</div></div>';
    $('v-memo').innerHTML = h;
  }
  function miniRow(x, memo) {
    var tel = x.p1 || x.p2 || '';
    return '<div class="memo-card" data-m="' + x.i + '">' +
      '<div class="mc-top">' + (PHOTO[x.i] ? '<span class="mc-av"><img src="' + PHOTO[x.i] + '" alt="' + esc(x.n) + ' 사진" loading="lazy"></span>' : '') +
        '<span class="nm" style="font-size:16.5px">' + esc(x.n) + '</span>' +
        (x.rs ? '<span class="role-b">' + esc(x.rs) + '</span>' : '') +
        (x._age !== '' ? '<span class="age-t">만 ' + x._age + '세</span>' : '') +
        (FAV[x.i] ? '<span class="chip memo" style="background:#FBF0D8;color:#8A5A15">★ 즐겨찾기</span>' : '') +
      '</div>' +
      (memo ? '<div class="mc-body">' + esc(memo) + '</div>' : '') +
      '<div class="mc-meta">' + (x.c ? esc(x.c) : '공동체 미지정') +
        (x.d ? ' · ' + esc(x.d) : '') + (x.g ? ' · ' + esc(x.g) : '') +
        (tel ? ' · ' + esc(tel) : '') + '</div>' +
    '</div>';
  }

  /* ---------- stats ---------- */
  function computeStats() {
    if (STATS) return STATS;
    var s = {
      total: TOTAL, male: 0, female: 0, unknownSex: 0,
      phone: 0, email: 0, addr: 0, noBirth: 0,
      famGroups: 0, famPeople: 0, assigned: 0,
      comm: {}, dist: {}, role: {}, age: {}, month: new Array(13).fill(0), lunar: 0
    };
    var famCount = {};
    ROWS.forEach(function (x) {
      if (x.s === '남') s.male++; else if (x.s === '여') s.female++; else s.unknownSex++;
      if (x.p1 || x.p2) s.phone++;
      if (x.em) s.email++;
      if (x.ad) s.addr++;
      if (!x.b) s.noBirth++;
      if (x.c) s.assigned++;
      if (x.l === '음') s.lunar++;
      s.comm[x.c || '미지정'] = (s.comm[x.c || '미지정'] || 0) + 1;
      s.dist[x.d || '미지정'] = (s.dist[x.d || '미지정'] || 0) + 1;
      var rk = x.rc || '직분 없음';
      s.role[rk] = (s.role[rk] || 0) + 1;
      var band = x._age === '' ? '미상' : (Math.floor(x._age / 10) * 10) + '대';
      s.age[band] = (s.age[band] || 0) + 1;
      if (x.b) s.month[+x.b.slice(5, 7)]++;
      if (x.mn) famCount[x.mn] = (famCount[x.mn] || 0) + 1;
    });
    Object.keys(famCount).forEach(function (k) { if (famCount[k] > 1) { s.famGroups++; s.famPeople += famCount[k]; } });
    STATS = s;
    return s;
  }
  function bars(obj, order, total, alt) {
    var keys = order || Object.keys(obj).sort(function (a, b) { return obj[b] - obj[a]; });
    var max = 1;
    keys.forEach(function (k) { if ((obj[k] || 0) > max) max = obj[k]; });
    return '<div class="bars">' + keys.map(function (k) {
      var v = obj[k] || 0;
      var pct = Math.round(v / max * 100);
      var share = total ? Math.round(v / total * 1000) / 10 : 0;
      return '<div class="bar-row"><span class="bl">' + esc(k) + '</span>' +
        '<span class="bar-track"><span class="bar-fill' + (alt ? ' alt' : '') + '" style="width:' + pct + '%"></span></span>' +
        '<span class="bv">' + nf(v) + '<small>' + share + '%</small></span></div>';
    }).join('') + '</div>';
  }
  function renderStats() {
    var s = computeStats();
    var h = '<div class="sec-head"><h2>통계</h2><p>교인명부 ' + nf(s.total) + '명 기준</p></div>';
    h += '<div class="stat-grid">' +
      stat('총 교인', nf(s.total) + '<span class="u">명</span>', '남 ' + nf(s.male) + ' · 여 ' + nf(s.female)) +
      stat('연락처 보유', nf(s.phone) + '<span class="u">명</span>', Math.round(s.phone / s.total * 100) + '%') +
      stat('이메일 보유', nf(s.email) + '<span class="u">명</span>', (s.email / s.total * 100).toFixed(1) + '%') +
      stat('공동체 배정', nf(s.assigned) + '<span class="u">명</span>', Math.round(s.assigned / s.total * 100) + '%') +
      stat('가족 그룹', nf(s.famGroups) + '<span class="u">가정</span>', nf(s.famPeople) + '명') +
      stat('생년월일 미상', nf(s.noBirth) + '<span class="u">명</span>', Math.round(s.noBirth / s.total * 100) + '%') +
      stat('사진 등록', nf(photoCount()) + '<span class="u">명</span>', Math.round(photoCount() / s.total * 100) + '%') +
      '</div>';
    h += '<div class="card-panel" style="margin-top:12px"><div class="sec-head" style="margin:0 0 12px"><h2 style="font-size:17px">공동체별</h2><p>' + nf(s.total) + '명</p></div>' +
      bars(s.comm, commOrder(Object.keys(s.comm)), s.total) + '</div>';
    h += '<div class="card-panel" style="margin-top:12px"><div class="sec-head" style="margin:0 0 12px"><h2 style="font-size:17px">교구별</h2></div>' +
      bars(s.dist, ['1교구', '2교구', '3교구', '대기', '미지정'].filter(function (k) { return s.dist[k]; }), s.total, true) + '</div>';
    var ageOrder = ['0대', '10대', '20대', '30대', '40대', '50대', '60대', '70대', '80대', '90대', '100대', '미상'].filter(function (k) { return s.age[k]; });
    h += '<div class="card-panel" style="margin-top:12px"><div class="sec-head" style="margin:0 0 12px"><h2 style="font-size:17px">연령대별</h2><p>만 나이 기준</p></div>' +
      bars(s.age, ageOrder, s.total, true) + '</div>';
    h += '<div class="card-panel" style="margin-top:12px"><div class="sec-head" style="margin:0 0 12px"><h2 style="font-size:17px">월별 생일</h2><p>음력 ' + s.lunar + '명 포함</p></div>' +
      bars(s.month.reduce(function (o, v, i) { if (i) o[i + '월'] = v; return o; }, {}),
        Array.from({ length: 12 }, function (_, i) { return (i + 1) + '월'; }), s.total) + '</div>';
    var roleOrder = ['장로', '안수집사', '집사', '권사', '목사', '전도사', '사모', '선교사', '직분 없음'].filter(function (k) { return s.role[k]; });
    h += '<div class="card-panel" style="margin-top:12px"><div class="sec-head" style="margin:0 0 12px"><h2 style="font-size:17px">직분별</h2><p>서리·협동·은퇴 포함</p></div>' +
      bars(s.role, roleOrder, s.total, true) + '</div>';
    var genderTotal = s.male + s.female + s.unknownSex;
    h += '<div class="card-panel" style="margin-top:12px"><div class="sec-head" style="margin:0 0 12px"><h2 style="font-size:17px">성별</h2></div>' +
      '<div class="stat-grid">' + stat('남', nf(s.male), Math.round(s.male / genderTotal * 100) + '%') +
      stat('여', nf(s.female), Math.round(s.female / genderTotal * 100) + '%') +
      (s.unknownSex ? stat('미상', nf(s.unknownSex), '명') : '') + '</div></div>';
    h += '<div class="footnote">교인명부(2026-11-28)를 이 파일에 그대로 담았습니다. 즐겨찾기·메모는 이 기기의 브라우저에만 저장되며, 다른 기기로 옮기려면 상단 [메모 백업]으로 JSON을 저장한 뒤 [복원]하세요.</div>';
    $('v-stats').innerHTML = h;
  }
  function stat(label, value, sub) {
    return '<div class="stat"><div class="sv">' + value + '</div><div class="sl">' + esc(label) + '</div>' + (sub ? '<div class="ss">' + sub + '</div>' : '') + '</div>';
  }

  /* ---------- tabs ---------- */
  var TABS = [
    { id: 'search', label: '교인 검색', short: '검색', icon: 'search' },
    { id: 'jd', label: '전도회/청년부', short: '전도회', icon: 'layers' },
    { id: 'groups', label: '공동체/순', short: '공동체', icon: 'users' },
    { id: 'birth', label: '이번 달 생일', short: '생일', icon: 'cake' },
    { id: 'memo', label: '즐겨찾기/메모', short: '메모', icon: 'bookmark' },
    { id: 'stats', label: '통계', short: '통계', icon: 'chart' }
  ];
  function setView(v) {
    S.view = v;
    document.querySelectorAll('.tab').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.tab === v));
    });
    document.querySelectorAll('.view').forEach(function (s) { s.classList.toggle('on', s.id === 'v-' + v); });
    if (v === 'groups') renderGroups();
    else if (v === 'jd') renderJd();
    else if (v === 'birth') renderBirth();
    else if (v === 'memo') renderMemos();
    else if (v === 'stats') renderStats();
    else renderList(true);
    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, 0); }
  }
  function updateTabBadges() {
    var favN = Object.keys(FAV).filter(function (k) { return FAV[k]; }).length;
    var tb = document.querySelector('.tab[data-tab="memo"] .tbadge');
    if (tb) tb.textContent = favN || '';
    var bn = document.querySelector('.tab[data-tab="birth"] .tbadge');
    if (bn) {
      var cur = ROWS.filter(function (x) { return x.b && +x.b.slice(5, 7) === TODAY.getMonth() + 1; }).length;
      bn.textContent = cur;
    }
  }

  /* ---------- backup / restore ---------- */
  function payload() {
    var favN = 0, memN = 0;
    Object.keys(FAV).forEach(function (k) { if (FAV[k]) favN++; });
    Object.keys(MEMO).forEach(function (k) { if ((MEMO[k] || '').trim()) memN++; });
    var photos = {}, phN = 0;
    for (var k in PHOTO) { if (PHOTO[k] && ROWS[k]) { photos[k] = PHOTO[k]; phN++; } }
    return { app: '하베스터 교적부', version: 2, exportedAt: new Date().toISOString(),
      counts: { favorites: favN, memos: memN, photos: phN }, favorites: FAV, memos: MEMO, photos: photos };
  }
  function openBackup() {
    var p = payload();
    var json = JSON.stringify(p, null, 2);
    var big = json.length > 1200000;
    openDlg('<h3>메모 · 사진 백업</h3><p>즐겨찾기 <b>' + nf(p.counts.favorites) + '명</b> · 메모 <b>' + nf(p.counts.memos) + '건</b> · 사진 <b>' + nf(p.counts.photos) + '명</b>을 JSON 하나로 저장합니다.<br>' +
      (big ? '사진이 많아 내용이 커서 화면에는 싣지 않았습니다. 아래 <b>[JSON 파일로 저장]</b>을 눌러 주세요.' : '아이폰에서 파일 저장이 안 되면 아래 내용을 복사해 두세요.') + '</p>' +
      (big ? '' : '<textarea readonly id="backupText">' + esc(json) + '</textarea>') +
      '<div class="dlg-actions"><button class="primary" data-dlg="download">JSON 파일로 저장</button>' +
      (big ? '' : '<button data-dlg="copy">클립보드에 복사</button>') + '<button class="ghost" data-dlg="close">닫기</button></div>');
  }
  function openRestore() {
    openDlg('<h3>메모 · 사진 복원</h3><p>백업한 JSON 파일을 선택하거나, 복사해 둔 내용을 붙여넣으세요.<br>이 기기의 즐겨찾기·메모·사진을 <b>백업 내용으로 바꾸는 것이 아니라 더합니다.</b></p>' +
      '<label class="filebtn">JSON 파일 선택<input type="file" accept=".json,application/json,text/plain" id="restoreFile" hidden></label>' +
      '<textarea id="restoreText" placeholder=\'{"favorites":{...},"memos":{...},"photos":{...}}\' style="margin-top:10px"></textarea>' +
      '<div class="dlg-actions"><button class="primary" data-dlg="restore">복원 실행</button><button class="ghost" data-dlg="close">닫기</button></div>');
  }
  function applyRestore(txt) {
    var o;
    try { o = JSON.parse(txt); } catch (e) { toast('JSON 형식이 아닙니다'); return; }
    var fav = o.favorites || o.fav || {};
    var mem = o.memos || o.memo || {};
    var pho = o.photos || {};
    if (typeof fav !== 'object' || typeof mem !== 'object') { toast('백업 파일 형식이 아닙니다'); return; }
    var nf2 = 0, nm = 0, nph = 0, pend = 0;
    Object.keys(fav).forEach(function (k) { if (fav[k] && ROWS[+k]) { FAV[+k] = 1; nf2++; } });
    Object.keys(mem).forEach(function (k) { if (typeof mem[k] === 'string' && mem[k].trim() && ROWS[+k]) { MEMO[+k] = mem[k]; nm++; } });
    persist();
    if (pho && typeof pho === 'object') {
      var keys = Object.keys(pho).filter(function (k) { return ROWS[+k] && typeof pho[k] === 'string' && pho[k].indexOf('data:image/') === 0; });
      keys.forEach(function (k) {
        var id = +k;
        if (PHOTO[id] === pho[k]) return;
        nph++; pend++;
        photoPut(id, pho[k], function () { pend--; if (!pend) finishRestore(); });
      });
    }
    var done = false;
    function finishRestore() {
      if (done) return;
      done = true;
      PHOTO_LOADED = true;
      refreshAfterEdit();
      toast('복원 완료 · 즐겨찾기 ' + nf(nf2) + '명, 메모 ' + nf(nm) + '건, 사진 ' + nf(nph) + '명');
    }
    if (!pend) finishRestore();
    closeDlg();
  }
  function openDlg(html) { dlgCard.innerHTML = html; dlg.classList.add('on'); }
  function closeDlg() { dlg.classList.remove('on'); dlgCard.innerHTML = ''; }
  function downloadFile(name, text, type) {
    try {
      var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 800);
      return true;
    } catch (e) { return false; }
  }
  function copyText(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { toast('복사했습니다'); }, function () { toast('복사 실패 · 직접 선택해 복사하세요'); });
    } else {
      var t = document.getElementById('backupText');
      if (t) { t.focus(); t.select(); try { document.execCommand('copy'); toast('복사했습니다'); } catch (e) { toast('직접 선택해 복사하세요'); } }
    }
  }

  /* ---------- print / csv ---------- */
  function activeRows() {
    if (S.view === 'search') return S.list;
    if (S.view === 'birth') {
      return ROWS.filter(function (x) { return x.b && +x.b.slice(5, 7) === S.month; })
        .sort(function (a, b) { return (+a.b.slice(8, 10)) - (+b.b.slice(8, 10)) || a.n.localeCompare(b.n, 'ko'); });
    }
    if (S.view === 'memo') {
      var ids = Object.keys(FAV).filter(function (k) { return FAV[k]; }).map(Number)
        .concat(Object.keys(MEMO).filter(function (k) { return (MEMO[k] || '').trim(); }).map(Number));
      var uniq = ids.filter(function (v, i, a) { return a.indexOf(v) === i; }).filter(function (k) { return ROWS[k]; });
      return uniq.map(function (k) { return ROWS[k]; }).sort(function (a, b) { return a.n.localeCompare(b.n, 'ko'); });
    }
    if (S.view === 'groups') {
      return ROWS.slice().sort(function (a, b) {
        var ak = (a.c || 'zzz') + (a.d || '') + (a.g || '');
        var bk = (b.c || 'zzz') + (b.d || '') + (b.g || '');
        return ak.localeCompare(bk, 'ko') || a.n.localeCompare(b.n, 'ko');
      });
    }
    if (S.view === 'jd') {
      var order = {};
      JD_LIST.forEach(function (d, i) { order[d.k] = i; });
      return ROWS.slice().sort(function (a, b) {
        return (order[a._jd] - order[b._jd]) || a.n.localeCompare(b.n, 'ko');
      });
    }
    return ROWS.slice().sort(function (a, b) { return a.n.localeCompare(b.n, 'ko'); });
  }
  function viewLabel() {
    return { search: '교인검색', jd: '전도회', groups: '공동체순', birth: S.month + '월생일', memo: '즐겨찾기메모', stats: '통계' }[S.view] || '목록';
  }
  function filterSummary() {
    var p = [];
    if (S.view === 'search') {
      if (S.q.trim()) p.push('검색: ' + S.q.trim());
      if (S.f.c) p.push(S.f.c === '__none__' ? '공동체 미지정' : S.f.c);
      if (S.f.d) p.push(S.f.d === '__none__' ? '교구 미지정' : S.f.d);
      if (S.f.g) p.push(S.f.g === '__none__' ? '순 미지정' : S.f.g);
      if (S.f.r) p.push(S.f.r);
      if (S.f.jd) p.push(S.f.jd === '__none__' ? '생년월일 미상' : (JD_MAP[S.f.jd] ? JD_MAP[S.f.jd].name : S.f.jd));
      if (S.f.photo === 'y') p.push('사진 등록됨');
      if (S.f.photo === 'n') p.push('사진 없음');
      if (S.f.ct === 'y') p.push('연락처 있음');
      if (S.f.ct === 'n') p.push('연락처 없음');
      if (S.onlyFav) p.push('즐겨찾기만');
    } else if (S.view === 'birth') p.push(S.month + '월 생일');
    else if (S.view === 'memo') p.push('즐겨찾기·메모');
    return p.join(' · ');
  }
  function doPrint() {
    var rows = activeRows();
    var hasMemo = rows.some(function (x) { return (MEMO[x.i] || '').trim(); });
    var input = '<div class="p-title">하베스터 교적부 · 세리토스장로교회</div>' +
      '<div class="p-meta">' + (filterSummary() || '전체 명단') + ' · ' + nf(rows.length) + '명 · 출력 ' + ymd(new Date()) + ' · 교인명부 2026-11-28 기준</div>';
    var head = '<thead><tr><th style="width:5%">#</th><th style="width:9%">이름</th><th style="width:9%">직분</th>' +
      '<th style="width:16%">공동체 · 교구 · 순</th><th style="width:11%">생년월일</th><th style="width:13%">연락처</th>' +
      '<th>주소</th>' + (hasMemo ? '<th style="width:12%">메모</th>' : '') + '</tr></thead>';
    var body = '<tbody>' + rows.map(function (x, i) {
      var rel = [x.c, x.d, x.g].filter(Boolean).join(' · ') || '미지정';
      return '<tr><td class="num">' + (i + 1) + '</td><td><b>' + esc(x.n) + '</b></td><td>' + esc(x.rs || '') + '</td>' +
        '<td>' + esc(rel) + '</td><td>' + esc(x.b ? x.b + ' (' + (x.l || '양') + ')' : (x.by ? x.by + ' (연도만)' : '-')) + '</td>' +
        '<td>' + esc(x.p1 || x.p2 || '-') + '</td><td>' + esc(x.ad || '') + '</td>' +
        (hasMemo ? '<td>' + esc((MEMO[x.i] || '').replace(/\n/g, ' ')) + '</td>' : '') + '</tr>';
    }).join('') + '</tbody>';
    $('print-area').innerHTML = input + '<table class="p-table">' + head + body + '</table>';
    setTimeout(function () { window.print(); }, 60);
  }
  function doCSV() {
    var rows = activeRows();
    var head = ['이름', '성별', '직분', '교인번호', '생년월일', '음양력', '나이', '전도회', '공동체', '교구', '순', '순장', '배우자', '신앙세대주관계', '연락처1', '연락처2', '이메일', '주소', '등록일', '등록구분', '최종수정일', '최종심방일', '즐겨찾기', '메모'];
    function cell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
    var lines = [head.map(cell).join(',')];
    rows.forEach(function (x) {
      lines.push([x.n, x.s, x.r, x.mn, x.b || (x.by ? x.by + ' (연도만)' : ''), x.l, x._age, (JD_MAP[x._jd] || {}).name || '', x.c, x.d, x.g, x.ld, x.sp, x.hr, x.p1, x.p2, x.em, x.ad, x.rd, x.rt, x.md, x.vd, FAV[x.i] ? 'O' : '', (MEMO[x.i] || '').replace(/\n/g, ' ')].map(cell).join(','));
    });
    var name = '하베스터교적부_' + viewLabel() + '_' + ymd(new Date()) + '.csv';
    if (downloadFile(name, '\ufeff' + lines.join('\r\n'), 'text/csv;charset=utf-8')) toast(nf(rows.length) + '명 CSV 저장');
    else toast('저장할 수 없습니다');
  }

  /* ---------- events ---------- */
  function bind() {
    document.querySelectorAll('.tab').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.dataset.tab); });
    });
    // search
    var tmr = null;
    qEl.addEventListener('input', function () {
      qClear.classList.toggle('on', !!qEl.value);
      clearTimeout(tmr);
      tmr = setTimeout(function () { S.q = qEl.value; applyFilters(); }, 130);
    });
    qClear.addEventListener('click', function () { qEl.value = ''; qClear.classList.remove('on'); S.q = ''; applyFilters(); qEl.focus(); });
    $('f-comm').addEventListener('change', function (e) { S.f.c = e.target.value; S.f.d = ''; S.f.g = ''; applyFilters(); });
    $('f-jd').addEventListener('change', function (e) { S.f.jd = e.target.value; applyFilters(); });
    $('f-photo').addEventListener('change', function (e) { S.f.photo = e.target.value; applyFilters(); });
    $('f-dist').addEventListener('change', function (e) { S.f.d = e.target.value; S.f.g = ''; applyFilters(); });
    $('f-grp').addEventListener('change', function (e) { S.f.g = e.target.value; applyFilters(); });
    $('f-role').addEventListener('change', function (e) { S.f.r = e.target.value; applyFilters(); });
    $('f-ct').addEventListener('change', function (e) { S.f.ct = e.target.value; applyFilters(); });
    $('f-sort').addEventListener('change', function (e) { S.sort = e.target.value; sortList(S.list); renderList(true); });
    $('onlyFav').addEventListener('click', function () {
      S.onlyFav = !S.onlyFav;
      this.setAttribute('aria-pressed', String(S.onlyFav));
      applyFilters();
    });
    $('resetF').addEventListener('click', function () {
      S.q = ''; qEl.value = ''; qClear.classList.remove('on');
      S.f = { c: '', jd: '', d: '', g: '', r: '', ct: '', photo: '' }; S.onlyFav = false; S.sort = 'name';
      $('f-sort').value = 'name'; $('onlyFav').setAttribute('aria-pressed', 'false');
      applyFilters();
    });
    // list interactions
    document.addEventListener('click', function (e) {
      var t = e.target;
      var fav = t.closest('[data-fav]');
      if (fav) { e.preventDefault(); e.stopPropagation(); toggleFav(fav.dataset.fav); return; }
      var card = t.closest('.card, .memo-card, .bday-row');
      if (card && card.dataset.id !== undefined) { openMember(+card.dataset.id); return; }
      if (card && card.dataset.m !== undefined) { openMember(+card.dataset.m); return; }
      var mbtn = t.closest('[data-m]');
      if (mbtn) { openMember(+mbtn.dataset.m); return; }
      var lmore = t.closest('#loadMore');
      if (lmore) { moreItems(); return; }
      var gc = t.closest('[data-gc]');
      if (gc) {
        var c = gc.dataset.gc;
        S.openC[c] = !S.openC[c]; renderGroups(); return;
      }
      var gd = t.closest('[data-gd]');
      if (gd) {
        var k = gd.dataset.gd;
        S.openD[k] = !S.openD[k]; renderGroups(); return;
      }
      var go = t.closest('[data-go]');
      if (go) {
        var p = go.dataset.go.split('|');
        S.f = { c: p[0] === '미지정' ? '__none__' : p[0], jd: '', d: p[1] === '미지정' ? '__none__' : p[1], g: p[2] === '미지정' ? '__none__' : p[2], r: '', ct: '', photo: '' };
        S.q = ''; qEl.value = ''; qClear.classList.remove('on'); S.onlyFav = false;
        $('onlyFav').setAttribute('aria-pressed', 'false');
        setView('search'); applyFilters(); return;
      }
      var jd = t.closest('[data-jd]');
      if (jd) {
        var jk = jd.dataset.jd;
        S.openJ[jk] = !S.openJ[jk]; renderJd(); return;
      }
      var jdgo = t.closest('[data-jdgo]');
      if (jdgo) {
        S.f = { c: '', jd: jdgo.dataset.jdgo, d: '', g: '', r: '', ct: '', photo: '' };
        S.q = ''; qEl.value = ''; qClear.classList.remove('on'); S.onlyFav = false;
        $('onlyFav').setAttribute('aria-pressed', 'false');
        setView('search'); applyFilters(); return;
      }
      var jdp = t.closest('[data-jdprint]');
      if (jdp) {
        S.f = { c: '', jd: jdp.dataset.jdprint, d: '', g: '', r: '', ct: '', photo: '' };
        S.q = ''; qEl.value = ''; qClear.classList.remove('on'); S.onlyFav = false;
        $('onlyFav').setAttribute('aria-pressed', 'false');
        setView('search'); applyFilters();
        setTimeout(doPrint, 150); return;
      }
      var pf = t.closest('[data-photofilter]');
      if (pf) {
        S.f.photo = pf.dataset.photofilter;
        setView('search'); applyFilters(); return;
      }
      var mon = t.closest('[data-month]');
      if (mon) { S.month = +mon.dataset.month; renderBirth(); return; }
      // sheet / dialog actions
      var act = t.closest('[data-act]');
      if (act) {
        var a = act.dataset.act;
        if (a === 'closeSheet') { closeMember(); return; }
        if (a === 'toggleFav') { toggleFav(S.modal); return; }
        if (a === 'pickPhoto') { pickPhoto(S.modal); return; }
        if (a === 'delPhoto') { askDeletePhoto(S.modal); return; }
        if (a === 'photoMatch') { openPhotoMatch(); return; }
        if (a === 'backup') { openBackup(); return; }
        if (a === 'restore') { openRestore(); return; }
        if (a === 'print') { doPrint(); return; }
        if (a === 'csv') { doCSV(); return; }
      }
      var d = t.closest('[data-dlg]');
      if (d) {
        var dk = d.dataset.dlg;
        if (dk === 'close') { closeDlg(); return; }
        if (dk === 'pmpick') { if (MATCH) pickPhoto(MATCH.ids[MATCH.k]); return; }
        if (dk === 'pmskip') { if (MATCH) { MATCH.k++; renderMatch(); } return; }
        if (dk === 'photodel') {
          var did = S.modal;
          photoRemove(did, function () {
            closeDlg();
            refreshPhotoUI(did);
            toast('사진을 삭제했습니다');
          });
          return;
        }
        if (dk === 'download') {
          var txt = JSON.stringify(payload(), null, 2);
          var nm = '하베스터교적부_메모백업_' + ymd(new Date()) + '.json';
          if (downloadFile(nm, txt, 'application/json')) toast('백업 파일을 저장했습니다');
          else toast('저장할 수 없습니다 · 내용을 복사하세요');
          return;
        }
        if (dk === 'copy') { copyText(JSON.stringify(payload(), null, 2)); return; }
        if (dk === 'restore') { applyRestore(document.getElementById('restoreText').value); return; }
      }
    });
    document.addEventListener('change', function (e) {
      if (e.target.id === 'photoFile') {
        var pf = e.target.files && e.target.files[0];
        if (pf) savePhotoFile(pf);
        return;
      }
      if (e.target.id === 'restoreFile') {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        var rd = new FileReader();
        rd.onload = function () { document.getElementById('restoreText').value = String(rd.result || ''); toast('파일을 읽었습니다 · [복원 실행]을 누르세요'); };
        rd.readAsText(f, 'utf-8');
      }
    });
    // modal close
    modal.addEventListener('click', function (e) {
      if (e.target.closest('.modal-bg')) closeMember();
    });
    dlg.addEventListener('click', function (e) {
      if (e.target.closest('.dlg-bg')) closeDlg();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (dlg.classList.contains('on')) closeDlg();
        else if (modal.classList.contains('on')) closeMember();
      }
      if (e.key === 'Enter' && document.activeElement && document.activeElement.classList.contains('card')) {
        openMember(+document.activeElement.dataset.id);
      }
    });
    window.addEventListener('popstate', function () {
      if (modal.classList.contains('on')) closeMember(true);
    });
    // infinite scroll
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting && S.view === 'search' && S.shown < S.list.length) moreItems(); });
      }, { rootMargin: '600px' });
      var sentinel = document.createElement('div');
      sentinel.id = 'sentinel';
      sentinel.style.height = '1px';
      listEl.parentNode.appendChild(sentinel);
      io.observe(sentinel);
    }
  }

  /* ---------- init ---------- */
  var inited = false;
  function init() {
    if (inited) return;
    inited = true;
    document.querySelector('.brand-text p b').textContent = nf(TOTAL);
    var tb = document.querySelector('.tabbar');
    tb.innerHTML = TABS.map(function (t) {
      return '<button class="tab" role="tab" data-tab="' + t.id + '" aria-selected="' + (t.id === 'search') + '">' +
        icon(t.icon) + '<span class="lbl-full">' + t.label + '</span><span class="lbl-short">' + t.short + '</span>' +
        (t.id === 'memo' || t.id === 'birth' ? '<span class="tbadge"></span>' : '') + '</button>';
    }).join('');
    // role options
    var roleMap = {};
    ROWS.forEach(function (x) { if (x.rc) roleMap[x.rc] = (roleMap[x.rc] || 0) + 1; });
    ROLE_OPTS = Object.keys(roleMap).sort(function (a, b) { return roleMap[b] - roleMap[a]; })
      .map(function (k) { return { v: k, l: k + ' (' + nf(roleMap[k]) + ')' }; });
    buildFilterOptions();
    bind();
    if (!storeOK) showStoreBanner();
    updateTabBadges();
    applyFilters();
    var ba = $('builtAt');
    if (ba) ba.textContent = (window.__META__ && window.__META__.built) || ymd(new Date());
    // 사진(IndexedDB) 불러오기 — 다 읽으면 화면을 한 번 다시 그립니다
    photosLoad(function (ok) {
      PHOTO_LOADED = true;
      if (!ok && Object.keys(PHOTO).length === 0) {
        var st = $('storeBanner');
        if (st) { st.innerHTML = '이 브라우저에서는 사진 저장소(IndexedDB)를 열 수 없어 사진이 이번 화면에만 보입니다. 사진을 남기려면 상단 [사진 백업]으로 보관해 주세요.'; st.classList.add('on'); }
      }
      refreshAfterEdit();
      if (S.view === 'jd') renderJd();
      else if (S.view === 'stats') { STATS = null; renderStats(); }
    });
  }
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
