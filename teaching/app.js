'use strict';

/* =========================================================
   므두셀라 티칭 — app.js
   1) 자료 모델 · 샘플 · 저장소
   2) 프롬프트 · 응답 파싱 · API 호출
   3) 차트 · 화면 렌더링 · 이벤트
   ========================================================= */

const STORE_KEY = 'methuselah-teaching.v1';

/* ---------- 10가지 평가 항목 ---------- */
const ITEMS = [
  { key: 'context',   ko: '성경 문맥',     short: '문맥',     area: 'theology',  areaKo: '신학·말씀',
    aliases: ['성경 문맥', '문맥', 'context', 'biblical context', '성경적 문맥'] },
  { key: 'exegesis',  ko: '강해 충실도',   short: '강해',     area: 'theology',  areaKo: '신학·말씀',
    aliases: ['강해 충실도', '강해', 'exegesis', 'exegetical fidelity', '본문 충실도'] },
  { key: 'christ',    ko: '그리스도 중심', short: '그리스도', area: 'theology',  areaKo: '신학·말씀',
    aliases: ['그리스도 중심', '그리스도', 'christ', 'christ-centered', 'christ centered'] },
  { key: 'gospel',    ko: '복음과 은혜',   short: '복음',     area: 'theology',  areaKo: '신학·말씀',
    aliases: ['복음과 은혜', '복음', 'gospel', 'gospel and grace', '은혜'] },
  { key: 'doctrine',  ko: '교리 건전성',   short: '교리',     area: 'theology',  areaKo: '신학·말씀',
    aliases: ['교리 건전성', '교리', 'doctrine', 'doctrinal soundness'] },
  { key: 'logic',     ko: '논리 흐름',     short: '논리',     area: 'delivery',  areaKo: '전달·목회',
    aliases: ['논리 흐름', '논리', 'logic', 'logical flow', '구조'] },
  { key: 'empathy',   ko: '공감과 적용',   short: '공감',     area: 'delivery',  areaKo: '전달·목회',
    aliases: ['공감과 적용', '공감', '적용', 'empathy', 'application', 'empathy and application'] },
  { key: 'safety',    ko: '정서 안전',     short: '정서',     area: 'delivery',  areaKo: '전달·목회',
    aliases: ['정서 안전', '정서', 'safety', 'emotional safety'] },
  { key: 'authority', ko: '권위와 소통',   short: '권위',     area: 'delivery',  areaKo: '전달·목회',
    aliases: ['권위와 소통', '권위', 'authority', 'authority and communication', '소통'] },
  { key: 'language',  ko: '언어와 예화',   short: '언어',     area: 'delivery',  areaKo: '전달·목회',
    aliases: ['언어와 예화', '언어', '예화', 'language', 'language and illustration'] }
];

const ITEM_BY_KEY = {};
ITEMS.forEach(function (it) { ITEM_BY_KEY[it.key] = it; });

const FORMATS = {
  auto: {
    label: '자동 판별',
    intro: '설교 형식을 먼저 판별한 뒤, 그 형식의 기준으로 평가합니다.',
    criteria: [
      '본문의 구조와 설교의 구조가 어떻게 대응하는지 먼저 판별합니다.',
      '대지·원포인트·연속 강해·주제 설교 중 어느 형식인지 근거와 함께 밝힙니다.',
      '판별된 형식의 기준을 적용하되, 형식이 본문을 누르고 있지는 않은지 함께 봅니다.'
    ]
  },
  expository: {
    label: '대지 설교',
    intro: '본문에서 뽑아낸 두세 개의 대지가 병렬 구조를 이루는 설교입니다.',
    criteria: [
      '대지가 본문에서 나왔는가, 설교자의 아이디어에서 나왔는가.',
      '대지들이 서로 같은 층위에서 병렬을 이루는가.',
      '각 대지가 본문의 문맥을 벗어나지 않고 전개되는가.',
      '서론과 결론이 대지들을 하나의 메시지로 묶는가.'
    ]
  },
  onepoint: {
    label: '원포인트 설교',
    intro: '하나의 중심 명제가 설교 전체를 관통하는 설교입니다.',
    criteria: [
      '중심 명제가 한 문장으로 분명한가.',
      '모든 문단이 그 명제로 수렴하는가, 곁길로 새는가.',
      '명제가 본문에서 정당하게 도출되었는가.',
      '반복이 지루함이 아니라 기억을 돕는 방식으로 쓰였는가.'
    ]
  },
  series: {
    label: '연속 강해',
    intro: '한 성경 책을 절 단위로 이어 가며 강해하는 설교입니다.',
    criteria: [
      '이번 본문의 앞뒤 문맥이 설교에 드러나는가.',
      '절 단위의 관찰이 본문 순서를 존중하는가.',
      '이전 주 설교와 다음 주 본문으로 자연스럽게 이어지는가.',
      '한 절에 머물면서도 책 전체의 메시지와 연결되는가.'
    ]
  },
  topical: {
    label: '주제 설교',
    intro: '하나의 주제를 중심으로 여러 본문을 불러오는 설교입니다.',
    criteria: [
      '주제가 성경 전체의 흐름 안에 자리 잡고 있는가.',
      '인용한 각 본문의 문맥을 존중하는가(문맥을 찢어 인용하지 않았는가).',
      '본문들이 주제를 위해 짜깁기되지 않고 각자 제자리에 있는가.',
      '주제가 복음과 그리스도로 수렴하는가.'
    ]
  }
};

/* ---------- 작은 도구들 ---------- */
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function esc(value) {
  return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function uid(prefix) {
  return (prefix || 's') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayISO() {
  const d = new Date();
  const p = function (n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function fmtDate(iso) {
  if (!iso) return '날짜 없음';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso);
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return m[1] + '년 ' + Number(m[2]) + '월 ' + Number(m[3]) + '일 (' + WEEKDAYS[d.getDay()] + ')';
}

function shortDate(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? (Number(m[2]) + '.' + m[3]) : String(iso);
}

function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

function round1(n) { return Math.round(n * 10) / 10; }

function numberToScore(v) {
  let n = parseFloat(String(v).replace(/[^\d.\-]/g, ''));
  if (!isFinite(n)) return null;
  if (n > 10) {
    if (n <= 100) n = n / 10; else return null;
  }
  return clamp(Math.round(n * 10) / 10, 0, 10);
}

function totalOf(analysis) {
  if (!analysis || !analysis.scores) return 0;
  let sum = 0;
  ITEMS.forEach(function (it) { sum += Number(analysis.scores[it.key] || 0); });
  return Math.round(sum);
}

function areaAverage(analysis, area) {
  if (!analysis || !analysis.scores) return 0;
  const keys = ITEMS.filter(function (it) { return it.area === area; });
  if (!keys.length) return 0;
  let sum = 0;
  keys.forEach(function (it) { sum += Number(analysis.scores[it.key] || 0); });
  return round1(sum / keys.length);
}

function scoreClass(n) { return n < 6 ? 'low' : (n < 8 ? 'mid' : ''); }

function formatLabel(sermon) {
  const key = (sermon.analysis && sermon.analysis.formatDetected) ? null : sermon.format;
  if (sermon.analysis && sermon.analysis.formatDetected) return sermon.analysis.formatDetected;
  return (FORMATS[sermon.format] || FORMATS.auto).label;
}

/* ---------- 저장소 ---------- */
let state = null;
let currentReportTab = 'coaching';
let uiMode = 'free';
let settingsProvider = 'openai';
let libFilter = 'all';
let libQuery = '';
let libSort = 'date-desc';
let rewriteTarget = null;

function emptyState() {
  return {
    version: 1,
    sermons: [],
    expressions: [],
    settings: {
      provider: 'openai',
      openaiKey: '',
      openaiModel: 'gpt-4o-mini',
      anthropicKey: '',
      anthropicModel: 'claude-sonnet-4-5',
      rememberKey: true
    },
    currentId: null,
    ui: {}
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.sermons)) return migrateState(parsed);
    }
  } catch (e) {
    console.warn('저장된 자료를 읽지 못했습니다.', e);
  }
  return sampleState();
}

function migrateState(s) {
  const base = emptyState();
  const out = Object.assign(base, s);
  out.settings = Object.assign(base.settings, s.settings || {});
  out.sermons = (s.sermons || []).map(function (x) {
    x.analysis = x.analysis || { scores: {}, notes: {}, goodPoints: [], weakPoints: [], conversions: {}, translations: [] };
    return x;
  });
  out.expressions = s.expressions || [];
  out.version = 1;
  return out;
}

function saveState(silent) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(persistPayload()));
    if (!silent) flashSaved();
  } catch (e) {
    toast('저장 공간이 부족해 저장하지 못했습니다.', true);
  }
}

let saveTimer = null;
function flashSaved() {
  const el = $('#save-indicator');
  if (!el) return;
  el.textContent = '저장됨';
  el.classList.add('is-saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    el.textContent = '자동 저장됨';
    el.classList.remove('is-saving');
  }, 1400);
}

function getSermon(id) {
  return state.sermons.find(function (s) { return s.id === id; }) || null;
}

function currentSermon() {
  return getSermon(state.currentId);
}

function mySermons() {
  return state.sermons.filter(function (s) { return s.preacherRole === 'me'; });
}

function referenceSermons() {
  return state.sermons.filter(function (s) { return s.isReference; });
}

/* ---------- 토스트 ---------- */
let toastTimer = null;
function toast(msg, isError) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  el.classList.toggle('err', !!isError);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.hidden = true; }, 3600);
}

/* ---------- 샘플 설교 원고 ---------- */
const SAMPLE_A_TEXT = '오늘 우리가 읽은 시편 23편은 다윗이 자기 인생의 한복판에서 고백한 노래입니다. 다윗은 "여호와는 나의 목자시니 내게 부족함이 없으리로다"라고 시작합니다. 목자라는 말은 우리에게는 다소 낯설지만, 다윗에게는 자기 삶의 가장 정확한 언어였습니다.\n\n첫째, 목자는 양의 부족함을 채우시는 분입니다. "그가 나를 푸른 초장에 누이시며 쉴 만한 물가로 인도하시는도다." 양은 스스로 먹이를 찾지 못합니다. 목자가 데려가야만 먹습니다. 우리도 마찬가지입니다. 우리의 영혼은 스스로 만족할 수 없습니다.\n\n둘째, 목자는 길을 아시는 분입니다. "내가 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이라." 다윗은 골짜기를 피하지 않았습니다. 골짜기 가운데서도 함께하시는 목자를 보았습니다. 우리 회개하지 않은 사람들은 골짜기를 만나면 먼저 하나님을 의심합니다. 그래서 우리는 회개가 필요합니다. 회개하지 않으면 축복도 감당할 수 없습니다.\n\n셋째, 목자는 끝까지 인도하시는 분입니다. "주께서 내 원수의 목전에서 내게 상을 차려 주시고 기름을 내 머리에 부으셨으니 내 잔이 넘치나이다." 원수 앞에서 차려 주신 상은 사면이 아니라 승리의 식탁입니다. "내 평생에 선하심과 인자하심이 반드시 나를 따르리니 내가 여호와의 집에 영원히 살리로다."\n\n그러므로 이 시편은 위로의 노래이면서 동시에 소명의 노래입니다. 우리는 양이면서 동시에 목자가 되어야 합니다. 이번 주 우리의 가정과 목장에서 누군가의 목자가 되어 주십시오. 그리고 그 목자가 되기 전에 먼저 회개하십시오.';

const SAMPLE_B_TEXT = '빌립보서 4장 4절은 이렇게 시작합니다. "주 안에서 항상 기뻐하라. 내가 다시 말하노니 기뻐하라." 사도 바울은 기쁨을 권면합니다. 권면이라는 말에 주목해야 합니다. 기쁨은 감정이지만, 여기서 기쁨은 감정에 머물지 않고 명령입니다.\n\n바울이 이 편지를 쓸 때 그는 감옥에 있었습니다. 감옥에서 기뻐하라고 쓴 편지가 빌립보서입니다. 이것이 이 본문의 핵심입니다. 바울의 기쁨은 상황이 아니라 주를 향해 있었습니다. "주 안에서"라는 말이 이 명령의 조건이며 근거입니다.\n\n그렇다면 어떻게 기뻐할 수 있습니까? 바울은 세 가지를 제안합니다. 첫째, 관용하십시오. "너희 관용을 모든 사람에게 알게 하라. 주께서 가까우시니라." 둘째, 염려를 기도로 바꾸십시오. "아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로 너희 구할 것을 감사함으로 하나님께 아뢰라." 셋째, 생각을 지키십시오. "참되고 경건하며 의로운 것들을 생각하라."\n\n마지막으로 바울은 약속을 줍니다. "그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라." 기쁨은 우리가 만들어내는 것이 아니라 주 안에서 주어지는 것입니다.\n\n이번 주, 감정이 아닌 근거로 기뻐하십시오. 상황이 아니라 주를 보십시오.';

const SAMPLE_C_TEXT = 'If God is for us, who can be against us? Paul asks this question not as a slogan but as the conclusion of an argument that began in Romans 5. He has already traced the unbroken chain: foreknown, called, justified, glorified. Notice the past tense. Our glorification is spoken of as already accomplished, because the God who promised it cannot fail.\n\nThe question "who can be against us?" is not a denial of opposition. Paul knew opposition. He lists it in verse 35: tribulation, distress, persecution, famine, nakedness, danger, and sword. He is not pretending that suffering is small. He is saying that none of it can sever the love of Christ.\n\nHere is the heart of the passage. God did not spare his own Son. That is the measure of his commitment. "He who did not spare his own Son but gave him up for us all, how will he not also with him graciously give us all things?" The cross is not merely the demonstration of love; it is the guarantee of every other gift.\n\nWho shall bring any charge against God\'s elect? It is God who justifies. Who is to condemn? Christ Jesus is the one who died, and more than that, was raised, and is at the right hand of God, interceding for us. Our security does not rest on the strength of our love for God but on the finished work and ongoing intercession of Christ.\n\nThen Paul reaches his climax: nothing in all creation can separate us from the love of God in Christ Jesus our Lord. He does not say nothing will hurt us. He says nothing will separate us. The Christian life is not a promise of safety from pain but a promise of union with Christ in pain. Preach this to yourself before you preach it to anyone else.';

