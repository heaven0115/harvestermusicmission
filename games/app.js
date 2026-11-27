/* 교회 레크레이션 게임 · app.js
   정적 웹앱 · localStorage 저장 · 외부 라이브러리 없음 */
(function () {
  "use strict";

  var GAMES = window.CHURCH_GAMES || [];
  var LS = {
    scores: "churchGames.scores.v1",
    sound: "churchGames.sound.v1",
    custom: "churchGames.custom.v1",
    preset: "churchGames.preset.v1",
    presetByGame: "churchGames.timerByGame.v1"
  };
  var TEAMS = ["A", "B", "C", "D"];

  /* ---------------------------------------------------------------- helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function shuffleArr(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function read(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function syllableCount(s) {
    var m = String(s).match(/[\uac00-\ud7a3]/g);
    return m ? m.length : 0;
  }
  var toastTimer = null;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2000);
  }

  /* ---------------------------------------------------------------- sound */
  var Sound = (function () {
    var ctx = null;
    var on = read(LS.sound, true);
    function ac() {
      if (!ctx) {
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        ctx = new C();
      }
      if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
      return ctx;
    }
    function tone(freq, dur, type, gain, delay) {
      if (!on) return;
      var c = ac();
      if (!c) return;
      var t0 = c.currentTime + (delay || 0);
      var osc = c.createOscillator();
      var g = c.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.06, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(c.destination);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    }
    return {
      isOn: function () { return on; },
      set: function (v) { on = !!v; write(LS.sound, on); },
      toggle: function () { on = !on; write(LS.sound, on); if (on) tone(720, 0.07, "triangle", 0.05); return on; },
      click: function () { tone(640, 0.045, "triangle", 0.035); },
      pop: function () { tone(760, 0.07, "sine", 0.05); tone(1180, 0.08, "sine", 0.035, 0.05); },
      tick: function () { tone(1046, 0.045, "square", 0.025); },
      success: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, "sine", 0.07, i * 0.085); }); },
      fail: function () { tone(200, 0.22, "sawtooth", 0.045); tone(150, 0.3, "sawtooth", 0.04, 0.12); },
      buzz: function () { tone(170, 0.55, "sawtooth", 0.07); tone(120, 0.6, "sawtooth", 0.05, 0.05); }
    };
  })();

  /* ---------------------------------------------------------------- timer */
  var TIMER_MIN = 5;
  var TIMER_MAX = 600;
  function clampSec(sec) {
    var n = Math.round(Number(sec));
    if (!isFinite(n) || isNaN(n)) return 30;
    return Math.max(TIMER_MIN, Math.min(TIMER_MAX, n));
  }
  function secLabel(sec) {
    var s = Math.round(sec);
    if (s < 60) return s + "초";
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + "분" + (r ? " " + r + "초" : "");
  }
  function timerMap() {
    var m = read(LS.presetByGame, null);
    return (m && typeof m === "object") ? m : {};
  }
  var Timer = {
    duration: clampSec(read(LS.preset, 30)),
    remaining: clampSec(read(LS.preset, 30)),
    endAt: 0,
    running: false,
    handle: null,
    lastBeep: -1,
    gameId: null,
    custom: false,
    /* 화면의 숫자 입력칸·칩·게임 안 시작 버튼 글자를 지금 시간에 맞춥니다. */
    syncUI: function () {
      var chips = $$("#timerbar [data-sec]");
      var matched = false;
      chips.forEach(function (b) {
        var on = Number(b.dataset.sec) === Timer.duration;
        if (on) matched = true;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var input = $("#timer-input");
      if (input && document.activeElement !== input && input.value !== String(Timer.duration)) {
        input.value = String(Timer.duration);
      }
      var custom = $(".timer-custom");
      if (custom && !matched) custom.classList.add("is-on");
      else if (custom) custom.classList.remove("is-on");
      $$("[data-timer-label]").forEach(function (el) {
        el.textContent = "⏱ " + secLabel(Timer.duration) + " 시작";
      });
      /* 게임 화면 안의 시간 표시(줄줄이 말해요 배지·부제)도 함께 맞춥니다. */
      var g = state && state.game;
      if (g && VIEWS && VIEWS[g.id] && (g.id === "relay" || g.id === "charades")) {
        var it = state.items[state.idx];
        var subEl = $("#stage-sub");
        if (subEl && it) subEl.textContent = VIEWS[g.id].sub(it);
        var badge = $("#relay-sec");
        if (badge) badge.textContent = secLabel(Timer.duration) + " 안에";
      }
    },
    /* 시간만 바꿉니다. 돌아가는 중이면 남은 시간은 그대로 둡니다. */
    apply: function (sec, remember) {
      this.duration = clampSec(sec);
      if (!this.running) this.remaining = this.duration;
      if (remember !== false && this.gameId) {
        var map = timerMap();
        map[this.gameId] = this.duration;
        write(LS.presetByGame, map);
        this.custom = true;
      }
      write(LS.preset, this.duration);
      this.syncUI();
      this.paint();
    },
    set: function (sec, remember) {
      this.running = false;
      this.stopLoop();
      this.apply(sec, remember);
      this.remaining = this.duration;
      this.lastBeep = -1;
      this.paint();
    },
    nudge: function (delta) {
      this.set(this.duration + delta);
    },
    /* 게임을 열 때: 그 게임에서 마지막에 고른 시간이 있으면 그대로 씁니다. */
    loadForGame: function (gameId, fallbackSec) {
      this.gameId = gameId || null;
      var map = timerMap();
      var saved = (gameId && typeof map[gameId] === "number") ? map[gameId] : null;
      this.custom = saved !== null;
      this.set(saved === null ? fallbackSec : saved, false);
    },
    reset: function () {
      this.running = false;
      this.stopLoop();
      this.remaining = this.duration;
      this.lastBeep = -1;
      this.paint();
    },
    start: function () {
      if (this.running) return;
      if (this.remaining <= 0.05) this.remaining = this.duration;
      this.endAt = Date.now() + this.remaining * 1000;
      this.running = true;
      this.lastBeep = -1;
      var self = this;
      this.stopLoop();
      this.handle = setInterval(function () { self.step(); }, 100);
      Sound.click();
      this.paint();
    },
    pause: function () {
      if (!this.running) return;
      this.remaining = Math.max(0, (this.endAt - Date.now()) / 1000);
      this.running = false;
      this.stopLoop();
      this.paint();
    },
    toggle: function () { this.running ? this.pause() : this.start(); },
    stopLoop: function () { if (this.handle) { clearInterval(this.handle); this.handle = null; } },
    step: function () {
      var left = (this.endAt - Date.now()) / 1000;
      if (left <= 0) {
        this.remaining = 0;
        this.running = false;
        this.stopLoop();
        this.paint();
        Sound.buzz();
        toast("⏰ 시간 종료!");
        return;
      }
      this.remaining = left;
      var s = Math.ceil(left);
      if (s <= 3 && s !== this.lastBeep) { this.lastBeep = s; Sound.tick(); }
      this.paint();
    },
    paint: function () {
      var bar = $("#timerbar");
      if (!bar) return;
      var left = Math.max(0, this.remaining);
      var mm = Math.floor(left / 60);
      var ss = Math.floor(left % 60);
      $("#timer-time").textContent = pad(mm) + ":" + pad(ss);
      var pct = this.duration > 0 ? Math.max(0, Math.min(100, (left / this.duration) * 100)) : 0;
      $("#timer-fill").style.width = pct + "%";
      bar.classList.toggle("is-running", this.running);
      bar.classList.toggle("is-low", left <= 5.4 && left > 0);
      $("#timer-toggle").textContent = this.running ? "❚❚ 멈춤" : "▶ 시작";
      $$("#timerbar [data-sec]").forEach(function (b) {
        b.classList.toggle("is-on", Number(b.dataset.sec) === Timer.duration);
      });
    }
  };

  /* ---------------------------------------------------------------- state */
  var state = {
    game: null,
    items: [],
    idx: 0,
    revealed: false,
    extra: {},
    scores: read(LS.scores, { A: 0, B: 0, C: 0, D: 0 }),
    custom: read(LS.custom, {})
  };
  TEAMS.forEach(function (t) { if (typeof state.scores[t] !== "number") state.scores[t] = 0; });

  function currentGame() { return state.game; }
  function totalItems() { return GAMES.reduce(function (n, g) { return n + g.items.length; }, 0); }
  function itemsFor(game) {
    var custom = state.custom && state.custom[game.id];
    if (Array.isArray(custom) && custom.length) return custom.slice();
    return game.items.slice();
  }
  function isCustom(game) {
    var c = state.custom && state.custom[game.id];
    return Array.isArray(c) && c.length > 0;
  }

  /* ---------------------------------------------------------------- home */
  function cardHTML(g, i) {
    return '<a class="game-card tone-' + g.tone + '" href="#/g/' + g.id + '" aria-label="' + esc(g.title) + ', ' + g.items.length + '문제">' +
      '<div class="gc-eyebrow"><span>GAME ' + pad(i + 1) + '</span><span class="gc-count">' + g.items.length + '문제</span></div>' +
      '<div class="gc-body">' +
        '<span class="gc-emoji" aria-hidden="true">' + g.emoji + '</span>' +
        '<h3>' + esc(g.title) + '</h3>' +
        '<p>' + esc(g.tagline) + '</p>' +
      '</div>' +
      '<span class="gc-arrow" aria-hidden="true">→</span>' +
    '</a>';
  }

  function openHome() {
    state.game = null;
    state.items = [];
    document.body.classList.add("has-panel");
    $("#btn-back").hidden = true;
    $("#btn-edit").hidden = true;
    $("#timerbar").hidden = true;
    $("#dock").hidden = true;
    $("#app-title").textContent = "교회 레크레이션 게임";
    $("#app-sub").textContent = GAMES.length + "가지 게임 · " + totalItems() + "문제";
    document.title = "교회 레크레이션 게임 · 9종";
    $("#view").className = "view";
    $("#view").innerHTML =
      '<section class="hero">' +
        '<span class="hero-kicker">교회 수련회 · 야유회 · 절기 행사</span>' +
        '<h1>말씀과 웃음이 함께하는<br><em>레크레이션 게임 9종</em></h1>' +
        '<p class="hero-sub">' + GAMES.length + '가지 게임 · ' + totalItems() + '문제 · 타이머 · 팀 점수판 · 정답 공개까지 한 화면에</p>' +
        '<div class="hero-tips">' +
          '<span><b>⛶ 전체화면</b> 프로젝터에 크게</span>' +
          '<span><b>⏱ 타이머</b> 원하는 시간으로</span>' +
          '<span><b>🏆 점수판</b> A~D팀 자동 저장</span>' +
        '</div>' +
      '</section>' +
      '<section class="grid">' + GAMES.map(cardHTML).join("") + '</section>' +
      '<section class="home-note">' +
        '<h3>이렇게 쓰세요</h3>' +
        '<ul>' +
          '<li>게임을 고르면 바로 시작됩니다. <b>→</b> 다음 문제, <b>←</b> 이전 문제, <b>정답 보기</b>로 답을 공개하세요.</li>' +
          '<li>프로젝터에서는 오른쪽 위 <b>⛶</b>로 전체화면을 켜면 글씨가 더 커집니다. (<b>F</b> 키)</li>' +
          '<li>타이머 시간은 위쪽 <b>15초·30초·60초·2분</b> 단추나 <b>−10초/+10초</b>, <b>초 칸에 직접 입력</b>해서 정합니다(5초~10분). 시간은 게임마다 기억됩니다. <b>▶ 시작</b> 또는 스페이스바로 시작/멈춤.</li>' +
          '<li><b>🏆 점수판</b>에서 팀별 점수를 더하고 빼면 이 기기에 자동 저장됩니다.</li>' +
          '<li><b>✎ 문제 편집</b>에서 우리 교회에 맞는 문제를 더하거나 고칠 수 있습니다. (이 브라우저에 저장)</li>' +
        '</ul>' +
      '</section>';
    closePanel();
    renderPanel();
    window.scrollTo({ top: 0 });
  }

  /* ---------------------------------------------------------------- game open */
  function openGame(id) {
    var game = null;
    for (var i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) game = GAMES[i];
    if (!game) { location.hash = "#/"; return; }
    state.game = game;
    state.items = itemsFor(game);
    state.idx = 0;
    state.revealed = false;
    state.extra = {};
    document.body.classList.add("has-panel");
    $("#btn-back").hidden = false;
    $("#btn-edit").hidden = false;
    $("#timerbar").hidden = false;
    $("#dock").hidden = false;
    $("#app-title").textContent = game.title;
    $("#app-sub").textContent = (isCustom(game) ? "내가 만든 문제 · " : "") + state.items.length + "문제";
    document.title = game.title + " · 교회 레크레이션";
    $("#view").className = "view view-game tone-" + game.tone;
    var relaySec = Number(state.items[0] && state.items[0].sec) || 15;
    Timer.loadForGame(game.id, game.id === "charades" ? 60 : (game.id === "relay" ? relaySec : 30));
    renderGame();
    renderPanel();
    window.scrollTo({ top: 0 });
  }

  /* ---------------------------------------------------------------- views */
  var VIEWS = {
    /* 1. 글자수 눈치게임 */
    shadow: {
      sub: function (item) { return item.cat + " · " + item.len + "글자"; },
      body: function (item) {
        var answers = state.revealed
          ? '<div class="answer-box"><h4>이런 답이 있어요</h4><div class="chips">' +
            item.answers.map(function (a) { return '<span class="chip answer">' + esc(a) + '</span>'; }).join("") +
            '</div></div>'
          : "";
        return '<div class="shadow">' +
            '<span class="badge badge-lg">' + esc(item.cat) + '</span>' +
            '<div class="big-num">' + item.len + '<small>글자</small></div>' +
            '<p class="lead">' + item.len + '글자 제시어를 말해 보세요. 이미 나온 말은 다시 쓸 수 없어요.</p>' +
          '</div>' + answers +
          '<div class="judge">' +
            '<input id="judge-input" type="text" placeholder="말한 낱말을 적으면 글자수를 세어 드려요" autocomplete="off" enterkeyhint="done" aria-label="말한 낱말">' +
            '<button class="btn btn-primary" id="judge-btn" type="button">글자수 확인</button>' +
            '<div class="judge-result" id="judge-result" aria-live="polite"></div>' +
          '</div>';
      },
      after: function (item) {
        var input = $("#judge-input");
        var out = $("#judge-result");
        var run = function () {
          var v = input.value.trim();
          if (!v) { input.focus(); return; }
          var n = syllableCount(v);
          if (n === 0) {
            out.className = "judge-result no";
            out.textContent = "한글로 적어 주세요.";
            return;
          }
          if (n === item.len) {
            out.className = "judge-result ok";
            out.textContent = "정답! " + n + "글자입니다. 👏";
            Sound.success();
          } else {
            out.className = "judge-result no";
            out.textContent = "아쉽습니다. " + n + "글자예요. (" + item.len + "글자가 필요해요)";
            Sound.fail();
          }
        };
        if ($("#judge-btn")) $("#judge-btn").addEventListener("click", run);
        if (input) {
          input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); run(); }
            e.stopPropagation();
          });
        }
      }
    },

    /* 2. 줄줄이 말해요 */
    relay: {
      sub: function (item) { return item.topic + " · " + secLabel(Timer.duration); },
      body: function (item) {
        var ex = state.extra;
        if (typeof ex.relayCount !== "number") ex.relayCount = 0;
        var answers = state.revealed
          ? '<div class="answer-box"><h4>이런 답이 있어요</h4><div class="chips">' +
            item.hint.split(",").map(function (a) { return '<span class="chip answer">' + esc(a.trim()) + '</span>'; }).join("") +
            '</div></div>'
          : "";
        return '<span class="badge badge-lg" id="relay-sec">' + esc(secLabel(Timer.duration)) + ' 안에</span>' +
          '<div class="giant-prompt">' + esc(item.topic) + '</div>' +
          '<p class="lead">팀원이 돌아가며 하나씩! 막히면 거기서 끝납니다.</p>' +
          '<div class="counter">' +
            '<button type="button" data-act="cnt-minus" aria-label="개수 줄이기">−</button>' +
            '<div><b id="relay-count">' + ex.relayCount + '</b><span>개</span></div>' +
            '<button type="button" data-act="cnt-plus" aria-label="개수 늘리기">+</button>' +
          '</div>' +
          '<div class="charade-actions"><button class="btn btn-primary btn-lg" type="button" data-act="start-timer" data-timer-label>⏱ ' + secLabel(Timer.duration) + ' 시작</button></div>' +
          answers;
      }
    },

    /* 3. 이어 말하기 */
    chain: {
      sub: function (item) { return item.kind + (item.ref ? " · " + item.ref : ""); },
      body: function (item) {
        var kindClass = item.kind === "성경" ? "성경 구절" : item.kind;
        return '<span class="badge badge-lg">' + esc(kindClass) + '</span>' +
          '<div class="giant-prompt">' + esc(item.prompt) + '</div>' +
          '<p class="chain-arrow">↓ 이어서 말해 보세요</p>' +
          (state.revealed
            ? '<div class="answer-box"><h4>정답</h4><p class="answer-line">' + esc(item.answer) + '</p>' +
              (item.ref ? '<p class="ref">' + esc(item.ref) + ' (개역개정)</p>' : '') + '</div>'
            : '<p class="lead">앞말을 듣고 뒷말을 맞히는 게임입니다. 정답 보기(<b>R</b>)로 확인하세요.</p>');
      }
    },

    /* 4. 절대음감 */
    pitch: {
      sub: function (item) { return item.dir + " 읽기 · 한 글자만"; },
      body: function (item) {
        var chars = item.text.split("").map(function (c) {
          if (c === " ") return '<span class="pitch-ch space"> </span>';
          var isTarget = state.revealed && c === item.target;
          return '<span class="pitch-ch' + (isTarget ? " is-target" : "") + '">' + esc(c) + '</span>';
        }).join("");
        return '<span class="badge badge-lg">' + esc(item.dir) + ' 읽기</span>' +
          '<div class="pitch-line" aria-label="' + esc(item.text) + '">' + chars + '</div>' +
          (state.revealed
            ? '<div class="answer-box"><h4>바뀐 글자</h4><p class="answer-line">' + esc(item.target) + '</p>' +
              '<p class="ref">“' + esc(item.target) + '”만 ' + esc(item.dir) + ' 읽으면 됩니다.</p></div>'
            : '<p class="lead">문장을 읽되 <b>한 글자만</b> 음을 ' + esc(item.dir === "높게" ? "높여" : "낮춰") + ' 읽습니다. 듣는 사람은 어느 글자인지 맞힙니다.</p>');
      }
    },

    /* 5. 텔레파시 */
    telepathy: {
      sub: function (item) { return "제시어 · 같은 답이면 성공"; },
      body: function (item) {
        return '<span class="badge badge-lg">제시어</span>' +
          '<div class="giant-word">' + esc(item.word) + '</div>' +
          '<p class="lead">팀원이 동시에 떠오르는 단어를 외치거나 같은 동작을 합니다. 답이 같으면 성공!</p>' +
          (state.revealed
            ? '<div class="answer-box"><h4>사람들이 자주 말하는 답</h4><div class="chips">' +
              item.hint.split(",").map(function (a) { return '<span class="chip answer">' + esc(a.trim()) + '</span>'; }).join("") +
              '</div></div>'
            : "") +
          '<div class="award-row"><span>성공한 팀에 점수 주기</span>' +
            TEAMS.map(function (t) { return '<button type="button" data-act="award" data-team="' + t + '">' + t + '팀 +1</button>'; }).join("") +
          '</div>';
      }
    },

    /* 6. 몸으로 말해요 */
    charades: {
      sub: function (item) { return item.cat + " · " + secLabel(Timer.duration); },
      body: function (item) {
        var ex = state.extra;
        if (typeof ex.ok !== "number") ex.ok = 0;
        if (typeof ex.pass !== "number") ex.pass = 0;
        return '<span class="badge badge-lg">' + esc(item.cat) + '</span>' +
          '<div class="giant-word">' + esc(item.word) + '</div>' +
          (state.revealed ? '<p class="lead">힌트: ' + esc(item.tip) + '</p>' : '<p class="lead">한 사람이 몸짓으로 설명하고, 팀이 맞힙니다.</p>') +
          '<div class="round-tally">' +
            '<div><b id="ok-count">' + ex.ok + '</b><span>성공</span></div>' +
            '<div><b id="pass-count">' + ex.pass + '</b><span>패스</span></div>' +
          '</div>' +
          '<div class="charade-actions">' +
            '<button class="btn btn-ok btn-lg" type="button" data-act="ok">✅ 성공 (+1)</button>' +
            '<button class="btn btn-pass btn-lg" type="button" data-act="pass">⏭ 패스</button>' +
            '<button class="btn btn-primary btn-lg" type="button" data-act="start-timer" data-timer-label>⏱ ' + secLabel(Timer.duration) + ' 시작</button>' +
          '</div>';
      }
    },

    /* 7. 행동지령 퀴즈 */
    orders: {
      sub: function (item) { return "9글자 조합 · 숨은 지령"; },
      body: function (item) {
        var ex = state.extra;
        var answer = item.answer.replace(/\s/g, "");
        if (!Array.isArray(ex.pick)) ex.pick = [];
        var slots = answer.split("").map(function (ch, i) {
          var t = ex.pick[i];
          var filled = (typeof t === "number");
          return '<span class="slot' + (filled ? " filled" : "") + '">' +
            (filled ? esc(item.tiles[t]) : "") + '</span>';
        }).join("");
        var tiles = item.tiles.map(function (ch, i) {
          var used = ex.pick.indexOf(i) !== -1;
          return '<button class="tile' + (used ? " is-used" : "") + '" type="button" data-tile="' + i + '"' +
            (used ? ' disabled aria-disabled="true"' : "") + '>' + esc(ch) + '</button>';
        }).join("");
        return '<div class="orders">' +
          '<div class="orders-main">' +
            '<div class="orders-hint">💡 ' + (ex.showHint ? esc(item.hint) : "힌트가 필요하면 아래 <b>힌트</b> 버튼을 누르세요.") + '</div>' +
            '<div class="slots" aria-label="조합한 글자">' + slots + '</div>' +
            '<div class="orders-actions">' +
              '<button class="btn" type="button" data-act="undo">⌫ 한 글자</button>' +
              '<button class="btn" type="button" data-act="clear">↺ 다시</button>' +
              '<button class="btn" type="button" data-act="hint">💡 힌트</button>' +
              '<button class="btn btn-primary" type="button" data-act="check">확인</button>' +
            '</div>' +
            '<div class="orders-msg' + (ex.msgKind ? " " + ex.msgKind : "") + '" id="orders-msg" aria-live="polite">' + esc(ex.msg || "") + '</div>' +
            (state.revealed
              ? '<div class="answer-box"><h4>숨은 지령</h4><p class="answer-line">' + esc(item.answer) + '</p><p class="ref">' + esc(item.note) + '</p></div>'
              : "") +
          '</div>' +
          '<div class="orders-board"><div class="tiles">' + tiles + '</div></div>' +
        '</div>';
      },
      after: function () { /* delegation handles it */ }
    },

    /* 8. 스피드 문장완성 */
    speed: {
      sub: function (item) { return "세로줄 · " + item.rows.length + "줄"; },
      body: function (item) {
        var rows = item.rows.map(function (r) {
          var idx = r.w.indexOf(r.c);
          var word;
          if (idx < 0) {
            word = esc(r.w);
          } else {
            word = esc(r.w.slice(0, idx)) +
              '<span class="br">(</span><span class="hl">' + esc(r.c) + '</span><span class="br">)</span>' +
              esc(r.w.slice(idx + 1));
          }
          return '<div class="speed-row">' +
              '<span class="speed-word">' + word + '</span>' +
              '<span class="speed-mark' + (state.revealed ? " on" : "") + '">' + (state.revealed ? esc(r.c) : "?") + '</span>' +
            '</div>';
        }).join("");
        return '<div class="speed">' + rows + '</div>' +
          (state.revealed
            ? '<div class="speed-answer"><p class="lead">세로줄을 읽으면</p><p class="answer-line">' + esc(item.answer) + '</p><p class="ref">' + esc(item.ref) + '</p></div>'
            : '<p class="lead">괄호 안 글자를 위에서 아래로 이어 읽으면 한 문장이 됩니다. 가장 먼저 외치는 팀이 승리!</p>');
      }
    },

    /* 9. 성경 빈칸 퀴즈 */
    blank: {
      sub: function (item) { return item.ref + " · 빈칸 " + item.answers.length + "개"; },
      body: function (item) {
        var ex = state.extra;
        if (!Array.isArray(ex.picks) || ex.picks.length !== item.answers.length) {
          ex.picks = item.answers.map(function () { return null; });
          ex.bankOn = ex.bankOn || false;
          ex.checked = false;
        }
        var parts = item.verse.split("{}");
        var html = "";
        parts.forEach(function (p, i) {
          html += esc(p);
          if (i < item.answers.length) {
            var bi = ex.picks[i];
            var w = (bi === null || bi === undefined) ? "" : item.bank[bi];
            var cls = "blank";
            if (!w) cls += " empty";
            if (state.revealed) {
              w = item.answers[i];
              cls += " ok";
            } else if (ex.checked && w) {
              cls += (w === item.answers[i] ? " ok" : " no");
            }
            html += '<span class="' + cls + '" data-blank="' + i + '" role="button" tabindex="0" aria-label="빈칸 ' + (i + 1) + '">' +
              (w ? esc(w) : "&nbsp;") + '</span>';
          }
        });
        var bank = ex.bankOn
          ? '<div class="bank">' + item.bank.map(function (w, i) {
              var used = ex.picks.indexOf(i) !== -1;
              return '<button type="button" data-word="' + i + '"' + (used ? ' class="used" disabled' : '') + '>' + esc(w) + '</button>';
            }).join("") + '</div>'
          : '<p class="lead">기억나는 대로 말해 보세요. 단어가 필요하면 <b>보기</b>를 누르세요.</p>';
        return '<div class="blank-head"><span class="badge badge-lg">' + esc(item.ref) + '</span><span class="blank-tag">개역개정</span></div>' +
          '<p class="verse">' + html + '</p>' +
          bank +
          '<div class="blank-actions">' +
            '<button class="btn" type="button" data-act="bank-toggle">' + (ex.bankOn ? "보기 숨기기" : "보기") + '</button>' +
            '<button class="btn" type="button" data-act="blank-reset">↺ 다시</button>' +
            '<button class="btn btn-primary" type="button" data-act="blank-check">확인</button>' +
          '</div>' +
          '<div class="blank-msg' + (ex.msgKind ? " " + ex.msgKind : "") + '" id="blank-msg" aria-live="polite">' + esc(ex.msg || "") + '</div>';
      }
    }
  };

  /* ---------------------------------------------------------------- render */
  function renderGame() {
    var game = state.game;
    if (!game) return;
    var view = VIEWS[game.id];
    if (!state.items.length) {
      $("#view").innerHTML = '<p class="lead">문제가 없습니다. <b>✎ 문제 편집</b>에서 문제를 추가해 주세요.</p>';
      return;
    }
    if (state.idx >= state.items.length) state.idx = 0;
    if (state.idx < 0) state.idx = state.items.length - 1;
    var item = state.items[state.idx];
    $("#view").innerHTML =
      '<div class="stage-wrap">' +
        '<section class="stage tone-' + game.tone + '">' +
          '<header class="stage-head">' +
            '<span class="stage-emoji" aria-hidden="true">' + game.emoji + '</span>' +
            '<div class="stage-titles"><h2>' + esc(game.title) + '</h2><p id="stage-sub">' + esc(view.sub(item)) + '</p></div>' +
            '<span class="stage-count">' + (state.idx + 1) + ' / ' + state.items.length + '</span>' +
          '</header>' +
          '<div class="stage-body">' + view.body(item) + '</div>' +
        '</section>' +
        '<p class="stage-howto">' + esc(game.howto) + '</p>' +
      '</div>';
    if (view.after) view.after(item);
    renderDock();
  }

  function renderDock() {
    var revealLabel = state.revealed ? "정답 숨기기" : "정답 보기";
    $("#dock-inner").innerHTML =
      '<div class="dock-nav">' +
        '<button class="ibtn" type="button" data-act="prev" title="이전 문제 (←)" aria-label="이전 문제">←</button>' +
        '<button class="ibtn" type="button" data-act="next" title="다음 문제 (→)" aria-label="다음 문제">→</button>' +
        '<button class="ibtn" type="button" data-act="shuffle" title="순서 섞기 (S)" aria-label="순서 섞기">🔀</button>' +
      '</div>' +
      '<button class="btn btn-reveal dock-reveal" type="button" data-act="reveal">' + revealLabel + '<kbd>R</kbd></button>' +
      '<button class="dock-score" type="button" data-act="panel" title="점수판 열기" aria-label="점수판 열기">' +
        TEAMS.map(function (t) { return '<span><i>' + t + '</i><b>' + state.scores[t] + '</b></span>'; }).join("") +
      '</button>';
  }

  /* 줄줄이 말해요처럼 문제마다 권장 시간이 다른 게임은,
     사용자가 직접 시간을 고르지 않았을 때만 문제의 시간을 따라갑니다.
     새 문제로 넘어가면 타이머는 정해 둔 시간으로 되돌립니다(돌아가는 중이면 그대로). */
  function syncItemTimer() {
    if (!state.game) return;
    if (state.game.id === "relay" && !Timer.custom) {
      var it = state.items[state.idx];
      Timer.apply(Number(it && it.sec) || 15, false);
    }
    if (!Timer.running) Timer.reset();
  }

  function next() {
    if (!state.game) return;
    state.revealed = false;
    state.extra = {};
    state.idx = state.idx + 1;
    if (state.idx >= state.items.length) { state.idx = 0; toast("마지막 문제였습니다. 처음으로 돌아갑니다."); }
    syncItemTimer();
    Sound.click();
    renderGame();
  }
  function prev() {
    if (!state.game) return;
    state.revealed = false;
    state.extra = {};
    state.idx = state.idx - 1;
    if (state.idx < 0) { state.idx = state.items.length - 1; toast("마지막 문제로 이동했습니다."); }
    syncItemTimer();
    Sound.click();
    renderGame();
  }
  function shuffleItems() {
    if (!state.game) return;
    shuffleArr(state.items);
    state.idx = 0;
    state.revealed = false;
    state.extra = {};
    syncItemTimer();
    Sound.pop();
    toast("문제 순서를 섞었습니다.");
    renderGame();
  }
  function toggleReveal() {
    if (!state.game) return;
    state.revealed = !state.revealed;
    Sound.pop();
    renderGame();
  }
  function go(delta) { delta > 0 ? next() : prev(); }

  /* ---------------------------------------------------------------- panel */
  function renderPanel() {
    var panel = $("#panel");
    panel.innerHTML =
      '<div class="panel-inner">' +
        '<div class="panel-head"><h3>🏆 팀 점수판</h3>' +
          '<button class="btn" type="button" data-act="score-reset" style="padding:6px 12px;font-size:.78rem">초기화</button>' +
          '<button class="ibtn panel-close" type="button" data-act="panel-close" aria-label="점수판 닫기">✕</button>' +
        '</div>' +
        '<div class="teams">' +
          TEAMS.map(function (t) {
            return '<div class="team" data-team="' + t + '">' +
              '<span class="team-dot" aria-hidden="true"></span>' +
              '<span class="team-name">' + t + '팀</span>' +
              '<button class="step" type="button" data-act="score-minus" data-team="' + t + '" aria-label="' + t + '팀 1점 빼기">−</button>' +
              '<span class="team-score" aria-live="polite">' + state.scores[t] + '</span>' +
              '<button class="step plus" type="button" data-act="score-plus" data-team="' + t + '" aria-label="' + t + '팀 1점 더하기">+</button>' +
            '</div>';
          }).join("") +
        '</div>' +
        '<div class="panel-foot">' +
          '<p>점수는 이 기기에 자동 저장됩니다. 다음에 열어도 그대로 남아 있어요.</p>' +
          '<div class="keys">' +
            '<div><kbd>Space</kbd><span>타이머 시작 / 멈춤</span></div>' +
            '<div><kbd>←</kbd><kbd>→</kbd><span>이전 / 다음 문제</span></div>' +
            '<div><kbd>R</kbd><span>정답 보기</span></div>' +
            '<div><kbd>S</kbd><span>문제 섞기</span></div>' +
            '<div><kbd>F</kbd><span>전체화면</span></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  function openPanel() {
    $("#panel").classList.add("is-open");
    $("#scrim").hidden = false;
    document.body.classList.add("panel-open");
  }
  function closePanel() {
    $("#panel").classList.remove("is-open");
    $("#scrim").hidden = true;
    document.body.classList.remove("panel-open");
  }
  function addScore(team, delta) {
    if (TEAMS.indexOf(team) === -1) return;
    state.scores[team] = Math.max(0, (state.scores[team] || 0) + delta);
    write(LS.scores, state.scores);
    renderPanel();
    renderDock();
    delta > 0 ? Sound.pop() : Sound.click();
  }

  /* ---------------------------------------------------------------- actions */
  function onAction(act, el) {
    var game = state.game;
    if (!game && act !== "panel" && act !== "panel-close" && act !== "score-plus" && act !== "score-minus" && act !== "score-reset") return;
    var item = state.items[state.idx];
    switch (act) {
      case "prev": prev(); return;
      case "next": next(); return;
      case "shuffle": shuffleItems(); return;
      case "reveal": toggleReveal(); return;
      case "panel": openPanel(); return;
      case "panel-close": closePanel(); return;
      case "score-plus": addScore(el.dataset.team, 1); return;
      case "score-minus": addScore(el.dataset.team, -1); return;
      case "score-reset":
        TEAMS.forEach(function (t) { state.scores[t] = 0; });
        write(LS.scores, state.scores);
        renderPanel(); renderDock();
        toast("점수를 모두 0으로 되돌렸습니다.");
        Sound.click();
        return;
      case "award":
        addScore(el.dataset.team, 1);
        toast(el.dataset.team + "팀 +1점!");
        return;
      case "start-timer":
        if (el.dataset.sec) Timer.set(Number(el.dataset.sec));
        else Timer.reset();
        Timer.start();
        return;
      case "cnt-plus":
        state.extra.relayCount = (state.extra.relayCount || 0) + 1;
        Sound.pop();
        renderGame();
        return;
      case "cnt-minus":
        state.extra.relayCount = Math.max(0, (state.extra.relayCount || 0) - 1);
        Sound.click();
        renderGame();
        return;
      case "ok":
        state.extra.ok = (state.extra.ok || 0) + 1;
        Sound.success();
        toast("성공! 다음 단어로 넘어갑니다.");
        state.revealed = false;
        state.idx = (state.idx + 1) % state.items.length;
        renderGame();
        return;
      case "pass":
        state.extra.pass = (state.extra.pass || 0) + 1;
        Sound.click();
        state.revealed = false;
        state.idx = (state.idx + 1) % state.items.length;
        renderGame();
        return;
      case "hint":
        state.extra.showHint = true;
        Sound.click();
        renderGame();
        return;
      case "undo":
        if (Array.isArray(state.extra.pick) && state.extra.pick.length) state.extra.pick.pop();
        state.extra.msg = "";
        state.extra.msgKind = "";
        Sound.click();
        renderGame();
        return;
      case "clear":
        state.extra.pick = [];
        state.extra.msg = "";
        state.extra.msgKind = "";
        Sound.click();
        renderGame();
        return;
      case "check": checkOrders(item); return;
      case "bank-toggle":
        state.extra.bankOn = !state.extra.bankOn;
        Sound.click();
        renderGame();
        return;
      case "blank-reset":
        state.extra.picks = item.answers.map(function () { return null; });
        state.extra.checked = false;
        state.extra.msg = "";
        state.extra.msgKind = "";
        Sound.click();
        renderGame();
        return;
      case "blank-check": checkBlank(item); return;
      default: return;
    }
  }

  function checkOrders(item) {
    var ex = state.extra;
    var answer = item.answer.replace(/\s/g, "");
    var picked = (ex.pick || []).map(function (i) { return item.tiles[i]; }).join("");
    if (picked.length < answer.length) {
      ex.msg = "글자를 더 골라 보세요. (" + picked.length + "/" + answer.length + ")";
      ex.msgKind = "no";
      Sound.fail();
      renderGame();
      return;
    }
    if (picked === answer) {
      ex.msg = "정답입니다! 🎉 " + item.answer;
      ex.msgKind = "ok";
      Sound.success();
      renderGame();
    } else {
      ex.msg = "아쉽습니다. 다시 조합해 보세요.";
      ex.msgKind = "no";
      Sound.fail();
      renderGame();
      var slots = $(".slots");
      if (slots) {
        slots.classList.add("shake");
        setTimeout(function () { slots.classList.remove("shake"); }, 360);
      }
    }
  }

  function checkBlank(item) {
    var ex = state.extra;
    var picks = ex.picks || [];
    var filled = picks.filter(function (p) { return p !== null && p !== undefined; }).length;
    if (filled < item.answers.length) {
      ex.msg = "빈칸 " + (item.answers.length - filled) + "개가 남았습니다.";
      ex.msgKind = "no";
      Sound.fail();
      renderGame();
      return;
    }
    var correct = picks.every(function (bi, i) { return item.bank[bi] === item.answers[i]; });
    ex.checked = true;
    if (correct) {
      ex.msg = "모두 정답입니다! 🎉";
      ex.msgKind = "ok";
      Sound.success();
    } else {
      ex.msg = "빨간 빈칸을 다시 확인해 보세요.";
      ex.msgKind = "no";
      Sound.fail();
    }
    renderGame();
  }

  /* ---------------------------------------------------------------- editor */
  var VALIDATORS = {
    shadow: function (it) {
      return typeof it.cat === "string" && it.cat.length > 0 &&
        Number(it.len) > 0 &&
        Array.isArray(it.answers) && it.answers.length > 0 &&
        it.answers.every(function (a) {
          return typeof a === "string" && syllableCount(a) === Number(it.len);
        }) ? "" : "각 답의 글자수가 len과 같아야 합니다. (예: len 2 → 모세, 다윗)";
    },
    relay: function (it) {
      return typeof it.topic === "string" && it.topic.length > 0 && Number(it.sec) > 0 && typeof it.hint === "string"
        ? "" : "topic, sec(초), hint(쉼표로 구분한 예시)가 필요합니다.";
    },
    chain: function (it) {
      return typeof it.prompt === "string" && it.prompt.length > 0 && typeof it.answer === "string" && it.answer.length > 0
        ? "" : "prompt(앞말)와 answer(뒷말)가 필요합니다.";
    },
    pitch: function (it) {
      return typeof it.text === "string" && typeof it.target === "string" && it.target.length === 1 && it.text.indexOf(it.target) !== -1
        ? "" : "text 안에 target 글자가 들어 있어야 합니다. dir은 '높게' 또는 '낮게'.";
    },
    telepathy: function (it) {
      return typeof it.word === "string" && it.word.length > 0 && typeof it.hint === "string"
        ? "" : "word(제시어)와 hint(쉼표로 구분한 예시 답)가 필요합니다.";
    },
    charades: function (it) {
      return typeof it.word === "string" && it.word.length > 0 && typeof it.cat === "string"
        ? "" : "word(제시어)와 cat(분류)가 필요합니다.";
    },
    orders: function (it) {
      var ok = typeof it.answer === "string" && it.answer.length > 0 &&
        Array.isArray(it.tiles) && it.tiles.length === 9 &&
        it.tiles.every(function (t) { return typeof t === "string" && t.length === 1; }) &&
        typeof it.hint === "string";
      if (!ok) return "answer, hint, 그리고 한 글자씩 담은 tiles 9개가 필요합니다.";
      var need = it.answer.replace(/\s/g, "").split("");
      var pool = it.tiles.slice();
      for (var i = 0; i < need.length; i++) {
        var k = pool.indexOf(need[i]);
        if (k === -1) return "tiles에 정답 글자가 모두 들어 있어야 합니다.";
        pool.splice(k, 1);
      }
      return "";
    },
    speed: function (it) {
      var ok = typeof it.answer === "string" && Array.isArray(it.rows) && it.rows.length > 0 &&
        it.rows.every(function (r) { return r && typeof r.w === "string" && typeof r.c === "string" && r.w.indexOf(r.c) !== -1; });
      if (!ok) return "rows의 각 단어(w)에 글자(c)가 들어 있어야 합니다.";
      var joined = it.rows.map(function (r) { return r.c; }).join("").replace(/\s/g, "");
      return joined === it.answer.replace(/\s/g, "") ? "" : "rows의 글자를 이어 붙이면 answer와 같아야 합니다.";
    },
    blank: function (it) {
      var bl = typeof it.verse === "string" ? (it.verse.match(/\{\}/g) || []).length : 0;
      if (typeof it.ref !== "string" || !it.ref) return "ref(장절)가 필요합니다.";
      if (!Array.isArray(it.answers) || bl !== it.answers.length) return "verse의 {} 개수와 answers 개수가 같아야 합니다.";
      if (!Array.isArray(it.bank) || it.bank.length < it.answers.length) return "bank(보기 단어)가 answers보다 적습니다.";
      return "";
    }
  };

  function openEditor() {
    var game = state.game;
    if (!game) return;
    var custom = isCustom(game);
    var current = custom ? state.custom[game.id] : game.items;
    var sample = JSON.parse(JSON.stringify(game.items[0]));
    var hintText = {
      shadow: "cat(분류), len(글자수), answers(정답 배열)",
      relay: "topic(주제), sec(제한 시간), hint(예시 답, 쉼표 구분)",
      chain: "kind(속담/성경), prompt(앞말), answer(뒷말), ref(참고 장절)",
      pitch: "text(문장), target(바꿀 한 글자), dir(\"높게\" 또는 \"낮게\")",
      telepathy: "word(제시어), hint(예시 답, 쉼표 구분)",
      charades: "cat(분류), word(제시어), tip(힌트)",
      orders: "answer(지령), hint(힌트), note(설명), tiles(글자 9개)",
      speed: "answer(문장), ref(장절), rows[{c:글자, w:단어}]",
      blank: "ref(장절), verse({}로 빈칸), answers([]), bank(보기 단어[])"
    }[game.id];
    var modal = $("#modal");
    modal.hidden = false;
    modal.innerHTML =
      '<div class="modal-card" role="dialog" aria-modal="true" aria-label="문제 편집">' +
        '<div class="modal-head"><h3>✎ ' + esc(game.title) + ' 문제 편집</h3>' +
          '<button class="ibtn" type="button" data-act="modal-close" aria-label="닫기">✕</button></div>' +
        '<div class="modal-body">' +
          '<p>지금 <b>' + current.length + '문제</b>' + (custom ? " (내가 만든 문제)" : " (기본 문제)") + '입니다. 형식: <code>' + esc(hintText) + '</code></p>' +
          '<p>아래 목록을 고쳐 저장하면 이 브라우저에 저장되고, 바로 게임에 쓰입니다. 기본 문제로 되돌릴 수도 있습니다.</p>' +
          '<textarea class="editor" id="editor-json" spellcheck="false">' + esc(JSON.stringify(current, null, 2)) + '</textarea>' +
          '<div class="modal-msg" id="editor-msg" aria-live="polite"></div>' +
        '</div>' +
        '<div class="modal-foot">' +
          '<button class="btn" type="button" data-act="editor-sample">＋ 예시 한 문제 추가</button>' +
          '<span class="spacer"></span>' +
          '<button class="btn" type="button" data-act="editor-restore">기본 문제로 되돌리기</button>' +
          '<button class="btn btn-primary" type="button" data-act="editor-save">저장</button>' +
        '</div>' +
      '</div>';
    var ta = $("#editor-json");
    modal.querySelector('[data-act="editor-sample"]').addEventListener("click", function () {
      try {
        var arr = JSON.parse(ta.value);
        if (!Array.isArray(arr)) throw new Error("배열이 아닙니다");
        arr.push(sample);
        ta.value = JSON.stringify(arr, null, 2);
        setEditorMsg("예시 문제를 목록 끝에 넣었습니다. 내용을 고쳐 저장하세요.", true);
      } catch (e) {
        setEditorMsg("목록을 읽지 못했습니다: " + e.message, false);
      }
    });
    modal.querySelector('[data-act="editor-save"]').addEventListener("click", function () { saveEditor(ta); });
    modal.querySelector('[data-act="editor-restore"]').addEventListener("click", function () {
      delete state.custom[game.id];
      write(LS.custom, state.custom);
      state.items = game.items.slice();
      state.idx = 0;
      state.revealed = false;
      state.extra = {};
      closeModal();
      renderGame();
      toast("기본 문제로 되돌렸습니다.");
    });
    ta.focus();
  }

  function setEditorMsg(msg, ok) {
    var el = $("#editor-msg");
    if (!el) return;
    el.textContent = msg;
    el.className = "modal-msg" + (ok ? " ok" : "");
  }

  function saveEditor(ta) {
    var game = state.game;
    if (!game) return;
    var arr;
    try {
      arr = JSON.parse(ta.value);
    } catch (e) {
      setEditorMsg("JSON 형식이 아닙니다: " + e.message, false);
      return;
    }
    if (!Array.isArray(arr) || !arr.length) {
      setEditorMsg("문제가 하나 이상 있는 배열이어야 합니다.", false);
      return;
    }
    var validate = VALIDATORS[game.id];
    for (var i = 0; i < arr.length; i++) {
      var msg = validate ? validate(arr[i]) : "";
      if (msg) {
        setEditorMsg((i + 1) + "번째 문제: " + msg, false);
        return;
      }
    }
    state.custom[game.id] = arr;
    write(LS.custom, state.custom);
    state.items = arr.slice();
    state.idx = 0;
    state.revealed = false;
    state.extra = {};
    closeModal();
    $("#app-sub").textContent = "내가 만든 문제 · " + state.items.length + "문제";
    renderGame();
    toast(state.items.length + "문제를 저장했습니다.");
    Sound.success();
  }

  function closeModal() {
    var modal = $("#modal");
    modal.hidden = true;
    modal.innerHTML = "";
  }

  /* ---------------------------------------------------------------- fullscreen */
  function toggleFs() {
    var el = document.documentElement;
    var isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFs) {
      var req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) {
        var p = req.call(el);
        if (p && p.catch) p.catch(function () { fakeFs(true); });
      } else {
        fakeFs(true);
        toast("화면을 가로로 돌리면 더 크게 보입니다.");
      }
    } else {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
    }
  }
  function fakeFs(on) {
    document.body.classList.toggle("is-fs", on);
    $("#btn-fs").textContent = on ? "⤡" : "⛶";
    if (on) toast("전체화면 느낌으로 크게 보기 (Esc로 해제)");
  }

  /* ---------------------------------------------------------------- events */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-act]") : null;
    if (el) {
      var act = el.dataset.act;
      if (act === "modal-close") { closeModal(); return; }
      if (act.indexOf("editor-") === 0) return;
      onAction(act, el);
      return;
    }
    var tile = e.target.closest ? e.target.closest("[data-tile]") : null;
    if (tile) {
      var game = state.game;
      if (!game || game.id !== "orders") return;
      var item = state.items[state.idx];
      var idx = Number(tile.dataset.tile);
      var answerLen = item.answer.replace(/\s/g, "").length;
      state.extra.pick = state.extra.pick || [];
      if (state.extra.pick.indexOf(idx) === -1 && state.extra.pick.length < answerLen) {
        state.extra.pick.push(idx);
        state.extra.msg = "";
        state.extra.msgKind = "";
        Sound.pop();
        renderGame();
      }
      return;
    }
    var word = e.target.closest ? e.target.closest("[data-word]") : null;
    if (word) {
      var g2 = state.game;
      if (!g2 || g2.id !== "blank") return;
      var it2 = state.items[state.idx];
      var bi = Number(word.dataset.word);
      var picks = state.extra.picks || [];
      if (picks.indexOf(bi) !== -1) return;
      var slot = picks.indexOf(null);
      if (slot === -1) { toast("빈칸이 모두 찼습니다. 하나를 눌러 지우세요."); return; }
      picks[slot] = bi;
      state.extra.picks = picks;
      state.extra.checked = false;
      state.extra.msg = "";
      Sound.pop();
      renderGame();
      return;
    }
    var blank = e.target.closest ? e.target.closest("[data-blank]") : null;
    if (blank) {
      var g3 = state.game;
      if (!g3 || g3.id !== "blank") return;
      var i3 = Number(blank.dataset.blank);
      if (state.extra.picks) {
        state.extra.picks[i3] = null;
        state.extra.checked = false;
        state.extra.msg = "";
        Sound.click();
        renderGame();
      }
      return;
    }
  });

  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === " ") { e.preventDefault(); if (state.game) Timer.toggle(); }
    else if (e.key === "ArrowRight") { if (state.game) { e.preventDefault(); next(); } }
    else if (e.key === "ArrowLeft") { if (state.game) { e.preventDefault(); prev(); } }
    else if (e.key === "r" || e.key === "R") { if (state.game) toggleReveal(); }
    else if (e.key === "s" || e.key === "S") { if (state.game) shuffleItems(); }
    else if (e.key === "f" || e.key === "F") { toggleFs(); }
    else if (e.key === "Escape") {
      if (!$("#modal").hidden) closeModal();
      else if (document.body.classList.contains("is-fs")) fakeFs(false);
      else closePanel();
    }
  });

  $("#timer-toggle").addEventListener("click", function () { if (state.game) Timer.toggle(); });
  $("#timer-reset").addEventListener("click", function () { Timer.reset(); Sound.click(); });
  $$("#timerbar [data-sec]").forEach(function (b) {
    b.addEventListener("click", function () { Timer.set(Number(b.dataset.sec)); Sound.click(); });
  });
  $$("#timerbar [data-step]").forEach(function (b) {
    b.addEventListener("click", function () { Timer.nudge(Number(b.dataset.step)); Sound.click(); });
  });

  /* 시간 직접 입력: 엔터·입력칸 밖 누름·값 변경 시 바로 적용 (5~600초) */
  var timerInput = $("#timer-input");
  function commitTimerInput() {
    if (!timerInput) return;
    var digits = String(timerInput.value).replace(/[^0-9]/g, "");
    var v = digits ? parseInt(digits, 10) : NaN;
    if (!digits || !isFinite(v)) { Timer.syncUI(); return; }
    var target = clampSec(v);
    if (target !== v) {
      toast("타이머는 " + TIMER_MIN + "초부터 " + TIMER_MAX + "초(10분)까지입니다.");
    }
    if (target === Timer.duration) { Timer.syncUI(); return; }
    Timer.set(target);
    Sound.click();
  }
  if (timerInput) {
    timerInput.addEventListener("input", function () {
      this.value = String(this.value).replace(/[^0-9]/g, "").slice(0, 3);
    });
    timerInput.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (e.key === "Enter") { e.preventDefault(); commitTimerInput(); this.blur(); }
    });
    timerInput.addEventListener("change", commitTimerInput);
    timerInput.addEventListener("blur", commitTimerInput);
    timerInput.addEventListener("focus", function () { this.select(); });
  }
  $("#timer-clock").addEventListener("click", function () {
    if (!timerInput) return;
    timerInput.focus();
    timerInput.select();
  });
  $("#btn-back").addEventListener("click", function () { location.hash = "#/"; });
  $("#btn-sound").addEventListener("click", function () {
    var on = Sound.toggle();
    this.textContent = on ? "🔊" : "🔇";
    this.setAttribute("aria-pressed", on ? "true" : "false");
  });
  $("#btn-edit").addEventListener("click", openEditor);
  $("#btn-panel").addEventListener("click", function () {
    if ($("#panel").classList.contains("is-open")) closePanel(); else openPanel();
  });
  $("#btn-fs").addEventListener("click", toggleFs);
  $("#scrim").addEventListener("click", closePanel);
  document.addEventListener("fullscreenchange", function () {
    var on = !!document.fullscreenElement;
    document.body.classList.toggle("is-fs", on);
    $("#btn-fs").textContent = on ? "⤡" : "⛶";
  });

  /* ---------------------------------------------------------------- router */
  function route() {
    var h = location.hash || "#/";
    var m = h.match(/^#\/g\/([a-z]+)/);
    if (m) {
      openGame(m[1]);
    } else {
      openHome();
    }
  }

  function init() {
    document.body.classList.add("has-panel");
    if (!GAMES.length) {
      $("#view").innerHTML = '<p class="lead">게임 데이터를 불러오지 못했습니다. data.js를 확인해 주세요.</p>';
      return;
    }
    $("#btn-sound").textContent = Sound.isOn() ? "🔊" : "🔇";
    $("#btn-sound").setAttribute("aria-pressed", Sound.isOn() ? "true" : "false");
    Timer.paint();
    Timer.syncUI();
    renderPanel();
    window.addEventListener("hashchange", route);
    route();
  }

  init();
})();
