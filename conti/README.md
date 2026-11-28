# 찬양콘티 악보 (conti/)

찬양 콘티 3곡을 **앞면 2곡(1·2번) / 뒷면 1곡(3번)** 으로 편집해 **가로 US Letter** 로 인쇄·PDF 저장하는 앱입니다.

- 주소: https://heaven0115.github.io/harvestermusicmission/conti/
- 저장: 이 기기 브라우저의 `localStorage` (`harvester-conti-v1`) — 기기를 바꾸면 [콘티 관리 → JSON 백업]으로 옮깁니다.

## 쓰는 순서

1. **1·2·3번 탭**에서 곡마다 악보를 올립니다(PDF·JPG·PNG·WebP, 드래그·붙여넣기도 가능). PDF는 2~3배 해상도로 그려지고, 여러 페이지면 페이지를 골라 씁니다.
2. **곡 제목**과 **송폼**(예: `Intro - 1A - 1A - B - Tag2`)을 적습니다. 칩을 눌러 빠르게 채울 수 있습니다.
3. **표시 글자**(A·B·Tag2 등)를 고르고 악보 위를 **톡 누르면** 그 자리에 표시가 붙습니다. 끌면 이동, 누르면 색·크기·글자 수정/삭제. 실행 취소는 상단 ↶.
4. **출력 미리보기** 탭에서 앞면·뒷면을 확인하고 **PDF로 저장** 또는 **인쇄하기**.

## 파일

| 파일 | 설명 |
| --- | --- |
| `index.html` | 화면 뼈대(상단바·탭·인쇄용 DOM) |
| `styles.css` | 화면·인쇄 스타일 (`@page letter landscape`, 여백 0.35in) |
| `app.js` | 상태·마커·캔버스 합성·jsPDF 출력 전체 |
| `vendor/` | pdf.js 3.11.174(한국어 CMap 포함), jsPDF 2.5.2 — 외부 CDN 없이 동작 |
| `manifest.webmanifest`, `icon-*.png` | 홈 화면에 추가(PWA)용 |

## 출력 방식

- 화면·PDF·인쇄가 **같은 캔버스 결과물**을 씁니다. 240dpi 캔버스에 제목·송폼·악보·표시를 직접 그린 뒤
  - PDF: jsPDF로 2페이지 가로 Letter (iOS는 공유 시트, 그 외는 내려받기)
  - 인쇄: `window.print()` + `@page { size: letter landscape; margin: 0.35in }`
- 표시 좌표는 악보 대비 백분율(`x%`, `y%`)로 저장해 화면·미리보기·PDF 위치가 같습니다.

## 고칠 때

`index.html`의 `?v=` 값을 올려 캐시를 갱신하고, `pages build and deployment` 성공과 라이브 화면을 확인합니다.
루트(`/`)·`teaching/`·`games/`·`report/` 앱과는 폴더가 분리되어 있어 서로 영향이 없습니다.