/* ---------- 샘플 자료 ---------- */
function sampleState() {
  const s = emptyState();
  const aScores = { context: 8, exegesis: 7, christ: 5, gospel: 6, doctrine: 7, logic: 6, empathy: 5, safety: 4, authority: 7, language: 8 };
  const bScores = { context: 8, exegesis: 8, christ: 7, gospel: 8, doctrine: 8, logic: 7, empathy: 7, safety: 8, authority: 6, language: 5 };
  const cScores = { context: 9, exegesis: 9, christ: 9, gospel: 9, doctrine: 9, logic: 8, empathy: 8, safety: 8, authority: 9, language: 8 };

  s.sermons = [
    {
      id: 'sample-me-1',
      title: '광야의 목자, 우리의 목자',
      preacherRole: 'me',
      preacher: '유효석',
      date: '2026-10-05',
      scripture: '시편 23:1-6',
      language: 'ko',
      inputType: 'manuscript',
      youtubeUrl: '',
      format: 'expository',
      isReference: false,
      createdAt: '2026-10-05T21:40:00.000Z',
      text: SAMPLE_A_TEXT,
      analysis: {
        scores: aScores,
        notes: {
          context: '1절의 "부족함이 없으리로다"를 2절의 초장과 물가 이미지와 연결해 문맥 안에서 읽었습니다.',
          exegesis: '골짜기, 상, 기름, 잔을 본문 순서대로 다루었습니다. 다만 "인도하시는"의 원어 뉘앙스는 더 짚을 수 있습니다.',
          christ: '그리스도를 향한 연결이 마지막 적용에 머물러, 설교의 중심축이 되지 못했습니다.',
          gospel: '5절의 상을 승리의 식탁으로 읽은 부분이 복음의 정서를 잘 살렸습니다.',
          doctrine: '목자의 인도와 성도의 회개를 다룬 진술은 건전합니다. 다만 회개의 필요성을 단정적 표현으로 좁혔습니다.',
          logic: '세 대지의 구조는 분명하나, 결론의 "소명"이 본문에서 준비되지 않았습니다.',
          empathy: '"회개하지 않은 사람들"이라는 표현이 회중을 정죄하는 인상으로 닿을 수 있습니다.',
          safety: '골짜기를 지나는 성도의 정서를 정죄로 먼저 만나지 않도록 정서적 안전을 점검할 필요가 있습니다.',
          authority: '본문을 대하는 태도는 경건하고, 설교자 자신의 목소리도 분명합니다.',
          language: '푸른 초장, 잔, 기름 같은 본문 이미지를 살려 언어가 맑습니다.'
        },
        summary: '시편 23편의 목자 이미지를 세 대지로 충실히 따라간 설교입니다. 본문 인용과 이미지 해석이 정확하고 언어도 맑습니다. 다만 골짜기에서 흔들리는 회중을 정죄하는 표현을 걷어 내고, "작은 목자"의 적용 앞에 그리스도를 먼저 세우면 복음의 무게중심이 바로 서겠습니다.',
        formatDetected: '대지 설교',
        formatReason: '세 개의 병렬 대지("채우시는", "아시는", "인도하시는")가 본문 순서를 따라 배열되어 있습니다.',
        goodPoints: [
          { item: 'context', quote: '그가 나를 푸른 초장에 누이시며 쉴 만한 물가로 인도하시는도다.', reason: '본문의 목자 이미지를 자기 언어로 바꾸지 않고 본문 그대로 인용하며, 1절의 "부족함이 없으리로다"와 2절의 "누이시며"를 이어 설명합니다. 문맥 안에서 이미지를 해석하고 있습니다.' },
          { item: 'exegesis', quote: '다윗은 골짜기를 피하지 않았습니다. 골짜기 가운데서도 함께하시는 목자를 보았습니다.', reason: '사망의 음침한 골짜기를 "피하지 않은 자리"로 읽어 낸 것이 본문 주석으로 정확합니다. 시편 23편의 중심이 골짜기를 지나가는 목자의 동행임을 놓치지 않았습니다.' },
          { item: 'gospel', quote: '원수 앞에서 차려 주신 상은 사면이 아니라 승리의 식탁입니다.', reason: '5절의 "원수의 목전에서"를 단순한 보호가 아니라 승리와 회복의 이미지로 읽었습니다. 복음의 정서가 살아 있습니다.' }
        ],
        weakPoints: [
          {
            item: 'empathy',
            quote: '우리 회개하지 않은 사람들은 골짜기를 만나면 먼저 하나님을 의심합니다.',
            issue: '회중을 "회개하지 않은 사람들"로 묶어 규정하면, 골짜기에서 흔들리는 성도의 마음에 정죄가 먼저 닿습니다. 본문은 골짜기에서 의심한 사람이 아니라 동행하시는 목자를 보라고 말합니다.',
            method: '"우리"를 설교자 자신에게 먼저 적용하고, 의심을 죄로 단정하기보다 그 자리에서 붙드시는 목자의 신실함으로 초점을 옮기십시오.',
            rewrite: '"골짜기를 만나면 우리 마음은 먼저 흔들립니다. 저도 그렇습니다. 그러나 다윗은 그 흔들림 가운데서도 함께하시는 목자를 보았습니다."',
            practice: '이번 주 설교 준비 때 정죄하는 문장마다 "이 말이 골짜기 한복판에 있는 성도에게 어떻게 들릴까"를 소리 내어 점검해 보십시오.'
          },
          {
            item: 'logic',
            quote: '그러므로 이 시편은 위로의 노래이면서 동시에 소명의 노래입니다.',
            issue: '"그러므로"로 결론을 이끌지만, 본문 어디에서 소명이 나오는지 앞의 세 대지가 준비하지 못했습니다. 위로에서 소명으로 건너뛰는 느낌이 있습니다.',
            method: '세 번째 대지에서 "영원히 살리로다"의 고백이 어떻게 이웃을 향한 책임으로 이어지는지 한 문장으로 연결한 뒤 결론을 여십시오.',
            rewrite: '"영원히 여호와의 집에 산다는 고백은 나만의 안식이 아닙니다. 그 집의 목자가 되라는 부르심입니다."',
            practice: '결론을 쓰기 전에 "그러므로" 앞에 놓인 근거를 한 문장으로 적어 보고, 그 근거가 본문에 있는지 표시해 보십시오.'
          },
          {
            item: 'christ',
            quote: '우리는 양이면서 동시에 목자가 되어야 합니다.',
            issue: '성도의 적용이 곧바로 목자의 역할로 넘어가면서, 우리를 대신해 목자가 되신 그리스도가 흐려집니다. 설교의 무게가 윤리적 결단으로 기웁니다.',
            method: '요한복음 10장의 선한 목자, 곧 양을 위해 목숨을 버리신 그리스도를 먼저 세우고, 그 목자 아래서 우리가 작은 목자가 된다는 순서로 바꾸십시오.',
            rewrite: '"우리가 목자가 되기 전에, 우리에게는 목자가 계십니다. 양을 위해 목숨을 버리신 그 목자가 우리를 먼저 먹이십니다. 그 사랑에서 자라난 사람이 작은 목자가 됩니다."',
            practice: '모든 적용 문장 앞에 "그리스도께서 먼저 하신 일"을 한 줄 적는 습관을 붙여 보십시오.'
          }
        ],
        rewriteHealthy: '',
        conversions: {},
        translations: [],
        lessons: [],
        expressionsGood: [],
        expressionsAvoid: ['회개하지 않은 사람들은 골짜기를 만나면 먼저 하나님을 의심합니다.']
      }
    },
    {
      id: 'sample-me-2',
      title: '기뻐하라, 다시 말하노니',
      preacherRole: 'me',
      preacher: '유효석',
      date: '2026-11-16',
      scripture: '빌립보서 4:4-9',
      language: 'ko',
      inputType: 'manuscript',
      youtubeUrl: '',
      format: 'onepoint',
      isReference: false,
      createdAt: '2026-11-16T21:20:00.000Z',
      text: SAMPLE_B_TEXT,
      analysis: {
        scores: bScores,
        notes: {
          context: '4절의 명령을 5~9절의 흐름 안에서 읽었습니다. 옥중 서신이라는 상황도 본문의 무게로 삼았습니다.',
          exegesis: '관용, 기도, 생각이라는 세 자리를 본문 순서대로 짚었습니다. 다만 "세 가지"가 본문 구조인지 설교자의 정리인지 밝히지 않았습니다.',
          christ: '"주 안에서"가 반복되지만 그리스도의 인격과 사역이 설교의 중심 인물로 서지는 않습니다.',
          gospel: '기쁨의 근거를 우리의 결단이 아니라 주 안에서 주어지는 선물로 돌린 점이 좋습니다.',
          doctrine: '기쁨과 평강, 기도의 관계를 다룬 진술은 건전합니다.',
          logic: '세 항목이 하나의 평강으로 모이는 연결이 약해, 마지막 약속이 갑자기 도착합니다.',
          empathy: '적용이 명령으로 끝나, 지금 기쁘지 않은 성도의 첫걸음이 보이지 않습니다.',
          safety: '"기뻐하라"는 명령이 상처를 누르지 않도록 정서적 배려가 더 필요합니다.',
          authority: '설교자의 확신은 분명하나, 사도적 권위와 설교자의 권위를 구분하는 문장이 있으면 더 좋겠습니다.',
          language: '본문 인용은 정확하나 예화가 거의 없어 추상적인 문장이 남습니다.'
        },
        summary: '"주 안에서"라는 본문의 근거를 붙들고 기쁨을 명령으로 읽어 낸 설교입니다. 옥중 서신이라는 상황을 살린 점과 마지막에 기쁨을 선물로 돌린 점이 좋습니다. 다만 세 항목이 하나의 평강으로 모이는 연결을 세우고, 기쁘지 않은 성도가 실제로 딛을 첫걸음을 그려 주면 적용이 살아납니다.',
        formatDetected: '원포인트 설교',
        formatReason: '본문의 한 명령("주 안에서 기뻐하라")이 끝까지 중심을 잡고, 세 항목이 그 명령 아래 배열되어 있습니다.',
        goodPoints: [
          { item: 'exegesis', quote: '바울이 이 편지를 쓸 때 그는 감옥에 있었습니다. 감옥에서 기뻐하라고 쓴 편지가 빌립보서입니다.', reason: '빌립보서의 옥중 서신 성격을 본문의 무게로 삼았습니다. "주 안에서"라는 조건이 상황과 대조된다는 점을 정확히 짚었습니다.' },
          { item: 'context', quote: '사도 바울은 기쁨을 권면합니다. 권면이라는 말에 주목해야 합니다.', reason: '4절의 명령형을 "권면"으로 읽으며 원문의 어조를 살폈습니다. 감정과 명령을 구분한 것이 본문 이해의 출발점입니다.' },
          { item: 'gospel', quote: '기쁨은 우리가 만들어내는 것이 아니라 주 안에서 주어지는 것입니다.', reason: '마지막에 기쁨의 근거를 우리의 결단이 아니라 주 안에서 주어지는 선물로 돌립니다. 복음의 방향이 맞습니다.' }
        ],
        weakPoints: [
          {
            item: 'empathy',
            quote: '이번 주, 감정이 아닌 근거로 기뻐하십시오.',
            issue: '적용이 명령으로 끝나, 기쁘지 않은 채로 이 자리에 앉아 있는 성도가 어떻게 첫걸음을 뗄지 보이지 않습니다.',
            method: '한 주의 구체적인 장면(새벽 기도, 식탁, 병상)을 하나 골라 그 자리에서 기도로 바꾸는 방법을 예로 드십시오.',
            rewrite: '"이번 주 마음이 무거운 아침이 오거든, 그 감정을 부정하지 말고 그대로 가지고 4절을 읽어 보십시오. 기쁨은 그 자리에서 시작됩니다."',
            practice: '적용마다 "오늘 저녁 이 말씀을 붙들 사람의 이름"을 하나 떠올려 그 사람에게 들리도록 문장을 바꿔 보십시오.'
          },
          {
            item: 'logic',
            quote: '바울은 세 가지를 제안합니다.',
            issue: '본문에 없는 "세 가지" 틀이 4~9절의 흐름을 나눕니다. 관용·기도·생각은 본문 순서이지만, 설교자의 분류임을 밝히지 않으면 본문 구조로 오해됩니다.',
            method: '세 가지를 말할 때 "본문을 따라 세 자리로 나누어 보면"이라고 밝히고, 세 항목이 어떻게 하나의 평강으로 모이는지 마지막에 연결하십시오.',
            rewrite: '"본문의 흐름을 따라 세 자리를 짚어 보겠습니다. 관용, 기도, 생각 — 이 셋은 따로 서지 않고 하나의 평강으로 모입니다."',
            practice: '설교 개요를 만들 때 각 대지 옆에 근거 절을 적고, 본문에 없는 틀에는 "설교자의 정리"라고 표시해 보십시오.'
          },
          {
            item: 'language',
            quote: '셋째, 생각을 지키십시오.',
            issue: '세 항목 중 마지막만 예화 없이 지나갑니다. "생각을 지킨다"는 말이 추상적으로 남습니다.',
            method: '8절의 목록을 하루의 장면으로 옮긴 짧은 예를 하나 붙이십시오. 밤에 떠오르는 걱정을 적어 두고 8절로 걸러 내는 연습 같은 것입니다.',
            rewrite: '"잠들기 전 오늘 떠오른 생각을 세 가지 적어 보십시오. 그리고 8절의 기준으로 하나씩 물어 보십시오. 이것이 생각을 지키는 일입니다."',
            practice: '추상 명사(생각, 평강, 관용)가 나올 때마다 "이것을 오늘 어떻게 알아볼 수 있나"를 적어 두는 연습을 해 보십시오.'
          }
        ],
        rewriteHealthy: '',
        conversions: {},
        translations: [],
        lessons: [],
        expressionsGood: [],
        expressionsAvoid: []
      }
    },
    {
      id: 'sample-ref-1',
      title: 'Nothing Can Separate',
      preacherRole: 'other',
      preacher: 'Rev. Daniel Cho',
      date: '2026-09-21',
      scripture: '로마서 8:31-39',
      language: 'en',
      inputType: 'manuscript',
      youtubeUrl: '',
      format: 'series',
      isReference: true,
      createdAt: '2026-09-21T19:00:00.000Z',
      text: SAMPLE_C_TEXT,
      analysis: {
        scores: cScores,
        notes: {
          context: '로마서 5장부터 이어진 논증의 결론으로 8:31을 읽습니다.',
          exegesis: '예정-소명-칭의-영화의 사슬과 35절의 고난 목록을 본문 순서대로 다룹니다.',
          christ: '그리스도의 죽으심·부활·중보가 성도의 안전의 근거로 자리 잡습니다.',
          gospel: '복음의 약속을 안전이 아니라 연합으로 정확히 구분합니다.',
          doctrine: '칭의와 견인의 교리가 본문에 붙어 있습니다.',
          logic: '논증의 각 단계가 앞 단계에 기대는 구조를 드러냅니다.',
          empathy: '고통을 부정하지 않지만, 적용이 설교자 자신에게 머뭅니다.',
          safety: '고난 가운데 있는 성도를 배려하는 어조입니다.',
          authority: '본문의 권위와 설교자의 확신이 구분되어 있습니다.',
          language: '짧은 대구와 반복이 기억을 돕습니다.'
        },
        summary: '로마서 8장의 논증을 끝까지 따라가며, 성도의 안전이 우리 사랑의 강도가 아니라 그리스도의 완성된 사역에 있다는 것을 분명히 세운 설교입니다. 고난을 부정하지 않으면서도 끊을 수 없는 사랑으로 초점을 옮기는 균형이 좋습니다.',
        formatDetected: '연속 강해',
        formatReason: '로마서 8장의 절 단위 논증을 순서대로 따라가며, 앞 문맥(5장)과의 연결을 명시합니다.',
        goodPoints: [
          { item: 'exegesis', quote: 'He has already traced the unbroken chain: foreknown, called, justified, glorified. Notice the past tense.', reason: '로마서 8:30의 사슬을 순서대로 짚고, "영화롭게 하셨다"는 과거 시제의 의미를 본문 논리로 설명합니다.' },
          { item: 'christ', quote: 'Our security does not rest on the strength of our love for God but on the finished work and ongoing intercession of Christ.', reason: '성도의 안전을 자기 사랑의 강도가 아니라 그리스도의 완성된 사역과 현재의 중보에 둡니다. 복음의 근거가 정확합니다.' },
          { item: 'language', quote: 'He does not say nothing will hurt us. He says nothing will separate us.', reason: '짧은 대구로 본문의 약속을 오해 없이 구분합니다. 회중이 기억할 수 있는 문장입니다.' }
        ],
        weakPoints: [
          {
            item: 'empathy',
            quote: 'Preach this to yourself before you preach it to anyone else.',
            issue: '적용이 설교자 자신에게 머물러, 고난 가운데 있는 회중이 이 본문을 어떻게 붙들지 구체적으로 보이지 않습니다.',
            method: '35절의 고난 목록을 오늘 회중의 언어로 다시 적고, 그 자리에서 이 본문을 어떻게 읽을지 한 문단 더하십시오.',
            rewrite: 'When the phone call comes at midnight, you will not need a new argument. You will need this sentence: nothing can separate you.',
            practice: '설교 마지막에 "이 본문을 다음 주에 붙들 사람"을 한 사람 떠올려 그 사람에게 말하듯 적용을 쓰십시오.'
          }
        ],
        rewriteHealthy: '',
        conversions: {},
        translations: [
          { original: 'If God is for us, who can be against us?', korean: '하나님이 우리를 위하시면 누가 우리를 대적하겠습니까?' },
          { original: 'He has already traced the unbroken chain: foreknown, called, justified, glorified.', korean: '그는 이미 끊어지지 않는 사슬을 따라가 보았습니다. 미리 아심, 부르심, 의롭다 하심, 영화롭게 하심입니다.' },
          { original: 'Notice the past tense.', korean: '과거 시제에 주목하십시오.' },
          { original: 'The question is not a denial of opposition.', korean: '이 질문은 대적이 없다는 부정이 아닙니다.' },
          { original: 'He is saying that none of it can sever the love of Christ.', korean: '그는 그 어느 것도 그리스도의 사랑을 끊을 수 없다고 말하는 것입니다.' },
          { original: 'God did not spare his own Son.', korean: '하나님은 자기 아들을 아끼지 않으셨습니다.' },
          { original: 'The cross is not merely the demonstration of love; it is the guarantee of every other gift.', korean: '십자가는 사랑의 시연에 그치지 않고, 다른 모든 선물의 보증입니다.' },
          { original: 'Our security does not rest on the strength of our love for God but on the finished work and ongoing intercession of Christ.', korean: '우리의 안전은 하나님을 향한 우리 사랑의 강도가 아니라, 그리스도의 완성된 사역과 지금도 이어지는 중보에 있습니다.' },
          { original: 'He does not say nothing will hurt us. He says nothing will separate us.', korean: '그는 아무것도 우리를 상하게 하지 않는다고 말하지 않습니다. 아무것도 우리를 갈라놓지 못한다고 말합니다.' },
          { original: 'Preach this to yourself before you preach it to anyone else.', korean: '다른 누구에게 전하기 전에, 먼저 자기 자신에게 이 말씀을 전하십시오.' }
        ],
        lessons: [
          '본문의 논증 구조를 따라가며 각 단계가 앞 단계에 어떻게 기대는지 명시합니다.',
          '고난을 부정하지 않고, 고난 가운데서도 끊을 수 없는 사랑으로 초점을 옮깁니다.',
          '짧은 대구와 반복으로 핵심 문장을 회중의 기억에 남깁니다.',
          '적용을 설교자 자신에게 먼저 적용한 뒤 회중에게 건넵니다.'
        ],
        expressionsGood: [
          'Our security does not rest on the strength of our love for God but on the finished work and ongoing intercession of Christ.',
          'He does not say nothing will hurt us. He says nothing will separate us.'
        ],
        expressionsAvoid: []
      }
    }
  ];

  s.expressions = [
    { id: 'sample-ex-1', kind: 'good', text: '은혜는 우리가 하나님을 향해 걸어간 거리가 아니라, 하나님이 우리를 향해 걸어오신 거리로 측정됩니다.', note: '복음의 방향을 뒤집지 않는 표현', source: '직접 추가', createdAt: '2026-11-02T10:00:00.000Z' },
    { id: 'sample-ex-2', kind: 'good', text: '기도는 하나님을 내 뜻에 맞추는 일이 아니라, 내 마음을 하나님의 뜻에 맞추는 일입니다.', note: '기도를 수단이 아닌 관계로 놓는 문장', source: '직접 추가', createdAt: '2026-11-09T10:00:00.000Z' },
    { id: 'sample-ex-3', kind: 'avoid', text: '하나님을 믿으면 모든 문제가 해결됩니다.', note: '복음의 약속을 성공과 문제 해결로 축소할 위험', source: '직접 추가', createdAt: '2026-11-09T10:05:00.000Z' },
    { id: 'sample-ex-4', kind: 'avoid', text: '여러분만 잘하면 됩니다.', note: '은혜를 인간의 결단으로 대체하는 표현', source: '직접 추가', createdAt: '2026-11-12T10:00:00.000Z' }
  ];

  s.currentId = 'sample-me-2';
  return s;
}

