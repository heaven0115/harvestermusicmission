# vendor — 설교 파일 텍스트 추출용 라이브러리

`새 설교 분석` 화면의 파일 업로드(PDF · DOCX)에서만 쓰입니다. 모두 페이지와 같은 출처에서 불러오므로 CDN이 막히거나 오프라인이어도 동작합니다.

| 파일 | 라이브러리 | 버전 | 라이선스 |
| --- | --- | --- | --- |
| `pdf.min.js`, `pdf.worker.min.js` | [pdf.js](https://mozilla.github.io/pdf.js/) (pdfjs-dist) | 3.11.174 | Apache-2.0 (`LICENSE-pdfjs.txt`) |
| `mammoth.browser.min.js` | [mammoth.js](https://github.com/mwilliamson/mammoth.js) | 1.8.0 | BSD-2-Clause (`LICENSE-mammoth.txt`) |
| `cmaps/*.bcmap` | pdf.js 동봉 CMap (한국어: `UniKS-*`, `KSC*`, `Adobe-Korea1-*`) | 3.11.174 | Apache-2.0 (`LICENSE-pdfjs.txt`) |

## CMap

한국어 PDF가 `UniKS-UCS2-H`, `KSCms-UHC-H`, `Adobe-Korea1-UCS2` 같은 CID 인코딩을 쓸 때 글자가 깨지지 않도록 한국어 CMap만 추려 두었습니다. pdf.js 초기화 시 `cMapUrl: 'vendor/cmaps/'`, `cMapPacked: true`로 지정합니다(`app.js`의 `extractPdfText`).

## 갱신 방법

```bash
npm pack pdfjs-dist@3.11.174 && tar xzf pdfjs-dist-3.11.174.tgz
cp package/build/pdf.min.js package/build/pdf.worker.min.js .
cp package/cmaps/{UniKS*,KSC*,Adobe-Korea1*} cmaps/

npm pack mammoth@1.8.0 && tar xzf mammoth-1.8.0.tgz
cp package/mammoth.browser.min.js .
```

버전을 올릴 때는 `app.js`의 `VENDOR_VERSION`(현재 `20261126c`)도 함께 올려 브라우저 캐시를 비웁니다.