/* 초기 상태 로드 (샘플 정의 이후 실행) */
state = loadState();

/* =========================================================
   2) 프롬프트 · 응답 파싱 · API
   ========================================================= */

const ITEM_DEFINITIONS = {
  context: '본문의 앞뒤 문맥, 성경 책 전체의 흐름, 장르(시가서·서신·복음서 등) 안에서 본문을 읽었는가. 문맥을 찢어 인용하지 않았는가.',
  exegesis: '본문의 단어·구문·논리를 얼마나 충실히 따라갔는가. 본문이 실제로 말하는 것과 설교자가 말하는 것이 일치하는가.',
  christ: '본문에서 그리스도와 복음의 성취가 어떻게 드러나는가. 비약 없이 본문에서 그리스도로 가는 다리가 놓였는가.',
  gospel: '은혜와 복음이 인간의 결단·윤리보다 앞서는가. 설교의 무게가 율법주의나 도덕주의로 기울지 않았는가.',
  doctrine: '교리적으로 건전한가. 성경적 하나님·인간·구원론에 어긋나는 주장이나 편향이 없는가.',
  logic: '논리 흐름과 구조. 서론-본론-결론, 대지 사이의 연결, 결론이 본문에서 준비되었는가.',
  empathy: '회중의 실제 삶에 공감하고 구체적으로 적용했는가. 적용이 명령으로만 끝나지 않았는가.',
  safety: '정죄·낙인·공포 조장 없이 정서적으로 안전한가. 상처 입은 성도에게 어떻게 들릴지 고려했는가.',
  authority: '본문의 권위와 설교자의 권위를 구분하는가. 확신 있게 그러나 소통하며 전하는가.',
  language: '언어가 명료하고 아름다운가. 예화가 적절하고 기억에 남는가. 추상적 표현에 머물지 않았는가.'
};

function formatCriteriaText(format) {
  const f = FORMATS[format] || FORMATS.auto;
  return f.label + ' — ' + f.criteria.map(function (c, i) { return '(' + (i + 1) + ') ' + c; }).join(' ');
}

function sermonInfoBlock(input) {
  const langLabel = input.language === 'en' ? '영어 (문장별 한글 번역 필요)' : '한국어';
  const typeLabel = input.inputType === 'youtube' ? '유튜브 대본' : '설교 원고';
  const roleLabel = input.preacherRole === 'other' ? '다른 설교자' : '내 설교';
  return [
    '- 제목: ' + (input.title || '(없음)'),
    '- 설교자 구분: ' + roleLabel + (input.preacher ? ' / 이름: ' + input.preacher : ''),
    '- 설교 날짜: ' + (input.date || '(없음)'),
    '- 성경 본문: ' + (input.scripture || '(없음)'),
    '- 언어: ' + langLabel,
    '- 입력 유형: ' + typeLabel + (input.youtubeUrl ? ' / URL: ' + input.youtubeUrl : ''),
    '- 요청한 설교 형식: ' + (FORMATS[input.format] || FORMATS.auto).label
  ].join('\n');
}

function buildAnalysisPrompt(input) {
  const itemLines = ITEMS.map(function (it, i) {
    return '  ' + (i + 1) + '. ' + it.ko + ' — ' + ITEM_DEFINITIONS[it.key];
  }).join('\n');

  const needsTranslation = input.language === 'en';

  return [
    '당신은 30년 경력의 설교 코치입니다. 개혁주의·복음주의 신학에 뿌리를 두고, 강해 설교와 목회적 적용에 능숙합니다.',
    '아래 설교를 읽고 열 가지 항목으로 냉정하고 구체적으로 평가해 주십시오. 칭찬을 위해 점수를 올리지 말고, 정확함을 위해 근거를 남기십시오.',
    '',
    '[설교 정보]',
    sermonInfoBlock(input),
    '',
    '[설교 형식 판별 기준]',
    formatCriteriaText(input.format),
    '  형식이 "자동 판별"로 요청된 경우에도, 반드시 위 네 형식 중 하나로 판별해 format_detected에 적고 그 근거를 format_reason에 쓰십시오.',
    '',
    '[평가 항목 — 각 0점에서 10점]',
    itemLines,
    '',
    '[점수 기준]',
    '  9~10: 탁월함. 이 수준이면 다른 설교자에게 본보기로 보여 줄 수 있음.',
    '  7~8: 양호함. 설교로 온전히 기능하나 더 깊어질 여지가 있음.',
    '  5~6: 보통. 핵심은 있으나 뚜렷한 개선점이 있음.',
    '  3~4: 미흡함. 설교의 목적을 흔드는 문제가 있음.',
    '  0~2: 심각함. 본문과 어긋나거나 회중에게 해가 될 수 있음.',
    '  항목별 점수는 정수 또는 소수점 한 자리까지 쓰십시오(예: 7.5). 점수를 후하게 주지 마십시오.',
    '',
    '[근거 인용 규칙 — 매우 중요]',
    '  - quote에는 반드시 [설교 본문] 안에 있는 문장을 "한 글자도 바꾸지 않고" 그대로 복사해 넣으십시오. 요약하거나 다듬지 마십시오.',
    '  - 인용은 10자 이상 80자 이내의 한두 문장으로 고르십시오.',
    '  - 잘한 점 3개 이상, 아쉬운 점 3개 이상을 제시하되, 서로 다른 문장을 인용하십시오.',
    '  - 아쉬운 점은 반드시 원문에서 실제로 찾을 수 있는 문장이어야 합니다.',
    '',
    '[코칭 원칙]',
    '  - 아쉬운 점은 "무엇이 문제인가(issue) → 어떻게 고칠까(method) → 고쳐 쓴 예(rewrite) → 다음 설교를 위한 연습(practice)" 순서로 쓰십시오.',
    '  - rewrite는 설교자가 바로 쓸 수 있는 실제 문장으로 쓰십시오. 평가자가 아니라 동역자처럼 쓰십시오.',
    '  - 신학적으로 민감한 지적은 반드시 성경적 근거와 함께 정중하게 쓰십시오.',
    needsTranslation
      ? '  - 이 설교는 영어입니다. 본문의 핵심 문장 8~12개를 골라 원문과 한글 번역을 문장 단위로 대조해 verse_translations에 넣으십시오. 번역은 설교의 어조를 살린 자연스러운 한국어로 하십시오.'
      : '  - 한국어 설교이므로 verse_translations는 빈 배열([])로 두십시오.',
    '',
    '[다시 쓰기]',
    '  - rewrite_healthy에는 이 설교를 "건강한 설교"로 다시 쓴 원고를 넣으십시오. 원문의 좋은 문장은 살리고, 아쉬운 점을 고친 완성된 설교 원고여야 합니다.',
    '  - 분량은 900~1600자(영어는 500~800단어)로, 서론-본론-결론이 있는 실제 설교 형태로 쓰십시오.',
    '',
    '[출력 형식]',
    '아래 JSON 객체 하나만 출력하십시오. 인사말, 설명, JSON 앞뒤의 다른 텍스트는 쓰지 마십시오. 코드블록을 쓰더라도 JSON만 넣으십시오.',
    '{',
    '  "format_detected": "대지 설교 | 원포인트 설교 | 연속 강해 | 주제 설교 중 하나",',
    '  "format_reason": "판별 근거 1~2문장",',
    '  "summary": "총평 3~5문장. 강점과 가장 중요한 개선점을 함께.",',
    '  "scores": {',
    '    "성경 문맥": 0, "강해 충실도": 0, "그리스도 중심": 0, "복음과 은혜": 0, "교리 건전성": 0,',
    '    "논리 흐름": 0, "공감과 적용": 0, "정서 안전": 0, "권위와 소통": 0, "언어와 예화": 0',
    '  },',
    '  "score_notes": { "성경 문맥": "한 문장 근거", "강해 충실도": "…", "그리스도 중심": "…", "복음과 은혜": "…", "교리 건전성": "…", "논리 흐름": "…", "공감과 적용": "…", "정서 안전": "…", "권위와 소통": "…", "언어와 예화": "…" },',
    '  "good_points": [ { "item": "항목명", "quote": "원문 그대로", "reason": "왜 잘했는지 2~3문장" } ],',
    '  "weak_points": [ { "item": "항목명", "quote": "원문 그대로", "issue": "무엇이 문제인가", "method": "어떻게 고칠까", "rewrite": "고쳐 쓴 예", "practice": "다음 설교 준비 연습 과제" } ],',
    '  "rewrite_healthy": { "title": "다시 쓴 설교 제목", "text": "다시 쓴 설교 원고 전문" },',
    '  "verse_translations": [ { "original": "영어 원문 문장", "korean": "한글 번역" } ],',
    '  "expressions_good": ["은혜와 복음을 잘 전한 표현 2~4개"],',
    '  "expressions_avoid": ["피해야 할·주의할 표현 2~4개"]',
    '}',
    '',
    '[설교 본문]',
    '"""',
    input.text,
    '"""',
    '',
    '이제 위 형식의 JSON만 출력하십시오.'
  ].join('\n');
}

function buildRewritePrompt(sermon, mode) {
  const analysis = sermon.analysis || {};
  const summary = analysis.summary || '';
  const weakLines = (analysis.weakPoints || []).map(function (w, i) {
    return '  ' + (i + 1) + '. [' + itemKo(w.item) + '] 문제: ' + (w.issue || '') + ' / 고칠 방향: ' + (w.method || '') + ' / 예시: ' + (w.rewrite || '');
  }).join('\n');

  const targetText = mode === 'healthy'
    ? '이 설교를 "건강한 설교"로 다시 써 주십시오.'
    : '이 설교를 "' + (FORMATS[mode.replace('format:', '')] || FORMATS.expository).label + '" 형식으로 다시 써 주십시오.';

  return [
    '당신은 30년 경력의 설교 코치이며, 설교자의 목소리를 살려 원고를 다듬는 편집자입니다.',
    targetText,
    '',
    '[조건]',
    '  - 원문의 좋은 문장과 설교자의 어조는 살리고, 아래 지적된 문제는 실제로 고치십시오.',
    '  - 본문의 문맥을 벗어나지 말고, 그리스도와 복음을 중심에 두십시오.',
    '  - 회중이 바로 들을 수 있는 완성된 설교 원고로 쓰십시오(900~1600자).',
    '  - 형식을 바꾸는 경우, 해당 형식의 구조(대지의 병렬, 하나의 명제, 절별 진행, 주제 수렴)를 실제로 따르십시오.',
    '  - 평가·설명·머리말 없이 설교 원고만 출력하십시오. 제목을 첫 줄에 쓰고 빈 줄 뒤에 본문을 쓰십시오.',
    '',
    '[설교 정보]',
    sermonInfoBlock(sermon),
    '',
    '[설교 본문]',
    '"""',
    sermon.text,
    '"""',
    '',
    '[코칭 요약]',
    summary,
    '',
    '[고칠 지점]',
    weakLines || '  (없음)',
    '',
    '이제 다시 쓴 설교 원고만 출력하십시오.'
  ].join('\n');
}

function itemKo(key) {
  return ITEM_BY_KEY[key] ? ITEM_BY_KEY[key].ko : (key || '');
}

function itemKey(name) {
  if (!name) return null;
  if (ITEM_BY_KEY[name]) return name;
  const raw = String(name).trim().toLowerCase();
  for (let i = 0; i < ITEMS.length; i++) {
    const it = ITEMS[i];
    if (it.ko.toLowerCase() === raw || String(it.short).toLowerCase() === raw) return it.key;
    for (let j = 0; j < it.aliases.length; j++) {
      if (it.aliases[j].toLowerCase() === raw) return it.key;
    }
  }
  for (let i = 0; i < ITEMS.length; i++) {
    const it = ITEMS[i];
    for (let j = 0; j < it.aliases.length; j++) {
      if (raw.indexOf(it.aliases[j].toLowerCase()) !== -1) return it.key;
    }
  }
  return null;
}

/* ---------- 응답 파싱 ---------- */
function extractJson(text) {
  if (!text) return null;
  let t = String(text).trim();
  const fence = t.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  if (fence && fence[1]) t = fence[1].trim();
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  const attempts = [
    t,
    t.replace(/,\s*([}\]])/g, '$1'),
    t.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null').replace(/,\s*([}\]])/g, '$1')
  ];
  for (let i = 0; i < attempts.length; i++) {
    try { return JSON.parse(attempts[i]); } catch (e) { /* 다음 시도 */ }
  }
  return null;
}

function pick(obj, keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return undefined;
}

function normalizeAnalysis(raw, input) {
  if (!raw || typeof raw !== 'object') throw new Error('응답에서 JSON 객체를 찾지 못했습니다.');

  const scores = {};
  const notes = {};
  ITEMS.forEach(function (it) { scores[it.key] = 0; notes[it.key] = ''; });

  let rawScores = pick(raw, ['scores', 'score', '점수', '항목별 점수', 'item_scores']);
  if (Array.isArray(rawScores)) {
    const asObj = {};
    rawScores.forEach(function (entry) {
      if (!entry || typeof entry !== 'object') return;
      const name = pick(entry, ['item', 'name', '항목', '항목명']);
      const val = pick(entry, ['score', 'value', '점수']);
      if (name) asObj[name] = val;
    });
    rawScores = asObj;
  }
  if (rawScores && typeof rawScores === 'object') {
    Object.keys(rawScores).forEach(function (name) {
      const key = itemKey(name);
      if (!key) return;
      const val = numberToScore(rawScores[name]);
      if (val !== null) scores[key] = val;
    });
  }
  // 일부 모델이 최상위에 항목 점수를 흩어 놓는 경우
  ITEMS.forEach(function (it) {
    if (scores[it.key]) return;
    const direct = pick(raw, [it.ko, it.key]);
    if (direct !== undefined) {
      const val = numberToScore(direct);
      if (val !== null) scores[it.key] = val;
    }
  });

  let rawNotes = pick(raw, ['score_notes', 'notes', '점수 근거', '항목별 근거', 'comments']);
  if (rawNotes && typeof rawNotes === 'object') {
    Object.keys(rawNotes).forEach(function (name) {
      const key = itemKey(name);
      if (key && rawNotes[name]) notes[key] = String(rawNotes[name]);
    });
  }

  const goodPoints = normalizeGood(raw);
  const weakPoints = normalizeWeak(raw);

  let rewriteHealthy = '';
  const rawRewrite = pick(raw, ['rewrite_healthy', 'rewrite', '다시 쓰기', 'rewritten', 'healthy_rewrite']);
  if (rawRewrite) {
    if (typeof rawRewrite === 'string') rewriteHealthy = rawRewrite;
    else rewriteHealthy = String(pick(rawRewrite, ['text', '본문', 'content', '설교']) || '');
  }

  let translations = [];
  const rawTrans = pick(raw, ['verse_translations', 'translations', '번역', '문장별 번역', 'translation']);
  if (Array.isArray(rawTrans)) {
    translations = rawTrans.map(function (t) {
      if (typeof t === 'string') {
        const parts = t.split(/\s*(?:→|->|—|\|)\s*/);
        return { original: parts[0] || t, korean: parts[1] || '' };
      }
      if (t && typeof t === 'object') {
        return {
          original: String(pick(t, ['original', '원문', 'en', 'source', 'sentence']) || ''),
          korean: String(pick(t, ['korean', '번역', 'ko', 'translation', '한글']) || '')
        };
      }
      return null;
    }).filter(function (t) { return t && (t.original || t.korean); });
  }

  function strList(v) {
    if (!v) return [];
    if (!Array.isArray(v)) v = [v];
    return v.map(function (x) {
      if (typeof x === 'string') return x;
      if (x && typeof x === 'object') return String(pick(x, ['text', '표현', 'quote', 'expression']) || '');
      return '';
    }).filter(Boolean);
  }

  const lessons = strList(pick(raw, ['lessons', '배울 점', 'takeaways']));

  const out = {
    scores: scores,
    notes: notes,
    summary: String(pick(raw, ['summary', '총평', 'overall', 'overview']) || ''),
    formatDetected: String(pick(raw, ['format_detected', 'format', '설교 형식', 'detected_format']) || (FORMATS[input.format] || FORMATS.auto).label),
    formatReason: String(pick(raw, ['format_reason', '형식 판별 근거', 'format_notes']) || ''),
    goodPoints: goodPoints,
    weakPoints: weakPoints,
    rewriteHealthy: rewriteHealthy,
    conversions: {},
    translations: translations,
    lessons: lessons,
    expressionsGood: strList(pick(raw, ['expressions_good', '좋은 표현'])),
    expressionsAvoid: strList(pick(raw, ['expressions_avoid', '주의할 표현', '피해야 할 표현']))
  };

  const allZero = ITEMS.every(function (it) { return !scores[it.key]; });
  if (allZero) throw new Error('응답에서 항목별 점수를 찾지 못했습니다. scores 항목이 있는지 확인해 주세요.');

  return out;
}

function normalizeGood(raw) {
  let list = pick(raw, ['good_points', 'goodPoints', '잘한 점', 'strengths', '강점']);
  if (!list && Array.isArray(pick(raw, ['good']))) list = pick(raw, ['good']);
  if (!list) return [];
  if (!Array.isArray(list)) list = [list];
  return list.map(function (p) {
    if (typeof p === 'string') return { item: null, quote: p, reason: '' };
    if (!p || typeof p !== 'object') return null;
    return {
      item: itemKey(pick(p, ['item', '항목', 'category', 'area'])),
      quote: String(pick(p, ['quote', '문장', 'sentence', 'evidence', '근거']) || ''),
      reason: String(pick(p, ['reason', '이유', 'why', 'comment', '코멘트']) || '')
    };
  }).filter(function (p) { return p && (p.quote || p.reason); });
}

function normalizeWeak(raw) {
  let list = pick(raw, ['weak_points', 'weakPoints', '아쉬운 점', 'improvements', '개선점']);
  if (!list && Array.isArray(pick(raw, ['weak']))) list = pick(raw, ['weak']);
  if (!list) return [];
  if (!Array.isArray(list)) list = [list];
  return list.map(function (p) {
    if (typeof p === 'string') return { item: null, quote: p, issue: '', method: '', rewrite: '', practice: '' };
    if (!p || typeof p !== 'object') return null;
    return {
      item: itemKey(pick(p, ['item', '항목', 'category', 'area'])),
      quote: String(pick(p, ['quote', '문장', 'sentence', 'evidence', '근거']) || ''),
      issue: String(pick(p, ['issue', '문제', 'problem', 'what']) || ''),
      method: String(pick(p, ['method', '방법', 'how', 'how_to_fix', 'solution']) || ''),
      rewrite: String(pick(p, ['rewrite', '고쳐 쓴 예', 'example', 'better']) || ''),
      practice: String(pick(p, ['practice', '연습', 'exercise', 'drill']) || '')
    };
  }).filter(function (p) { return p && (p.quote || p.issue); });
}

/* ---------- 설교 객체 만들기 ---------- */
function makeSermonFromInput(input, analysis) {
  return {
    id: uid('s'),
    title: input.title || '제목 없는 설교',
    preacherRole: input.preacherRole || 'me',
    preacher: input.preacher || (input.preacherRole === 'me' ? '유효석' : ''),
    date: input.date || todayISO(),
    scripture: input.scripture || '',
    language: input.language || 'ko',
    inputType: input.inputType || 'manuscript',
    youtubeUrl: input.youtubeUrl || '',
    format: input.format || 'auto',
    isReference: false,
    createdAt: new Date().toISOString(),
    text: input.text || '',
    analysis: analysis
  };
}

/* ---------- API ---------- */
function activeProvider() {
  return state.settings.provider === 'anthropic' ? 'anthropic' : 'openai';
}

function apiKeyFor(provider) {
  return provider === 'anthropic' ? (state.settings.anthropicKey || '') : (state.settings.openaiKey || '');
}

function apiModelFor(provider) {
  return provider === 'anthropic'
    ? (state.settings.anthropicModel || 'claude-sonnet-4-5')
    : (state.settings.openaiModel || 'gpt-4o-mini');
}

async function callAI(prompt, opts) {
  const options = opts || {};
  const provider = options.provider || activeProvider();
  const key = apiKeyFor(provider);
  if (!key) throw new Error('API 키가 없습니다. 설정에서 키를 입력해 주세요.');

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: apiModelFor('anthropic'),
        max_tokens: options.maxTokens || 8000,
        temperature: 0.3,
        system: options.system || '당신은 한국어로 답하는 설교 코치입니다.',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json().catch(function () { return null; });
    if (!res.ok) {
      const msg = data && data.error && data.error.message ? data.error.message : ('HTTP ' + res.status);
      throw new Error('Anthropic 오류: ' + msg);
    }
    if (!data || !Array.isArray(data.content)) throw new Error('Anthropic 응답을 읽지 못했습니다.');
    return data.content.map(function (c) { return c.text || ''; }).join('\n');
  }

  const body = {
    model: apiModelFor('openai'),
    temperature: 0.3,
    messages: [
      { role: 'system', content: options.system || '당신은 한국어로 답하는 설교 코치입니다.' },
      { role: 'user', content: prompt }
    ]
  };
  if (options.json !== false) body.response_format = { type: 'json_object' };
  if (options.maxTokens) body.max_tokens = options.maxTokens;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(function () { return null; });
  if (!res.ok) {
    const msg = data && data.error && data.error.message ? data.error.message : ('HTTP ' + res.status);
    throw new Error('OpenAI 오류: ' + msg);
  }
  if (!data || !data.choices || !data.choices[0]) throw new Error('OpenAI 응답을 읽지 못했습니다.');
  return data.choices[0].message.content || '';
}

async function testApiConnection() {
  const provider = activeProvider();
  const key = apiKeyFor(provider);
  if (!key) throw new Error('먼저 API 키를 입력해 주세요.');
  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: apiModelFor('anthropic'),
        max_tokens: 8,
        messages: [{ role: 'user', content: '연결 확인. "확인"이라고만 답하세요.' }]
      })
    });
    const data = await res.json().catch(function () { return null; });
    if (!res.ok) {
      const msg = data && data.error && data.error.message ? data.error.message : ('HTTP ' + res.status);
      throw new Error('Anthropic: ' + msg);
    }
    return 'Anthropic 연결 확인됨 · ' + apiModelFor('anthropic');
  }
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { authorization: 'Bearer ' + key }
  });
  if (!res.ok) {
    const data = await res.json().catch(function () { return null; });
    const msg = data && data.error && data.error.message ? data.error.message : ('HTTP ' + res.status);
    throw new Error('OpenAI: ' + msg);
  }
  return 'OpenAI 연결 확인됨 · ' + apiModelFor('openai');
}

/* =========================================================
   3) 차트 (인라인 SVG)
   ========================================================= */

function scoreArray(analysis) {
  return ITEMS.map(function (it) { return Number((analysis.scores || {})[it.key] || 0); });
}

function radarSVG(scores, opts) {
  opts = opts || {};
  const W = 460, H = 400, cx = 230, cy = 198, R = 122, n = ITEMS.length;
  const ang = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / n; };
  const pt = function (i, val) {
    const a = ang(i), rr = R * clamp(val, 0, 10) / 10;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  };
  const poly = function (vals) {
    return vals.map(function (v, i) {
      const p = pt(i, v);
      return p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }).join(' ');
  };

  let out = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="열 가지 항목 레이더 차트">';
  [2, 4, 6, 8, 10].forEach(function (v) {
    out += '<polygon points="' + poly(ITEMS.map(function () { return v; })) + '" fill="' + (v === 10 ? '#fbf7ec' : 'none') + '" stroke="#e3dbc9" stroke-width="1"/>';
  });
  ITEMS.forEach(function (it, i) {
    const p = pt(i, 10);
    out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="#e8e1d2" stroke-width="1"/>';
  });
  if (opts.second) {
    out += '<polygon points="' + poly(opts.second.map(function (v) { return clamp(v, 0, 10); })) + '" fill="rgba(122,35,51,.10)" stroke="#7a2333" stroke-width="2" stroke-dasharray="6 4"/>';
  }
  out += '<polygon points="' + poly(scores) + '" fill="rgba(29,44,71,.16)" stroke="#1d2c47" stroke-width="2.4"/>';
  scores.forEach(function (v, i) {
    const p = pt(i, v);
    out += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.6" fill="#1d2c47"/>';
  });
  ITEMS.forEach(function (it, i) {
    const a = ang(i);
    const lx = cx + (R + 27) * Math.cos(a);
    const ly = cy + (R + 27) * Math.sin(a);
    const cosv = Math.cos(a), sinv = Math.sin(a);
    const anchor = cosv > 0.25 ? 'start' : (cosv < -0.25 ? 'end' : 'middle');
    const dy = sinv < -0.9 ? -8 : (sinv > 0.9 ? 14 : 0);
    out += '<text x="' + lx.toFixed(1) + '" y="' + (ly + dy).toFixed(1) + '" text-anchor="' + anchor + '" font-size="14" fill="#3d4654" font-family="Pretendard, Apple SD Gothic Neo, sans-serif">' + esc(it.short) + '</text>';
    out += '<text x="' + lx.toFixed(1) + '" y="' + (ly + dy + 17).toFixed(1) + '" text-anchor="' + anchor + '" font-size="14" font-weight="700" fill="#1d2c47" font-family="Georgia, serif">' + scores[i] + '</text>';
  });
  out += '</svg>';
  return out;
}

function gaugeSVG(total) {
  const r = 54, c = 2 * Math.PI * r;
  const frac = clamp(total, 0, 100) / 100;
  const color = total >= 80 ? '#2f6b47' : (total >= 60 ? '#a8823c' : '#7a2333');
  return '<div class="gauge-ring"><svg viewBox="0 0 130 130" aria-hidden="true">' +
    '<circle cx="65" cy="65" r="' + r + '" fill="none" stroke="#e7dfcf" stroke-width="11"/>' +
    '<circle cx="65" cy="65" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="11" stroke-linecap="round" stroke-dasharray="' + (c * frac).toFixed(1) + ' ' + c.toFixed(1) + '"/>' +
    '</svg><div class="gauge-num"><b>' + total + '</b><span>/ 100점</span></div></div>';
}

function lineChartSVG(series, labels) {
  const W = 700, H = 330;
  const pad = { l: 46, r: 26, t: 26, b: 54 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const n = labels.length;
  const X = function (i) { return n <= 1 ? pad.l + iw / 2 : pad.l + iw * i / (n - 1); };
  const Y = function (v) { return pad.t + ih * (1 - clamp(v, 0, 100) / 100); };

  let out = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="날짜별 성장 그래프">';
  for (let v = 0; v <= 100; v += 20) {
    const y = Y(v);
    out += '<line x1="' + pad.l + '" y1="' + y.toFixed(1) + '" x2="' + (W - pad.r) + '" y2="' + y.toFixed(1) + '" stroke="' + (v === 0 ? '#c9c0ad' : '#e8e1d2') + '" stroke-width="1"/>';
    out += '<text x="' + (pad.l - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="12" fill="#8a8578" font-family="sans-serif">' + v + '</text>';
  }
  labels.forEach(function (lb, i) {
    out += '<text x="' + X(i).toFixed(1) + '" y="' + (H - pad.b + 24) + '" text-anchor="middle" font-size="12" fill="#6b6f78" font-family="sans-serif">' + esc(lb) + '</text>';
  });
  series.forEach(function (se) {
    const pts = se.values.map(function (v, i) { return X(i).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' ');
    out += '<polyline points="' + pts + '" fill="none" stroke="' + se.color + '" stroke-width="' + (se.width || 2.6) + '" stroke-linejoin="round" stroke-linecap="round"' + (se.dash ? ' stroke-dasharray="6 5"' : '') + '/>';
    se.values.forEach(function (v, i) {
      out += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="' + (se.r || 4) + '" fill="' + se.color + '"/>';
      if (se.labelPoints) {
        out += '<text x="' + X(i).toFixed(1) + '" y="' + (Y(v) - 11).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + se.color + '" font-family="Georgia, serif">' + v + '</text>';
      }
    });
  });
  out += '</svg>';
  return out;
}

/* =========================================================
   4) 화면 렌더링
   ========================================================= */

function renderAll() {
  updateModeUI();
  renderReport();
  renderLibrary();
  renderGrowth();
  renderCompare();
  renderExpressions();
}

/* ---------- 리포트 ---------- */
function renderReport() {
  const s = currentSermon();
  const empty = $('#report-empty');
  const body = $('#report-body');
  if (!empty || !body) return;
  if (!s || !s.analysis) {
    empty.hidden = false;
    body.hidden = true;
    return;
  }
  empty.hidden = true;
  body.hidden = false;

  const a = s.analysis;
  $('#rp-eyebrow').textContent = (s.preacherRole === 'me' ? '내 설교' : '다른 설교자') + ' · ' + fmtDate(s.date);
  $('#rp-title').textContent = s.title;
  $('#rp-meta').textContent = [s.scripture, s.preacher].filter(Boolean).join(' · ');

  const badges = [];
  badges.push('<span class="badge">' + esc(a.formatDetected || (FORMATS[s.format] || FORMATS.auto).label) + '</span>');
  badges.push('<span class="badge">' + (s.language === 'en' ? '영어 설교' : '한국어 설교') + '</span>');
  badges.push('<span class="badge">' + (s.inputType === 'youtube' ? '유튜브 대본' : '설교 원고') + '</span>');
  if (s.youtubeUrl && /^https?:\/\//i.test(s.youtubeUrl)) {
    badges.push('<a class="badge" href="' + esc(s.youtubeUrl) + '" target="_blank" rel="noopener noreferrer">유튜브 원본 ↗</a>');
  }
  if (s.isReference) badges.push('<span class="badge ref">기준 설교</span>');
  $('#rp-badges').innerHTML = badges.join('');

  $('#rp-gauge').innerHTML = gaugeSVG(totalOf(a));

  renderCoaching(s);
  renderHighlight(s);
  renderRewritePanel(s);
  renderTranslate(s);
}

function renderCoaching(s) {
  const a = s.analysis;
  const total = totalOf(a);
  const theologyAvg = Math.round(areaAverage(a, 'theology') * 10);
  const deliveryAvg = Math.round(areaAverage(a, 'delivery') * 10);

  const scoreRows = ITEMS.map(function (it) {
    const v = Number(a.scores[it.key] || 0);
    return '<li class="score-item">' +
      '<div class="score-line">' +
        '<span class="score-name">' + esc(it.ko) + '</span>' +
        '<span class="score-area">' + esc(it.areaKo) + '</span>' +
        '<span class="score-val">' + v + '<span> / 10 · ' + Math.round(v * 10) + '점</span></span>' +
      '</div>' +
      '<div class="score-bar" role="img" aria-label="' + esc(it.ko) + ' ' + v + '점"><i class="' + scoreClass(v) + '" style="width:' + (v * 10) + '%"></i></div>' +
      (a.notes[it.key] ? '<p class="score-note">' + esc(a.notes[it.key]) + '</p>' : '') +
    '</li>';
  }).join('');

  const goodHTML = (a.goodPoints && a.goodPoints.length)
    ? '<ul class="point-list">' + a.goodPoints.map(function (p, i) { return goodPointHTML(s, p, i); }).join('') + '</ul>'
    : '<div class="empty-mini">기록된 잘한 점이 없습니다.</div>';

  const weakHTML = (a.weakPoints && a.weakPoints.length)
    ? '<ul class="point-list">' + a.weakPoints.map(function (p, i) { return weakPointHTML(s, p, i); }).join('') + '</ul>'
    : '<div class="empty-mini">기록된 아쉬운 점이 없습니다.</div>';

  let exprCard = '';
  const eg = a.expressionsGood || [], ea = a.expressionsAvoid || [];
  if (eg.length || ea.length) {
    exprCard = '<div class="card report-card"><h3>이 설교에서 건진 표현 <span class="sub">한 번 누르면 표현 모음에 담깁니다</span></h3>' +
      (eg.length ? '<p class="score-note" style="margin-bottom:.4rem">은혜와 복음을 잘 전한 표현</p>' + eg.map(function (t) {
        return '<div class="expr-item" style="margin-bottom:.5rem"><q>' + esc(t) + '</q><div class="expr-item-foot"><span class="expr-source">건져 올린 표현</span><button class="btn btn-ghost btn-small" data-save-expr="good" data-expr-text="' + esc(t) + '">담기</button></div></div>';
      }).join('') : '') +
      (ea.length ? '<p class="score-note" style="margin:.8rem 0 .4rem">피해야 할 · 주의할 표현</p>' + ea.map(function (t) {
        return '<div class="expr-item" style="margin-bottom:.5rem;border-left-color:var(--warn)"><q>' + esc(t) + '</q><div class="expr-item-foot"><span class="expr-source">주의할 표현</span><button class="btn btn-ghost btn-small" data-save-expr="avoid" data-expr-text="' + esc(t) + '">담기</button></div></div>';
      }).join('') : '') +
      '</div>';
  }

  $('#rpanel-coaching').innerHTML =
    '<div class="card report-card">' +
      '<h3>총평</h3>' +
      '<p class="summary-text">' + esc(a.summary || '총평이 없습니다.') + '</p>' +
      (a.formatReason ? '<p class="score-note" style="margin-top:.8rem"><strong>' + esc(a.formatDetected || '') + '</strong> — ' + esc(a.formatReason) + '</p>' : '') +
    '</div>' +

    '<div class="card report-card">' +
      '<h3>열 가지 항목 <span class="sub">신학·말씀 ' + theologyAvg + '점 · 전달·목회 ' + deliveryAvg + '점 · 총점 ' + total + '점</span></h3>' +
      '<div class="chart-wrap">' + radarSVG(scoreArray(a)) + '</div>' +
      '<ul class="score-list">' + scoreRows + '</ul>' +
    '</div>' +

    '<div class="card report-card">' +
      '<h3>잘한 점 <span class="sub">근거 문장과 이유</span></h3>' + goodHTML +
    '</div>' +

    '<div class="card report-card">' +
      '<h3>아쉬운 점 <span class="sub">문제 · 고칠 방법 · 고쳐 쓴 예 · 연습 과제</span></h3>' + weakHTML +
    '</div>' + exprCard;
}

function pointTag(kind, index) {
  return '<span class="point-tag">' + (kind === 'good' ? '잘한 점 ' + (index + 1) : '점검 ' + (index + 1)) + '</span>';
}

function goodPointHTML(s, p, i) {
  return '<li class="point good">' +
    '<div class="point-head">' + pointTag('good', i) + (p.item ? '<span class="point-item">' + esc(itemKo(p.item)) + '</span>' : '') + '</div>' +
    (p.quote ? '<blockquote class="quote">' + esc(p.quote) + '</blockquote>' : '') +
    '<div class="point-body">' + esc(p.reason || '') + '</div>' +
    '<div class="point-actions">' +
      '<button class="btn btn-ghost btn-small" data-save-expr="good" data-expr-text="' + esc(p.quote || p.reason || '') + '">표현 모음에 담기</button>' +
      (p.quote ? '<button class="btn btn-ghost btn-small" data-copy-point="good:' + i + '">문장 복사</button>' : '') +
    '</div>' +
  '</li>';
}

function weakPointHTML(s, p, i) {
  const rows = [];
  if (p.issue) rows.push('<dt>문제</dt><dd>' + esc(p.issue) + '</dd>');
  if (p.method) rows.push('<dt>써볼 방법</dt><dd>' + esc(p.method) + '</dd>');
  if (p.rewrite) rows.push('<dt>고쳐 쓴 예</dt><dd><span class="quote" style="display:block">' + esc(p.rewrite) + '</span></dd>');
  if (p.practice) rows.push('<dt>연습 과제</dt><dd>' + esc(p.practice) + '</dd>');
  return '<li class="point weak">' +
    '<div class="point-head">' + pointTag('weak', i) + (p.item ? '<span class="point-item">' + esc(itemKo(p.item)) + '</span>' : '') + '</div>' +
    (p.quote ? '<blockquote class="quote">' + esc(p.quote) + '</blockquote>' : '') +
    '<div class="point-body"><dl>' + rows.join('') + '</dl></div>' +
    '<div class="point-actions">' +
      '<button class="btn btn-ghost btn-small" data-save-expr="avoid" data-expr-text="' + esc(p.quote || p.issue || '') + '">주의 표현으로 담기</button>' +
      (p.rewrite ? '<button class="btn btn-ghost btn-small" data-copy-point="weak:' + i + '">고친 예 복사</button>' : '') +
    '</div>' +
  '</li>';
}

/* ---------- 원문 하이라이트 ---------- */
function isSkippable(ch) {
  if (/\s/.test(ch)) return true;
  return '.,!?;:\'"()[]{}<>·…~-—–_/\\`“”‘’'.indexOf(ch) !== -1;
}

function normalizeForMatch(text) {
  let out = '';
  const map = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isSkippable(ch)) continue;
    out += ch.toLowerCase();
    map.push(i);
  }
  return { text: out, map: map };
}

function locateQuote(full, quote) {
  if (!quote || !full) return null;
  const q = String(quote).trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, '');
  if (!q) return null;
  const exact = full.indexOf(q);
  if (exact >= 0) return { start: exact, end: exact + q.length };

  const nf = normalizeForMatch(full);
  const nq = normalizeForMatch(q).text;
  if (!nq) return null;
  const ni = nf.text.indexOf(nq);
  if (ni >= 0) return { start: nf.map[ni], end: nf.map[ni + nq.length - 1] + 1 };

  let lo = 6, hi = nq.length, best = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nf.text.indexOf(nq.slice(0, mid)) >= 0) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
  }
  if (best >= 12) {
    const i2 = nf.text.indexOf(nq.slice(0, best));
    return { start: nf.map[i2], end: nf.map[i2 + best - 1] + 1 };
  }
  lo = 6; hi = nq.length; best = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const sub = nq.slice(nq.length - mid);
    if (nf.text.indexOf(sub) >= 0) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
  }
  if (best >= 12) {
    const sub = nq.slice(nq.length - best);
    const i2 = nf.text.indexOf(sub);
    return { start: nf.map[i2], end: nf.map[i2 + best - 1] + 1 };
  }
  return null;
}

function buildHighlights(s) {
  const text = s.text || '';
  const a = s.analysis || {};
  const ranges = [];
  const unmatched = [];

  (a.goodPoints || []).forEach(function (p, i) {
    const r = locateQuote(text, p.quote);
    if (r) ranges.push({ start: r.start, end: r.end, kind: 'good', index: i, point: p });
    else if (p.quote) unmatched.push({ kind: 'good', index: i, point: p });
  });
  (a.weakPoints || []).forEach(function (p, i) {
    const r = locateQuote(text, p.quote);
    if (r) ranges.push({ start: r.start, end: r.end, kind: 'weak', index: i, point: p });
    else if (p.quote) unmatched.push({ kind: 'weak', index: i, point: p });
  });

  ranges.sort(function (x, y) { return x.start - y.start || y.end - x.end; });
  const kept = [];
  let lastEnd = -1;
  ranges.forEach(function (r) {
    if (r.start >= lastEnd) { kept.push(r); lastEnd = r.end; }
  });

  let html = '';
  let pos = 0;
  kept.forEach(function (r) {
    if (r.start > pos) html += esc(text.slice(pos, r.start));
    const label = (r.kind === 'good' ? 'G' : 'W') + (r.index + 1);
    html += '<mark class="hl ' + r.kind + '" data-kind="' + r.kind + '" data-index="' + r.index + '" tabindex="0" role="button" title="' + esc(itemKo(r.point.item) || (r.kind === 'good' ? '잘한 점' : '점검할 점')) + '">' +
      esc(text.slice(r.start, r.end)) + '<sup>' + label + '</sup></mark>';
    pos = r.end;
  });
  if (pos < text.length) html += esc(text.slice(pos));

  return { html: html, unmatched: unmatched, kept: kept };
}

function renderHighlight(s) {
  const built = buildHighlights(s);
  $('#rpanel-highlight').innerHTML =
    '<div class="card report-card">' +
      '<h3>원문 하이라이트 <span class="sub">색이 있는 문장을 누르면 코멘트가 열립니다</span></h3>' +
      '<div class="legend">' +
        '<span><i class="swatch good"></i> 잘한 문장</span>' +
        '<span><i class="swatch weak"></i> 점검할 문장</span>' +
      '</div>' +
      '<div class="highlight-layout">' +
        '<div class="text-view" id="highlight-text">' + (built.html || '<span style="color:#8a8578">본문이 없습니다.</span>') + '</div>' +
        '<div class="comment-panel" id="comment-panel">' +
          '<div class="comment-card"><h4>안내</h4><p>' +
            (built.kept.length ? '초록·주황으로 표시된 문장을 눌러 주세요. 오른쪽에 그 문장에 대한 코멘트와 고쳐 쓴 예가 나타납니다.' : '원문에서 근거 문장을 찾지 못했습니다. 코칭 리포트의 인용을 확인해 주세요.') +
          '</p></div>' +
        '</div>' +
      '</div>' +
      (built.unmatched.length ? '<p class="unmatched-note">원문에서 정확히 찾지 못한 인용 ' + built.unmatched.length + '건은 코칭 리포트에 그대로 남아 있습니다.</p>' : '') +
    '</div>';
}

function showComment(kind, index) {
  const s = currentSermon();
  if (!s) return;
  const list = kind === 'good' ? s.analysis.goodPoints : s.analysis.weakPoints;
  const p = list && list[index];
  if (!p) return;

  $$('mark.hl').forEach(function (m) { m.classList.remove('is-active'); });
  const sel = 'mark.hl[data-kind="' + kind + '"][data-index="' + index + '"]';
  const mark = document.querySelector(sel);
  if (mark) mark.classList.add('is-active');

  const panel = $('#comment-panel');
  if (!panel) return;
  let inner = '';
  if (kind === 'good') {
    inner = '<div class="comment-card good">' +
      '<h4>잘한 문장 · ' + esc(itemKo(p.item) || '칭찬') + '</h4>' +
      (p.quote ? '<blockquote class="quote">' + esc(p.quote) + '</blockquote>' : '') +
      '<p>' + esc(p.reason || '') + '</p>' +
      '<button class="btn btn-ghost btn-small" data-save-expr="good" data-expr-text="' + esc(p.quote || p.reason || '') + '">표현 모음에 담기</button>' +
    '</div>';
  } else {
    inner = '<div class="comment-card weak">' +
      '<h4>점검할 문장 · ' + esc(itemKo(p.item) || '개선') + '</h4>' +
      (p.quote ? '<blockquote class="quote">' + esc(p.quote) + '</blockquote>' : '') +
      (p.issue ? '<p><strong>문제</strong> — ' + esc(p.issue) + '</p>' : '') +
      (p.method ? '<p><strong>써볼 방법</strong> — ' + esc(p.method) + '</p>' : '') +
      (p.rewrite ? '<p><strong>고쳐 쓴 예</strong></p><blockquote class="quote">' + esc(p.rewrite) + '</blockquote>' : '') +
      (p.practice ? '<p><strong>연습</strong> — ' + esc(p.practice) + '</p>' : '') +
    '</div>';
  }
  panel.innerHTML = inner;
}

/* ---------- 다시 쓰기 · 형식 변환 ---------- */
function renderRewritePanel(s) {
  const a = s.analysis || {};
  const canApi = !!apiKeyFor(activeProvider());
  const label = canApi ? ('AI로 실행 (' + apiModelFor(activeProvider()) + ')') : '다시 쓰기 프롬프트 복사';
  const copyBtn = canApi ? '<button class="btn btn-outline" data-copy-rewrite="healthy">프롬프트만 복사</button>' : '';
  const fmtOptions = ['expository', 'onepoint', 'series', 'topical'].map(function (k) {
    return '<option value="' + k + '">' + FORMATS[k].label + '</option>';
  }).join('');

  $('#rpanel-rewrite').innerHTML =
    '<div class="card report-card">' +
      '<h3>건강한 설교로 다시 쓰기 <span class="sub">코칭을 반영한 완성 원고</span></h3>' +
      '<p class="score-note">아쉬운 점을 고치고 좋은 문장은 살린 새 원고를 받아 봅니다. 무료 모드에서는 프롬프트를 복사해 AI에 붙여넣고 결과를 다시 붙여넣으세요.</p>' +
      '<div class="btn-row">' +
        '<button class="btn btn-primary" data-rewrite="healthy">' + label + '</button>' +
        copyBtn +
      '</div>' +
      '<div class="status" id="rewrite-status"></div>' +
    '</div>' +

    '<div class="card report-card">' +
      '<h3>형식 바꿔 써보기 <span class="sub">대지 · 원포인트 · 연속 강해 · 주제</span></h3>' +
      '<div class="convert-row">' +
        '<select id="convert-format" aria-label="바꿀 설교 형식">' + fmtOptions + '</select>' +
        '<button class="btn btn-primary" data-rewrite="format">' + (canApi ? 'AI로 실행' : '형식 변환 프롬프트 복사') + '</button>' +
        (canApi ? '<button class="btn btn-outline" data-copy-rewrite="format">프롬프트만 복사</button>' : '') +
      '</div>' +
      '<div class="status" id="convert-status"></div>' +
    '</div>' +

    '<div class="card report-card" id="rewrite-paste-card" hidden>' +
      '<h3>결과 붙여넣기 <span class="sub" id="rewrite-paste-label"></span></h3>' +
      '<p class="score-note">복사한 프롬프트를 ChatGPT·Claude에 붙여넣고, 돌아온 원고를 아래에 그대로 붙여넣으세요.</p>' +
      '<textarea id="rewrite-paste" rows="8" placeholder="다시 쓴 설교 원고 전문을 붙여넣으세요."></textarea>' +
      '<div class="btn-row">' +
        '<button class="btn btn-primary" data-save-rewrite-paste="1">이 원고 저장</button>' +
        '<button class="btn btn-ghost" data-cancel-rewrite-paste="1">닫기</button>' +
      '</div>' +
    '</div>' +

    '<div id="rewrite-results">' + rewriteResultsHTML(s) + '</div>';
}

function rewriteResultsHTML(s) {
  const a = s.analysis || {};
  let out = '';
  if (a.rewriteHealthy) {
    out += '<div class="card report-card rewrite-block"><h4>건강한 설교로 다시 쓴 원고</h4>' +
      '<div class="rewrite-text">' + esc(a.rewriteHealthy) + '</div>' +
      '<div class="btn-row"><button class="btn btn-outline btn-small" data-copy-block="healthy">복사</button>' +
      '<button class="btn btn-ghost btn-small" data-del-block="healthy">지우기</button></div></div>';
  }
  Object.keys(a.conversions || {}).forEach(function (k) {
    const text = a.conversions[k];
    if (!text) return;
    const name = (FORMATS[k] || {}).label || k;
    out += '<div class="card report-card rewrite-block"><h4>' + esc(name) + ' 형식으로 다시 쓴 원고</h4>' +
      '<div class="rewrite-text">' + esc(text) + '</div>' +
      '<div class="btn-row"><button class="btn btn-outline btn-small" data-copy-block="format:' + esc(k) + '">복사</button>' +
      '<button class="btn btn-ghost btn-small" data-del-block="format:' + esc(k) + '">지우기</button></div></div>';
  });
  if (!out) out = '<div class="empty-mini">아직 다시 쓴 원고가 없습니다.</div>';
  return out;
}

function saveRewriteResult(s, mode, text) {
  if (!text) { toast('원고가 비어 있습니다.', true); return; }
  s.analysis = s.analysis || {};
  if (mode === 'healthy') s.analysis.rewriteHealthy = text;
  else s.analysis.conversions = s.analysis.conversions || {}, s.analysis.conversions[mode.replace('format:', '')] = text;
  saveState();
  $('#rewrite-results').innerHTML = rewriteResultsHTML(s);
  $('#rewrite-status').innerHTML = '<span class="status ok">저장했습니다.</span>';
  toast('다시 쓴 원고를 저장했습니다.');
}

async function doRewrite(kind, forcePrompt) {
  const s = currentSermon();
  if (!s) return;
  const formatKey = kind === 'format' ? (($('#convert-format') || {}).value || 'expository') : null;
  const mode = kind === 'format' ? 'format:' + formatKey : 'healthy';
  const prompt = buildRewritePrompt(s, mode);
  const canApi = !!apiKeyFor(activeProvider());
  const statusEl = $(kind === 'format' ? '#convert-status' : '#rewrite-status');

  if (forcePrompt || !canApi) {
    await copyText(prompt, '다시 쓰기 프롬프트를 복사했습니다.');
    rewriteTarget = mode;
    const card = $('#rewrite-paste-card');
    if (card) {
      card.hidden = false;
      $('#rewrite-paste-label').textContent = mode === 'healthy' ? '건강한 설교' : ((FORMATS[formatKey] || {}).label || '');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const ta = $('#rewrite-paste');
      if (ta) ta.focus();
    }
    return;
  }

  if (statusEl) statusEl.innerHTML = '<span class="spinner"></span>AI가 원고를 쓰고 있습니다. 잠시 기다려 주세요.';
  try {
    const out = await callAI(prompt, { json: false, maxTokens: 4000 });
    saveRewriteResult(s, mode, String(out || '').trim());
    if (statusEl) statusEl.textContent = '';
  } catch (err) {
    if (statusEl) statusEl.innerHTML = '<span class="err">' + esc(err.message) + '</span>';
    toast(err.message, true);
  }
}

/* ---------- 번역 대조 ---------- */
function renderTranslate(s) {
  const a = s.analysis || {};
  const list = a.translations || [];
  let inner;
  if (!list.length) {
    inner = '<div class="empty-mini">' + (s.language === 'en'
      ? '문장별 번역이 없습니다. 영어 설교를 분석하면 원문과 한글 번역이 문장 단위로 함께 저장됩니다.'
      : '한국어 설교입니다. 영어 설교를 분석하면 이 탭에 문장별 원문 ↔ 한글 번역 대조가 나타납니다.') + '</div>';
  } else {
    inner = '<table class="translate-table"><thead><tr><th>원문</th><th>한글 번역</th></tr></thead><tbody>' +
      list.map(function (t) {
        return '<tr><td class="orig">' + esc(t.original) + '</td><td>' + esc(t.korean) + '</td></tr>';
      }).join('') +
      '</tbody></table>';
  }
  $('#rpanel-translate').innerHTML =
    '<div class="card report-card">' +
      '<h3>문장별 번역 대조 <span class="sub">' + list.length + '문장</span></h3>' + inner +
    '</div>';
}

/* ---------- 서재 ---------- */
function filteredSermons() {
  let list = state.sermons.slice();
  if (libFilter === 'me') list = list.filter(function (s) { return s.preacherRole === 'me'; });
  if (libFilter === 'other') list = list.filter(function (s) { return s.preacherRole !== 'me'; });
  if (libQuery) {
    const q = libQuery.toLowerCase();
    list = list.filter(function (s) {
      return ((s.title || '') + ' ' + (s.scripture || '') + ' ' + (s.preacher || '') + ' ' + (s.text || '')).toLowerCase().indexOf(q) !== -1;
    });
  }
  list.sort(function (a, b) {
    if (libSort === 'score-desc') return totalOf(b.analysis) - totalOf(a.analysis);
    if (libSort === 'date-asc') return String(a.date).localeCompare(String(b.date));
    return String(b.date).localeCompare(String(a.date));
  });
  return list;
}

function renderLibrary() {
  const host = $('#library-list');
  if (!host) return;
  const list = filteredSermons();
  if (!list.length) {
    host.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-mark">◇</div><h2>해당하는 설교가 없습니다</h2><p>검색어나 필터를 바꾸거나, 새 설교를 분석해 보세요.</p></div>';
    return;
  }
  host.innerHTML = list.map(function (s) {
    const a = s.analysis || {};
    const total = totalOf(a);
    const excerpt = (s.text || '').replace(/\s+/g, ' ').slice(0, 90);
    return '<article class="sermon-card' + (s.isReference ? ' is-reference' : '') + '">' +
      '<div class="card-top">' +
        '<h3>' + esc(s.title) + '</h3>' +
        '<div class="mini-score">' + total + '<small>점</small></div>' +
      '</div>' +
      '<div class="sermon-meta">' +
        '<span>' + fmtDate(s.date) + '</span>' +
        '<span>' + esc(s.scripture || '본문 미기재') + '</span>' +
        '<span>' + (s.preacherRole === 'me' ? '내 설교' : esc(s.preacher || '다른 설교자')) + '</span>' +
      '</div>' +
      '<div class="sermon-meta"><span class="badge">' + esc((a.formatDetected || (FORMATS[s.format] || FORMATS.auto).label)) + '</span>' +
        (s.isReference ? '<span class="badge ref">기준 설교</span>' : '') + '</div>' +
      '<p class="sermon-excerpt">' + esc(excerpt) + '…</p>' +
      '<div class="card-foot">' +
        '<button class="btn btn-primary btn-small" data-open="' + s.id + '">리포트 열기</button>' +
        '<button class="btn btn-outline btn-small" data-ref="' + s.id + '">' + (s.isReference ? '기준 해제' : '기준 설교로 지정') + '</button>' +
        '<button class="btn btn-ghost btn-small" data-del="' + s.id + '">삭제</button>' +
      '</div>' +
    '</article>';
  }).join('');
}

/* ---------- 성장 그래프 ---------- */
function renderGrowth() {
  const card = $('#growth-card');
  const insight = $('#growth-insight');
  if (!card) return;
  const mine = mySermons().filter(function (s) { return s.analysis; })
    .sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });

  if (!mine.length) {
    card.innerHTML = '<div class="empty-mini">내 설교를 두 편 이상 분석하면 성장 그래프가 그려집니다.</div>';
    insight.innerHTML = '';
    return;
  }

  const labels = mine.map(function (s) { return shortDate(s.date); });
  const series = [
    { label: '총점', color: '#1d2c47', values: mine.map(function (s) { return totalOf(s.analysis); }), labelPoints: mine.length <= 8 },
    { label: '신학·말씀 평균', color: '#a8823c', dash: true, values: mine.map(function (s) { return Math.round(areaAverage(s.analysis, 'theology') * 10); }) },
    { label: '전달·목회 평균', color: '#7a2333', dash: true, values: mine.map(function (s) { return Math.round(areaAverage(s.analysis, 'delivery') * 10); }) }
  ];

  card.innerHTML = '<div class="line-chart">' + lineChartSVG(series, labels) + '</div>' +
    '<div class="chart-legend">' + series.map(function (se) {
      return '<span><i style="background:' + se.color + '"></i>' + se.label + '</span>';
    }).join('') + '</div>';

  const first = mine[0], last = mine[mine.length - 1];
  const delta = totalOf(last.analysis) - totalOf(first.analysis);

  const avgByItem = ITEMS.map(function (it) {
    let sum = 0;
    mine.forEach(function (s) { sum += Number(s.analysis.scores[it.key] || 0); });
    return { it: it, avg: round1(sum / mine.length) };
  }).sort(function (a, b) { return b.avg - a.avg; });

  const strongest = avgByItem[0], weakest = avgByItem[avgByItem.length - 1];

  let changeText;
  if (mine.length === 1) changeText = '첫 설교가 기록되었습니다. 다음 설교를 분석하면 변화가 보입니다.';
  else if (delta > 0) changeText = '처음 설교보다 총점이 ' + delta + '점 올랐습니다.';
  else if (delta < 0) changeText = '처음 설교보다 총점이 ' + Math.abs(delta) + '점 내려갔습니다. 어느 항목이 흔들렸는지 살펴보세요.';
  else changeText = '처음 설교와 총점이 같습니다. 항목별 변화를 함께 보세요.';

  insight.innerHTML =
    '<h3>지금 내 설교의 자리</h3>' +
    '<div class="insight-grid">' +
      '<div class="insight-box"><b>' + totalOf(last.analysis) + '</b><span>최근 설교 총점 · ' + esc(last.title) + '</span></div>' +
      '<div class="insight-box"><b>' + (delta > 0 ? '+' : '') + delta + '</b><span>처음 설교 대비 총점 변화</span></div>' +
      '<div class="insight-box"><b>' + avgByItem[0].avg + '</b><span>가장 강한 항목 · ' + esc(strongest.it.ko) + '</span></div>' +
      '<div class="insight-box"><b>' + avgByItem[avgByItem.length - 1].avg + '</b><span>가장 머무는 항목 · ' + esc(weakest.it.ko) + '</span></div>' +
    '</div>' +
    '<p class="score-note" style="margin-top:1rem">' + esc(changeText) + ' 평균 ' + mine.length + '편 기준이며, 다음 설교에서 ' + esc(weakest.it.ko) + ' 항목을 한 가지 연습 과제로 잡아 보시면 좋겠습니다.</p>';
}

/* ---------- 기준 설교자 비교 ---------- */
let compareRefId = null;
let compareMineId = null;

function renderCompare() {
  const refSel = $('#cmp-reference');
  const mineSel = $('#cmp-mine');
  const body = $('#compare-body');
  if (!refSel || !mineSel || !body) return;

  const refPool = state.sermons.filter(function (s) {
    return s.analysis && (s.isReference || s.preacherRole !== 'me');
  });
  const minePool = mySermons().filter(function (s) { return s.analysis; });

  if (!refPool.length || !minePool.length) {
    refSel.innerHTML = '<option value="">기준 설교 없음</option>';
    mineSel.innerHTML = '<option value="">내 설교 없음</option>';
    body.innerHTML = '<div class="empty-state"><div class="empty-mark">⇄</div><h2>비교할 설교가 아직 없습니다</h2>' +
      '<p>서재에 내 설교와 다른 설교자(기준) 설교가 각각 한 편 이상 있어야 합니다. 서재에서 다른 설교자를 분석하고 <strong>기준 설교로 지정</strong>해 보세요.</p>' +
      '<div class="btn-row center"><button class="btn btn-primary" data-goto="library">설교 서재로</button><button class="btn btn-outline" data-goto="analyze">새 설교 분석</button></div></div>';
    return;
  }

  if (!compareRefId || !refPool.some(function (s) { return s.id === compareRefId; })) compareRefId = refPool[0].id;
  if (!compareMineId || !minePool.some(function (s) { return s.id === compareMineId; })) compareMineId = minePool[minePool.length - 1].id;

  refSel.innerHTML = refPool.map(function (s) {
    return '<option value="' + s.id + '"' + (s.id === compareRefId ? ' selected' : '') + '>' + esc(s.title) + ' · ' + esc(s.preacher || '다른 설교자') + ' (' + fmtDate(s.date) + ')</option>';
  }).join('');
  mineSel.innerHTML = minePool.map(function (s) {
    return '<option value="' + s.id + '"' + (s.id === compareMineId ? ' selected' : '') + '>' + esc(s.title) + ' (' + fmtDate(s.date) + ')</option>';
  }).join('');

  const ref = getSermon(compareRefId);
  const mine = getSermon(compareMineId);
  if (!ref || !mine) return;

  const rows = ITEMS.map(function (it) {
    const m = Number(mine.analysis.scores[it.key] || 0);
    const r = Number(ref.analysis.scores[it.key] || 0);
    const d = round1(m - r);
    const cls = d > 0 ? 'diff-up' : (d < 0 ? 'diff-down' : 'diff-zero');
    const txt = d > 0 ? '+' + d : String(d);
    return '<tr><td>' + esc(it.ko) + '</td><td class="num">' + m + '</td><td class="num">' + r + '</td><td class="num ' + cls + '">' + txt + '</td></tr>';
  }).join('');

  const gaps = ITEMS.map(function (it) {
    return { it: it, diff: round1(Number(mine.analysis.scores[it.key] || 0) - Number(ref.analysis.scores[it.key] || 0)) };
  });
  const behind = gaps.filter(function (g) { return g.diff < 0; }).sort(function (a, b) { return a.diff - b.diff; }).slice(0, 3);
  const ahead = gaps.filter(function (g) { return g.diff > 0; }).sort(function (a, b) { return b.diff - a.diff; }).slice(0, 3);

  const refLessons = (ref.analysis.lessons || []);
  let lessonInner = '';
  if (refLessons.length) {
    lessonInner = '<ul class="lesson-list">' + refLessons.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>';
  } else if (behind.length) {
    lessonInner = '<p>' + behind.map(function (g) { return esc(g.it.ko) + '(' + g.diff + ')'; }).join(', ') +
      ' 항목에서 기준 설교가 앞서 있습니다. 그 항목의 기준 설교 문장을 다시 읽어 보세요.</p>';
  } else {
    lessonInner = '<p>이 설교에서는 기준 설교보다 낮은 항목이 없습니다. 기준 설교의 다른 설교를 골라 비교해 보세요.</p>';
  }

  body.innerHTML =
    '<div class="compare-grid">' +
      '<div>' +
        '<div class="cmp-heads">' +
          '<div><b>' + esc(mine.title) + '</b>내 설교 · 총점 ' + totalOf(mine.analysis) + '점</div>' +
          '<div style="text-align:right"><b>' + esc(ref.title) + '</b>' + esc(ref.preacher || '기준 설교자') + ' · 총점 ' + totalOf(ref.analysis) + '점</div>' +
        '</div>' +
        '<div class="chart-wrap">' + radarSVG(scoreArray(mine.analysis), { second: scoreArray(ref.analysis) }) + '</div>' +
        '<div class="chart-legend">' +
          '<span><i style="background:#1d2c47"></i>내 설교</span>' +
          '<span><i style="background:#7a2333"></i>기준 설교</span>' +
        '</div>' +
      '</div>' +
      '<div>' +
        '<table class="cmp-table"><thead><tr><th>항목</th><th>내 설교</th><th>기준</th><th>차이</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<div style="margin-top:1.2rem">' +
          '<h3 style="font-size:1.1rem">배울 점 요약</h3>' + lessonInner +
          (ahead.length ? '<p class="score-note" style="margin-top:.7rem">내가 앞선 항목: ' + ahead.map(function (g) { return esc(g.it.ko) + '(+' + g.diff + ')'; }).join(', ') + '</p>' : '') +
          (behind.length ? '<p class="score-note">보완할 항목: ' + behind.map(function (g) { return esc(g.it.ko) + '(' + g.diff + ')'; }).join(', ') + '</p>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ---------- 표현 모음 ---------- */
function renderExpressions() {
  const goodHost = $('#expr-list-good');
  const avoidHost = $('#expr-list-avoid');
  if (!goodHost || !avoidHost) return;
  const good = state.expressions.filter(function (e) { return e.kind === 'good'; });
  const avoid = state.expressions.filter(function (e) { return e.kind !== 'good'; });

  function itemHTML(e) {
    return '<div class="expr-item">' +
      '<q>' + esc(e.text) + '</q>' +
      (e.note ? '<div class="expr-note">' + esc(e.note) + '</div>' : '') +
      '<div class="expr-item-foot"><span class="expr-source">' + esc(e.source || '직접 추가') + '</span>' +
      '<button class="expr-del" data-expr-del="' + e.id + '" aria-label="삭제">삭제</button></div>' +
    '</div>';
  }

  goodHost.innerHTML = good.length ? good.map(itemHTML).join('') : '<div class="empty-mini">아직 담은 표현이 없습니다.</div>';
  avoidHost.innerHTML = avoid.length ? avoid.map(itemHTML).join('') : '<div class="empty-mini">아직 담은 표현이 없습니다.</div>';
}

/* ---------- 모드 · 설정 ---------- */
function updateModeUI() {
  $$('.mode-btn').forEach(function (b) { b.classList.toggle('is-active', b.dataset.mode === uiMode); });
  const free = $('#free-panel'), api = $('#api-panel');
  if (free) free.hidden = uiMode !== 'free';
  if (api) api.hidden = uiMode !== 'api';
  const hint = $('#api-hint');
  const key = apiKeyFor(activeProvider());
  const runBtn = $('#btn-run-api');
  if (runBtn) runBtn.disabled = !key;
  if (hint) {
    hint.textContent = key
      ? (activeProvider() === 'anthropic' ? 'Anthropic ' : 'OpenAI ') + apiModelFor(activeProvider()) + ' 모델로 분석합니다. 키는 이 브라우저에만 저장되어 있습니다.'
      : '설정에서 API 키를 입력하면 원클릭 분석이 활성화됩니다. 키는 이 브라우저에만 저장되고, 분석할 때 선택한 AI 제공자에게만 직접 전송됩니다.';
  }
}

function persistPayload() {
  const copy = JSON.parse(JSON.stringify(state));
  if (!copy.settings.rememberKey) {
    copy.settings.openaiKey = '';
    copy.settings.anthropicKey = '';
  }
  return copy;
}

/* =========================================================
   5) 입력 · 실행 · 이벤트
   ========================================================= */

async function copyText(text, okMsg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg || '복사했습니다.');
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
    ta.remove();
    if (ok) toast(okMsg || '복사했습니다.');
    else toast('복사하지 못했습니다. 프롬프트를 직접 선택해 복사해 주세요.', true);
    return ok;
  }
}

function setStatus(sel, msg, cls) {
  const el = $(sel);
  if (!el) return;
  el.className = 'status' + (cls ? ' ' + cls : '');
  el.innerHTML = msg;
}

function collectInput() {
  const title = ($('#f-title').value || '').trim();
  const text = ($('#f-text').value || '').trim();
  if (!title) { toast('설교 제목을 입력해 주세요.', true); $('#f-title').focus(); return null; }
  if (text.length < 80) { toast('설교 본문을 80자 이상 붙여넣어 주세요.', true); $('#f-text').focus(); return null; }
  return {
    title: title,
    text: text,
    preacherRole: $('#f-role').value,
    preacher: ($('#f-preacher').value || '').trim(),
    date: $('#f-date').value || todayISO(),
    scripture: ($('#f-scripture').value || '').trim(),
    language: $('#f-language').value,
    inputType: $('#f-inputtype').value,
    youtubeUrl: ($('#f-youtube').value || '').trim(),
    format: $('#f-format').value
  };
}

function updateFormatGuide() {
  const sel = $('#f-format');
  const host = $('#format-guide');
  if (!sel || !host) return;
  const f = FORMATS[sel.value] || FORMATS.auto;
  host.innerHTML = '<h4>' + esc(f.label) + ' 평가 기준</h4><p>' + esc(f.intro) + '</p><ul>' +
    f.criteria.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>';
}

async function copyAnalysisPrompt() {
  const input = collectInput();
  if (!input) return;
  const prompt = buildAnalysisPrompt(input);
  const ok = await copyText(prompt, '분석용 프롬프트를 복사했습니다. ChatGPT·Claude에 붙여넣으세요.');
  if (ok) setStatus('#parse-status', '프롬프트가 복사되었습니다. AI의 응답을 아래에 붙여넣고 <strong>[결과 불러오기 &amp; 저장]</strong>을 누르세요.', 'ok');
}

function applyRawAnalysis(input, raw, statusSel) {
  const parsed = extractJson(raw);
  if (!parsed) {
    setStatus(statusSel, '응답에서 JSON을 찾지 못했습니다. AI가 돌려준 응답 전체를 그대로 붙여넣었는지 확인해 주세요.', 'err');
    return false;
  }
  let analysis;
  try {
    analysis = normalizeAnalysis(parsed, input);
  } catch (err) {
    setStatus(statusSel, esc(err.message), 'err');
    return false;
  }
  const sermon = makeSermonFromInput(input, analysis);
  state.sermons.push(sermon);
  state.currentId = sermon.id;
  saveState();
  setStatus(statusSel, '저장했습니다 — 총점 ' + totalOf(analysis) + '점. 리포트로 이동합니다.', 'ok');
  $('#paste-response').value = '';
  activateTab('report');
  setReportTab('coaching');
  renderAll();
  toast('분석 결과를 저장했습니다 · 총점 ' + totalOf(analysis) + '점');
  return true;
}

function importFromPaste() {
  const input = collectInput();
  if (!input) return;
  const raw = ($('#paste-response').value || '').trim();
  if (!raw) {
    setStatus('#parse-status', 'AI의 응답을 먼저 아래에 붙여넣어 주세요.', 'err');
    return;
  }
  applyRawAnalysis(input, raw, '#parse-status');
}

async function runApiAnalysis() {
  const input = collectInput();
  if (!input) return;
  if (!apiKeyFor(activeProvider())) {
    toast('설정에서 API 키를 먼저 입력해 주세요.', true);
    openSettings();
    return;
  }
  const btn = $('#btn-run-api');
  if (btn) btn.disabled = true;
  setStatus('#api-status', '<span class="spinner"></span>' + esc(apiModelFor(activeProvider())) + ' 모델로 분석 중입니다. 1~2분 걸릴 수 있습니다.', 'busy');
  try {
    const rawText = await callAI(buildAnalysisPrompt(input), { maxTokens: 8000 });
    const parsed = extractJson(rawText);
    if (!parsed) throw new Error('응답에서 JSON을 해석하지 못했습니다. 다시 시도해 주세요.');
    const analysis = normalizeAnalysis(parsed, input);
    const sermon = makeSermonFromInput(input, analysis);
    state.sermons.push(sermon);
    state.currentId = sermon.id;
    saveState();
    setStatus('#api-status', '분석 완료 — 총점 ' + totalOf(analysis) + '점. 리포트로 이동합니다.', 'ok');
    activateTab('report');
    setReportTab('coaching');
    renderAll();
    toast('분석 결과를 저장했습니다 · 총점 ' + totalOf(analysis) + '점');
  } catch (err) {
    setStatus('#api-status', esc(err.message), 'err');
    toast(err.message, true);
  } finally {
    if (btn) btn.disabled = false;
  }
}

function activateTab(name) {
  $$('.tab').forEach(function (t) { t.classList.toggle('is-active', t.dataset.tab === name); });
  $$('.panel').forEach(function (p) { p.classList.toggle('is-active', p.id === 'tab-' + name); });
  if (name === 'report') renderReport();
  if (name === 'library') renderLibrary();
  if (name === 'growth') renderGrowth();
  if (name === 'compare') renderCompare();
  if (name === 'expressions') renderExpressions();
  if (name === 'analyze') updateModeUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setReportTab(name) {
  currentReportTab = name;
  $$('.rtab').forEach(function (b) { b.classList.toggle('is-active', b.dataset.rtab === name); });
  $$('.rpanel').forEach(function (p) { p.classList.toggle('is-active', p.id === 'rpanel-' + name); });
}

function addExpression(kind, text, source) {
  text = (text || '').trim();
  if (!text) { toast('담을 표현이 비어 있습니다.', true); return; }
  const exists = state.expressions.some(function (e) { return e.kind === kind && e.text === text; });
  if (exists) { toast('이미 담겨 있는 표현입니다.'); return; }
  state.expressions.unshift({
    id: uid('ex'),
    kind: kind === 'good' ? 'good' : 'avoid',
    text: text,
    note: '',
    source: source ? ('설교 · ' + source) : '리포트',
    createdAt: new Date().toISOString()
  });
  saveState();
  renderExpressions();
  toast(kind === 'good' ? '은혜의 표현으로 담았습니다.' : '주의할 표현으로 담았습니다.');
}

function toggleReference(id) {
  const s = getSermon(id);
  if (!s) return;
  if (s.isReference) {
    s.isReference = false;
    toast('기준 지정을 해제했습니다.');
  } else {
    state.sermons.forEach(function (x) { x.isReference = false; });
    s.isReference = true;
    compareRefId = s.id;
    toast('「' + s.title + '」을(를) 기준 설교로 지정했습니다.');
  }
  saveState();
  renderAll();
}

function deleteSermon(id) {
  const s = getSermon(id);
  if (!s) return;
  if (!confirm('「' + s.title + '」 설교를 서재에서 삭제할까요? 되돌릴 수 없습니다.')) return;
  state.sermons = state.sermons.filter(function (x) { return x.id !== id; });
  if (state.currentId === id) {
    state.currentId = state.sermons.length ? state.sermons[state.sermons.length - 1].id : null;
  }
  saveState();
  renderAll();
  toast('삭제했습니다.');
}

function deleteBlock(kind) {
  const s = currentSermon();
  if (!s) return;
  if (!confirm('이 원고를 지울까요? 다시 생성할 수 있습니다.')) return;
  if (kind === 'healthy') s.analysis.rewriteHealthy = '';
  else s.analysis.conversions[kind.replace('format:', '')] = '';
  saveState();
  $('#rewrite-results').innerHTML = rewriteResultsHTML(s);
  toast('지웠습니다.');
}

/* ---------- 설정 ---------- */
function openSettings() {
  const st = state.settings;
  $('#set-openai-key').value = st.openaiKey || '';
  $('#set-openai-model').value = st.openaiModel || 'gpt-4o-mini';
  $('#set-anthropic-key').value = st.anthropicKey || '';
  $('#set-anthropic-model').value = st.anthropicModel || 'claude-sonnet-4-5';
  $('#set-remember-key').checked = st.rememberKey !== false;
  settingsProvider = st.provider || 'openai';
  updateProviderUI();
  $('#modal-settings').hidden = false;
  document.body.style.overflow = 'hidden';
  setStatus('#settings-status', '', '');
}

function closeSettings() {
  $('#modal-settings').hidden = true;
  document.body.style.overflow = '';
}

function updateProviderUI() {
  $$('.seg-btn').forEach(function (b) { b.classList.toggle('is-active', b.dataset.provider === settingsProvider); });
  const o = $('#provider-openai'), a = $('#provider-anthropic');
  if (o) o.hidden = settingsProvider !== 'openai';
  if (a) a.hidden = settingsProvider !== 'anthropic';
}

function readSettingsForm() {
  const st = state.settings;
  st.provider = settingsProvider;
  st.openaiKey = ($('#set-openai-key').value || '').trim();
  st.openaiModel = ($('#set-openai-model').value || '').trim() || 'gpt-4o-mini';
  st.anthropicKey = ($('#set-anthropic-key').value || '').trim();
  st.anthropicModel = ($('#set-anthropic-model').value || '').trim() || 'claude-sonnet-4-5';
  st.rememberKey = $('#set-remember-key').checked;
}

function saveSettings() {
  readSettingsForm();
  saveState();
  updateModeUI();
  renderReport();
  setStatus('#settings-status', '설정을 저장했습니다. 키는 이 브라우저에만 보관됩니다.', 'ok');
  toast('설정을 저장했습니다.');
}

async function testApi() {
  readSettingsForm();
  const provider = settingsProvider;
  if (!apiKeyFor(provider)) {
    setStatus('#settings-status', 'API 키를 먼저 입력해 주세요.', 'err');
    return;
  }
  setStatus('#settings-status', '<span class="spinner"></span>연결을 확인하는 중입니다.', 'busy');
  try {
    const msg = await testApiConnection();
    setStatus('#settings-status', esc(msg), 'ok');
  } catch (err) {
    setStatus('#settings-status', esc(err.message) + ' — 키와 모델 이름을 확인해 주세요. 브라우저에서 직접 호출이 막히는 경우도 있습니다.', 'err');
  }
}

/* ---------- 백업 · 복원 ---------- */
function exportData() {
  const data = {
    app: 'methuselah-teaching',
    version: 1,
    exportedAt: new Date().toISOString(),
    sermons: state.sermons,
    expressions: state.expressions,
    settings: {
      provider: state.settings.provider,
      openaiModel: state.settings.openaiModel,
      anthropicModel: state.settings.anthropicModel
    }
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'methuselah-teaching-' + todayISO() + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  toast('JSON 파일로 내보냈습니다.');
  setStatus('#data-status', '설교 ' + state.sermons.length + '편, 표현 ' + state.expressions.length + '개를 내보냈습니다.', 'ok');
}

function importDataFromFile(file) {
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const data = JSON.parse(String(reader.result));
      let sermons = Array.isArray(data) ? data : (data.sermons || []);
      if (!Array.isArray(sermons)) throw new Error('파일에서 설교 목록을 찾지 못했습니다.');
      sermons = sermons.filter(function (s) { return s && s.id && s.analysis; }).map(function (s) {
        s.analysis = Object.assign({ scores: {}, notes: {}, goodPoints: [], weakPoints: [], conversions: {}, translations: [] }, s.analysis);
        return s;
      });
      if (!sermons.length) throw new Error('가져올 설교가 없습니다.');
      if (!confirm('지금 서재의 자료를 가져온 파일(' + sermons.length + '편)로 대체합니다. 계속할까요?')) return;
      state.sermons = sermons;
      state.expressions = Array.isArray(data.expressions) ? data.expressions : [];
      if (data.settings) {
        state.settings.provider = data.settings.provider || state.settings.provider;
        state.settings.openaiModel = data.settings.openaiModel || state.settings.openaiModel;
        state.settings.anthropicModel = data.settings.anthropicModel || state.settings.anthropicModel;
      }
      state.currentId = sermons[0].id;
      saveState();
      renderAll();
      setStatus('#data-status', sermons.length + '편의 설교와 ' + state.expressions.length + '개의 표현을 가져왔습니다.', 'ok');
      toast('자료를 가져왔습니다.');
    } catch (err) {
      setStatus('#data-status', '가져오지 못했습니다: ' + esc(err.message), 'err');
    }
  };
  reader.readAsText(file);
}

function restoreSamples() {
  if (!confirm('샘플 데이터로 되돌립니다. 지금 서재의 자료는 사라집니다. 계속할까요?')) return;
  state = sampleState();
  saveState();
  renderAll();
  setStatus('#data-status', '샘플 데이터 3편과 표현 모음을 복원했습니다.', 'ok');
  toast('샘플 데이터를 복원했습니다.');
}

function resetAll() {
  if (!confirm('서재의 모든 설교와 표현을 지웁니다. 이 작업은 되돌릴 수 없습니다. 계속할까요?')) return;
  const settings = state.settings;
  state = emptyState();
  state.settings = settings;
  state.currentId = null;
  compareRefId = null;
  compareMineId = null;
  saveState();
  renderAll();
  setStatus('#data-status', '모든 자료를 비웠습니다.', 'ok');
  toast('모든 자료를 비웠습니다.');
}

/* =========================================================
   파일 업로드 → 본문 추출 (PDF · DOCX · TXT · MD)
   PDF: pdf.js (한국어 CMap 포함, teaching/vendor/)
   DOCX: mammoth (teaching/vendor/)
   ========================================================= */
const VENDOR_VERSION = '20261126c';
const UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
const UPLOAD_KINDS = { pdf: 'PDF', docx: '워드(.docx)', txt: '텍스트', md: '텍스트' };
const LEGACY_HINTS = {
  doc: '구형 워드 파일(<code>.doc</code>)은 바로 읽지 못합니다. Word에서 <strong>.docx</strong>로 저장해 올려 주세요.',
  hwp: '한글 파일(<code>.hwp</code>)은 지원하지 않습니다. 한글에서 <strong>PDF</strong>로 저장해 올려 주세요.',
  hwpx: '한글 파일(<code>.hwpx</code>)은 지원하지 않습니다. 한글에서 <strong>PDF</strong>로 저장해 올려 주세요.',
  odt: 'ODT 파일은 지원하지 않습니다. Word에서 <strong>.docx</strong> 또는 <strong>.pdf</strong>로 저장해 올려 주세요.',
  rtf: 'RTF 파일은 지원하지 않습니다. Word에서 <strong>.docx</strong> 또는 <strong>.pdf</strong>로 저장해 올려 주세요.'
};

let pdfLibPromise = null;
let mammothLibPromise = null;
let uploadBusy = false;

function loadScriptOnce(src) {
  return new Promise(function (resolve, reject) {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = function () { resolve(); };
    s.onerror = function () { reject(new Error('스크립트를 불러오지 못했습니다: ' + src)); };
    document.head.appendChild(s);
  });
}

function ensurePdfLib() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfLibPromise) {
    pdfLibPromise = loadScriptOnce('vendor/pdf.min.js?v=' + VENDOR_VERSION).then(function () {
      if (!window.pdfjsLib) throw new Error('PDF 엔진을 초기화하지 못했습니다.');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js?v=' + VENDOR_VERSION;
      return window.pdfjsLib;
    }).catch(function (err) { pdfLibPromise = null; throw err; });
  }
  return pdfLibPromise;
}

function ensureMammothLib() {
  if (window.mammoth) return Promise.resolve(window.mammoth);
  if (!mammothLibPromise) {
    mammothLibPromise = loadScriptOnce('vendor/mammoth.browser.min.js?v=' + VENDOR_VERSION).then(function () {
      if (!window.mammoth) throw new Error('워드 문서 엔진을 초기화하지 못했습니다.');
      return window.mammoth;
    }).catch(function (err) { mammothLibPromise = null; throw err; });
  }
  return mammothLibPromise;
}

function fileExt(name) {
  const m = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

function formatBytes(n) {
  if (!n && n !== 0) return '';
  if (n < 1024) return n + 'B';
  if (n < 1024 * 1024) return Math.round(n / 1024) + 'KB';
  return (Math.round(n / (1024 * 1024) * 10) / 10) + 'MB';
}

function setUploadStatus(kind, html) {
  const el = $('#upload-status');
  if (!el) return;
  if (!kind) {
    el.hidden = true;
    el.className = 'upload-status';
    el.innerHTML = '';
    return;
  }
  el.hidden = false;
  el.className = 'upload-status ' + kind;
  el.innerHTML = html;
}

function tidyText(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function countParagraphs(text) {
  return String(text || '').split(/\n{2,}/).filter(function (p) { return p.trim().length > 0; }).length;
}

/* PDF 한 페이지의 텍스트 조각을 y좌표로 줄을 묶고, x좌표 순서로 이어 붙입니다. */
function pdfLinesFromItems(items) {
  const rows = [];
  (items || []).forEach(function (it) {
    if (!it || typeof it.str !== 'string') return;
    const tr = it.transform || [1, 0, 0, 1, 0, 0];
    const x = Number(tr[4]) || 0;
    const y = Number(tr[5]) || 0;
    const h = Math.abs(Number(tr[3])) || Number(it.height) || 10;
    let row = null;
    for (let i = rows.length - 1; i >= 0 && i >= rows.length - 8; i--) {
      if (Math.abs(rows[i].y - y) <= Math.max(2.4, h * 0.42)) { row = rows[i]; break; }
    }
    if (!row) {
      row = { y: y, h: h, items: [] };
      rows.push(row);
    }
    row.items.push({ x: x, w: Number(it.width) || 0, h: h, str: it.str });
  });

  rows.sort(function (a, b) { return b.y - a.y; });
  return rows.map(function (row) {
    const parts = row.items.slice().sort(function (a, b) { return a.x - b.x; });
    let line = '';
    let prev = null;
    parts.forEach(function (p) {
      if (prev) {
        const gap = p.x - (prev.x + prev.w);
        const em = Math.max(4, p.h || prev.h || 10);
        if (gap > em * 0.3 && line && !/\s$/.test(line) && !/^\s/.test(p.str)) line += ' ';
      }
      line += p.str;
      prev = p;
    });
    return line.replace(/[ \t]+$/g, '').replace(/^[ \t]+/g, '');
  });
}

function isPageNumberLine(line) {
  return /^[\s\-–—·|]*\d{1,4}\s*(\/\s*\d{1,4})?[\s\-–—·|]*$/.test(String(line || ''));
}

function headerSignature(line) {
  return String(line || '').replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();
}

/* 머리말·바닥글(페이지 번호가 붙은 반복 제목)을 걷어 냅니다. */
function stripRunningHeaders(pages) {
  if (!pages.length) return pages;

  const edgeIndexes = function (lines) {
    const out = [];
    for (let i = 0; i < Math.min(2, lines.length); i++) out.push(i);
    for (let i = Math.max(0, lines.length - 3); i < lines.length; i++) {
      if (out.indexOf(i) < 0) out.push(i);
    }
    return out;
  };

  const counts = {};
  if (pages.length >= 3) {
    pages.forEach(function (lines) {
      const seen = {};
      edgeIndexes(lines).forEach(function (i) {
        const sig = headerSignature(lines[i]);
        if (!sig || sig.length < 2 || seen[sig]) return;
        seen[sig] = true;
        counts[sig] = (counts[sig] || 0) + 1;
      });
    });
  }
  const threshold = Math.max(3, Math.ceil(pages.length * 0.6));
  const running = {};
  Object.keys(counts).forEach(function (sig) {
    if (counts[sig] >= threshold) running[sig] = true;
  });

  return pages.map(function (lines) {
    const edges = edgeIndexes(lines);
    return lines.filter(function (line, i) {
      const trimmed = String(line || '').trim();
      if (!trimmed) return true;
      const atEdge = edges.indexOf(i) >= 0;
      if (!atEdge) return true;
      if (isPageNumberLine(trimmed)) return false;
      if (running[headerSignature(trimmed)]) return false;
      return true;
    });
  });
}

async function extractPdfText(file) {
  const lib = await ensurePdfLib();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = lib.getDocument({
    data: data,
    cMapUrl: 'vendor/cmaps/',
    cMapPacked: true,
    isEvalSupported: false,
    useSystemFonts: false
  });
  let doc;
  try {
    doc = await task.promise;
  } catch (err) {
    const name = (err && err.name) || '';
    if (name === 'PasswordException') {
      throw new Error('암호가 걸린 PDF입니다. 암호를 풀어 저장한 뒤 다시 올려 주세요.');
    }
    if (name === 'InvalidPDFException') {
      throw new Error('PDF 파일을 읽지 못했습니다. 파일이 손상되었거나 PDF가 아닐 수 있습니다.');
    }
    throw new Error('PDF를 여는 중 문제가 생겼습니다. 페이지를 새로 고친 뒤 다시 시도해 주세요.');
  }

  const pageLines = [];
  const total = doc.numPages;
  for (let p = 1; p <= total; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    pageLines.push(pdfLinesFromItems(content.items));
    page.cleanup();
  }
  try { await task.destroy(); } catch (e) { /* 이미 정리됨 */ }

  const text = stripRunningHeaders(pageLines)
    .map(function (lines) { return lines.join('\n'); })
    .join('\n\n');

  return { text: tidyText(text), pages: total };
}

function htmlBlocksToText(html) {
  const box = document.createElement('div');
  box.innerHTML = String(html || '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/t[dh]>/gi, '\t')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|pre|tr|table|section)>/gi, '\n\n');
  return String(box.textContent || '').replace(/\t+\n/g, '\n');
}

async function extractDocxText(file) {
  const lib = await ensureMammothLib();
  const arrayBuffer = await file.arrayBuffer();
  const result = await lib.convertToHtml({ arrayBuffer: arrayBuffer });
  const text = tidyText(htmlBlocksToText(result && result.value));
  return { text: text };
}

async function extractPlainText(file) {
  let raw = '';
  if (typeof file.text === 'function') {
    raw = await file.text();
  } else {
    raw = await new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(new Error('파일을 읽지 못했습니다.')); };
      reader.readAsText(file, 'utf-8');
    });
  }
  return { text: tidyText(raw) };
}

/* 파일명에서 설교 제목을 추정합니다.
   예) 2026-11-26_이사야40장1-11절_10분설교원고_18pt.pdf → 이사야40장1-11절 10분설교원고 */
function guessTitleFromName(name) {
  let base = String(name || '').replace(/\.[^.]+$/, '');
  base = base.replace(/^\s*\d{4}[-_.]\d{1,2}[-_.]\d{1,2}\s*[-_.]?\s*/, '');
  base = base.replace(/[_]+/g, ' ');
  base = base.replace(/\s*[\(\[（【]\s*(?:최종|수정|rev|final)\s*[\d.]*\s*[\)\]）】]/gi, ' ');
  base = base.replace(/\b\d+(?:\.\d+)?\s*pt\b/gi, ' ');
  base = base.replace(/\s{2,}/g, ' ').replace(/^[\s\-_.]+|[\s\-_.]+$/g, '').trim();
  return base;
}

function fillSermonForm(text, file) {
  const ta = $('#f-text');
  if (!ta) return { ok: false, titleFilled: false };
  const existing = String(ta.value || '').trim();
  if (existing && existing !== text) {
    const go = window.confirm('설교 본문 입력창에 이미 글이 있습니다.\n\n파일에서 읽은 내용으로 바꿀까요?\n(취소하면 지금 쓰신 글이 그대로 남습니다.)');
    if (!go) return { ok: false, titleFilled: false };
  }
  ta.value = text;
  ta.dispatchEvent(new Event('input', { bubbles: true }));

  let titleFilled = false;
  const titleEl = $('#f-title');
  if (titleEl && !String(titleEl.value || '').trim()) {
    const guess = guessTitleFromName(file && file.name);
    if (guess) { titleEl.value = guess; titleFilled = true; }
  }
  return { ok: true, titleFilled: titleFilled };
}

async function handleSermonFile(file) {
  if (!file || uploadBusy) return;
  const ext = fileExt(file.name);
  const name = String(file.name || '파일');

  if (LEGACY_HINTS[ext]) {
    setUploadStatus('err', '⚠ ' + LEGACY_HINTS[ext] + '<span class="file-chip">선택한 파일: ' + esc(name) + '</span>');
    toast('이 파일 형식은 바로 읽지 못합니다. 안내를 확인해 주세요.', true);
    return;
  }
  if (!UPLOAD_KINDS[ext]) {
    setUploadStatus('err', '⚠ 지원하지 않는 파일 형식입니다' + (ext ? '(<code>.' + esc(ext) + '</code>)' : '') + '. <strong>PDF · DOCX · TXT · MD</strong> 파일을 올려 주세요.<span class="file-chip">선택한 파일: ' + esc(name) + '</span>');
    toast('PDF · DOCX · TXT · MD 파일을 올려 주세요.', true);
    return;
  }
  if (!file.size) {
    setUploadStatus('err', '⚠ 파일이 비어 있습니다(0바이트). 다른 파일을 올려 주세요.<span class="file-chip">선택한 파일: ' + esc(name) + '</span>');
    return;
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    setUploadStatus('err', '⚠ 파일이 너무 큽니다(' + formatBytes(file.size) + '). 25MB 이하 파일을 올려 주세요.');
    return;
  }

  uploadBusy = true;
  const zone = $('#dropzone');
  if (zone) { zone.classList.add('is-busy'); zone.setAttribute('aria-busy', 'true'); }
  setUploadStatus('busy', '<span class="spinner"></span><strong>' + esc(name) + '</strong> 읽는 중…' + (ext === 'pdf' ? ' PDF는 페이지 수에 따라 몇 초 걸릴 수 있습니다.' : ''));

  try {
    let parsed;
    if (ext === 'pdf') parsed = await extractPdfText(file);
    else if (ext === 'docx') parsed = await extractDocxText(file);
    else parsed = await extractPlainText(file);

    const text = String(parsed.text || '');
    if (text.replace(/\s/g, '').length < 20) {
      const hint = ext === 'pdf'
        ? 'PDF에서 글자를 찾지 못했습니다. 스캔한 사진 PDF이거나 암호가 걸린 파일일 수 있습니다. 원본 문서에서 PDF로 다시 저장해 올려 주세요.'
        : '파일에서 글자를 찾지 못했습니다. 내용이 들어 있는 파일인지 확인해 주세요.';
      setUploadStatus('err', '⚠ ' + hint + '<span class="file-chip">선택한 파일: ' + esc(name) + '</span>');
      toast('파일에서 본문을 찾지 못했습니다.', true);
      return;
    }

    const res = fillSermonForm(text, file);
    if (!res.ok) {
      setUploadStatus('', '');
      toast('지금 쓰신 본문을 그대로 두었습니다.');
      return;
    }

    const parts = ['✅ <strong>' + esc(UPLOAD_KINDS[ext]) + '</strong> 파일에서 <strong>' + text.length.toLocaleString('ko-KR') + '자</strong>를 불러와 본문에 채웠습니다'];
    const meta = [];
    if (parsed.pages) meta.push(parsed.pages.toLocaleString('ko-KR') + '쪽');
    const paras = countParagraphs(text);
    if (paras > 1) meta.push(paras.toLocaleString('ko-KR') + '문단');
    let html = parts.join('') + (meta.length ? ' <span style="font-weight:600">(' + meta.join(' · ') + ')</span>' : '') + '.';
    if (res.titleFilled) html += '<span class="file-chip">제목도 파일명에서 채웠습니다 — 필요하면 고쳐 주세요.</span>';
    html += '<span class="file-chip">' + esc(name) + ' · ' + formatBytes(file.size) + '</span>';
    setUploadStatus('ok', html);
    toast('파일에서 본문을 불러왔습니다.');
  } catch (err) {
    const msg = (err && err.message) ? err.message : '파일을 읽는 중 문제가 생겼습니다.';
    setUploadStatus('err', '⚠ ' + esc(msg) + '<span class="file-chip">선택한 파일: ' + esc(name) + '</span>');
    toast('파일을 읽지 못했습니다.', true);
  } finally {
    uploadBusy = false;
    if (zone) { zone.classList.remove('is-busy'); zone.removeAttribute('aria-busy'); }
  }
}

/* ---------- 이벤트 ---------- */
function bindEvents() {
  document.addEventListener('click', function (ev) {
    const t = ev.target;
    if (!t || !t.closest) return;

    const tab = t.closest('.tab');
    if (tab) { activateTab(tab.dataset.tab); return; }

    const goto = t.closest('[data-goto]');
    if (goto) { activateTab(goto.dataset.goto); return; }

    const rtab = t.closest('.rtab[data-rtab]');
    if (rtab) { setReportTab(rtab.dataset.rtab); return; }

    const mark = t.closest('mark.hl');
    if (mark) { showComment(mark.dataset.kind, Number(mark.dataset.index)); return; }

    const saveExpr = t.closest('[data-save-expr]');
    if (saveExpr) {
      const s = currentSermon();
      addExpression(saveExpr.dataset.saveExpr, saveExpr.dataset.exprText, s ? s.title : '');
      return;
    }

    const copyPoint = t.closest('[data-copy-point]');
    if (copyPoint) {
      const s = currentSermon();
      if (!s) return;
      const parts = String(copyPoint.dataset.copyPoint).split(':');
      const list = parts[0] === 'good' ? s.analysis.goodPoints : s.analysis.weakPoints;
      const p = list && list[Number(parts[1])];
      const text = p ? (parts[0] === 'good' ? p.quote : (p.rewrite || p.method || p.issue)) : '';
      if (text) copyText(text, '문장을 복사했습니다.');
      return;
    }

    const rw = t.closest('[data-rewrite]');
    if (rw) { doRewrite(rw.dataset.rewrite, false); return; }

    const cr = t.closest('[data-copy-rewrite]');
    if (cr) { doRewrite(cr.dataset.copyRewrite, true); return; }

    const sp = t.closest('[data-save-rewrite-paste]');
    if (sp) {
      const s = currentSermon();
      const ta = $('#rewrite-paste');
      const val = ta ? ta.value.trim() : '';
      if (!s) return;
      if (!val) { toast('붙여넣은 원고가 없습니다.', true); return; }
      if (!rewriteTarget) rewriteTarget = 'healthy';
      saveRewriteResult(s, rewriteTarget, val);
      if (ta) ta.value = '';
      const card = $('#rewrite-paste-card');
      if (card) card.hidden = true;
      return;
    }

    const cp = t.closest('[data-cancel-rewrite-paste]');
    if (cp) {
      const card = $('#rewrite-paste-card');
      if (card) card.hidden = true;
      return;
    }

    const copyBlock = t.closest('[data-copy-block]');
    if (copyBlock) {
      const s = currentSermon();
      if (!s) return;
      const kind = copyBlock.dataset.copyBlock;
      const text = kind === 'healthy' ? s.analysis.rewriteHealthy : (s.analysis.conversions || {})[kind.replace('format:', '')];
      if (text) copyText(text, '원고를 복사했습니다.');
      return;
    }

    const delBlock = t.closest('[data-del-block]');
    if (delBlock) { deleteBlock(delBlock.dataset.delBlock); return; }

    const open = t.closest('[data-open]');
    if (open) {
      state.currentId = open.dataset.open;
      saveState(true);
      activateTab('report');
      setReportTab('coaching');
      renderReport();
      return;
    }

    const ref = t.closest('[data-ref]');
    if (ref) { toggleReference(ref.dataset.ref); return; }

    const del = t.closest('[data-del]');
    if (del) { deleteSermon(del.dataset.del); return; }

    const exprDel = t.closest('[data-expr-del]');
    if (exprDel) {
      if (!confirm('이 표현을 표현 모음에서 지울까요?')) return;
      state.expressions = state.expressions.filter(function (e) { return e.id !== exprDel.dataset.exprDel; });
      saveState();
      renderExpressions();
      toast('표현을 지웠습니다.');
      return;
    }

    const modeBtn = t.closest('.mode-btn');
    if (modeBtn) { uiMode = modeBtn.dataset.mode; updateModeUI(); return; }

    const seg = t.closest('.seg-btn');
    if (seg) { settingsProvider = seg.dataset.provider; updateProviderUI(); return; }

    if (t.closest('#btn-settings') || t.closest('[data-open-settings]') || t.closest('#btn-open-settings')) {
      openSettings();
      return;
    }

    if (t.closest('[data-close-modal]')) { closeSettings(); return; }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      const modal = $('#modal-settings');
      if (modal && !modal.hidden) closeSettings();
      return;
    }
    const t = ev.target;
    if (t && t.matches && t.matches('mark.hl') && (ev.key === 'Enter' || ev.key === ' ')) {
      ev.preventDefault();
      showComment(t.dataset.kind, Number(t.dataset.index));
    }
  });

  const form = $('#sermon-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (uiMode === 'api') runApiAnalysis();
      else copyAnalysisPrompt();
    });
  }

  const textEl = $('#f-text');
  if (textEl) {
    textEl.addEventListener('input', function () {
      const n = textEl.value.length;
      const el = $('#char-count');
      if (el) el.textContent = n.toLocaleString('ko-KR') + '자';
    });
  }

  /* ----- 설교 파일 업로드 ----- */
  const fileSermon = $('#file-sermon');
  if (fileSermon) {
    fileSermon.addEventListener('change', function () {
      const f = fileSermon.files && fileSermon.files[0];
      fileSermon.value = '';
      if (f) handleSermonFile(f);
    });
  }

  const dropzone = $('#dropzone');
  if (dropzone) {
    dropzone.addEventListener('click', function (ev) {
      if (ev.target === fileSermon) return;
      if (uploadBusy || !fileSermon) return;
      fileSermon.click();
    });
    dropzone.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        if (!uploadBusy && fileSermon) fileSermon.click();
      }
    });
    ['dragenter', 'dragover'].forEach(function (type) {
      dropzone.addEventListener(type, function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy';
        if (!uploadBusy) dropzone.classList.add('is-drag');
      });
    });
    dropzone.addEventListener('dragleave', function (ev) {
      ev.preventDefault();
      if (ev.relatedTarget && dropzone.contains(ev.relatedTarget)) return;
      dropzone.classList.remove('is-drag');
    });
    dropzone.addEventListener('drop', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      dropzone.classList.remove('is-drag');
      const dt = ev.dataTransfer;
      const f = dt && dt.files && dt.files[0];
      if (f) handleSermonFile(f);
    });
  }

  /* 파일을 창 밖에 잘못 떨어뜨렸을 때 페이지가 파일로 이동하지 않도록 막습니다. */
  ['dragover', 'drop'].forEach(function (type) {
    document.addEventListener(type, function (ev) {
      const types = ev.dataTransfer && ev.dataTransfer.types;
      if (!types) return;
      const hasFiles = Array.prototype.indexOf.call(types, 'Files') >= 0;
      if (hasFiles) ev.preventDefault();
    });
  });

  const fmt = $('#f-format');
  if (fmt) fmt.addEventListener('change', updateFormatGuide);

  const role = $('#f-role');
  if (role) {
    role.addEventListener('change', function () {
      const p = $('#f-preacher');
      if (!p) return;
      if (role.value === 'me' && !p.value) p.placeholder = '예) 유효석';
      else p.placeholder = '예) 다른 설교자 이름';
    });
  }

  const btnCopy = $('#btn-copy-prompt');
  if (btnCopy) btnCopy.addEventListener('click', copyAnalysisPrompt);

  const btnImport = $('#btn-import-json');
  if (btnImport) btnImport.addEventListener('click', importFromPaste);

  const fileJson = $('#file-json');
  if (fileJson) {
    fileJson.addEventListener('change', function () {
      const f = fileJson.files && fileJson.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () { $('#paste-response').value = String(reader.result || ''); toast('파일을 불러왔습니다. [결과 불러오기 & 저장]을 누르세요.'); };
      reader.readAsText(f);
      fileJson.value = '';
    });
  }

  const btnRun = $('#btn-run-api');
  if (btnRun) btnRun.addEventListener('click', runApiAnalysis);

  const btnClear = $('#btn-clear-form');
  if (btnClear) {
    btnClear.addEventListener('click', function () {
      ['#f-title', '#f-preacher', '#f-scripture', '#f-youtube', '#f-text', '#paste-response'].forEach(function (sel) {
        const el = $(sel); if (el) el.value = '';
      });
      $('#f-date').value = todayISO();
      $('#f-format').value = 'auto';
      updateFormatGuide();
      $('#char-count').textContent = '0자';
      setStatus('#parse-status', '', '');
      setUploadStatus('', '');
      toast('입력을 비웠습니다.');
    });
  }

  const btnPrint = $('#btn-print');
  if (btnPrint) {
    btnPrint.addEventListener('click', function () {
      activateTab('report');
      setReportTab('coaching');
      setTimeout(function () { window.print(); }, 350);
    });
  }

  const btnSaveSettings = $('#btn-save-settings');
  if (btnSaveSettings) btnSaveSettings.addEventListener('click', saveSettings);

  const btnTest = $('#btn-test-api');
  if (btnTest) btnTest.addEventListener('click', testApi);

  const btnExport = $('#btn-export');
  if (btnExport) btnExport.addEventListener('click', exportData);

  const importFile = $('#import-file');
  if (importFile) {
    importFile.addEventListener('change', function () {
      const f = importFile.files && importFile.files[0];
      if (f) importDataFromFile(f);
      importFile.value = '';
    });
  }

  const btnSamples = $('#btn-restore-samples');
  if (btnSamples) btnSamples.addEventListener('click', restoreSamples);

  const btnReset = $('#btn-reset-all');
  if (btnReset) btnReset.addEventListener('click', resetAll);

  const search = $('#lib-search');
  if (search) {
    search.addEventListener('input', function () {
      libQuery = search.value.trim();
      renderLibrary();
    });
  }

  const sort = $('#lib-sort');
  if (sort) {
    sort.addEventListener('change', function () {
      libSort = sort.value;
      renderLibrary();
    });
  }

  $$('.chip[data-filter]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      libFilter = chip.dataset.filter;
      $$('.chip[data-filter]').forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      renderLibrary();
    });
  });

  const cmpRef = $('#cmp-reference');
  if (cmpRef) cmpRef.addEventListener('change', function () { compareRefId = cmpRef.value; renderCompare(); });

  const cmpMine = $('#cmp-mine');
  if (cmpMine) cmpMine.addEventListener('change', function () { compareMineId = cmpMine.value; renderCompare(); });

  const exprForm = $('#expr-form');
  if (exprForm) {
    exprForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const text = $('#expr-text').value.trim();
      const kind = $('#expr-kind').value;
      const note = $('#expr-note').value.trim();
      if (!text) { toast('표현을 입력해 주세요.', true); $('#expr-text').focus(); return; }
      const exists = state.expressions.some(function (e) { return e.kind === kind && e.text === text; });
      if (exists) { toast('이미 담겨 있는 표현입니다.'); return; }
      state.expressions.unshift({ id: uid('ex'), kind: kind, text: text, note: note, source: '직접 추가', createdAt: new Date().toISOString() });
      saveState();
      renderExpressions();
      $('#expr-text').value = '';
      $('#expr-note').value = '';
      toast('표현 모음에 담았습니다.');
    });
  }
}

/* ---------- 시작 ---------- */
function init() {
  const dateEl = $('#f-date');
  if (dateEl && !dateEl.value) dateEl.value = todayISO();
  updateFormatGuide();
  bindEvents();
  renderAll();
  setReportTab('coaching');
  if (state.currentId && getSermon(state.currentId)) {
    // 서재에서 이어 보던 설교는 리포트 탭에서 열린다.
  }
}

init();
