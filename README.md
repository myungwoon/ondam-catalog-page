# ONDAM 티 컬렉션 카탈로그 (GA4 + GTM)

가상 차(茶) 브랜드 **ONDAM 온담**의 상품 카탈로그 랜딩 페이지입니다. 상품 목록·필터·상세 모달·장바구니·리드 폼 등 실무형 상호작용을 갖추고, 모든 상호작용을 **GTM dataLayer 이벤트**와 **GA4 권장 이벤트**로 보냅니다.

- 배포: https://ondam-catalog-page.vercel.app
- 저장소: https://github.com/myungwoon/ondam-catalog-page

## 구조

```
catalog-page/
├─ site.config.json      ← ★ GTM/GA4 ID를 관리하는 유일한 곳
├─ scripts/build.mjs     ← src/ → public/ 복사 + {{GTM_ID}} {{GA4_ID}} 등 치환
├─ vercel.json           ← buildCommand: node scripts/build.mjs, outputDirectory: public
├─ src/
│  ├─ index.html         ← GTM 스니펫(<head> 최상단 + <body> 바로 뒤 noscript), gtag.js(GA4)
│  ├─ tracking.js        ← 추적 헬퍼: dataLayer.push + gtag('event') 를 한 곳에서 처리
│  ├─ app.js             ← UI 동작과 이벤트 호출
│  ├─ products.js        ← 상품 데이터(가상 6종)
│  └─ styles.css
└─ docs/verify-snippet.js ← 브라우저 콘솔용 태깅 점검 스니펫
```

빌드 도구 의존성은 없습니다(Node 18+ 표준 모듈만 사용).

## ID 설정 방법

`site.config.json` 한 파일만 고치면 됩니다.

```json
{
  "gtmId": "GTM-XXXXXXX",
  "ga4Id": "G-XXXXXXXXXX",
  "ga4Direct": true,
  "siteVersion": "v2"
}
```

| 키 | 의미 |
|---|---|
| `gtmId` | GTM 컨테이너 ID. `<head>` 스니펫과 `<body>` noscript iframe 두 곳에 빌드 시 주입 |
| `ga4Id` | GA4 측정 ID |
| `ga4Direct` | `true`: 페이지에서 gtag.js로 GA4에 직접 전송. **GTM 안에 GA4 구성 태그를 만들었다면 `false`로** 바꿔 중복 수집을 막으세요(빌드 시 gtag 블록이 제거됨) |
| `siteVersion` | 모든 이벤트에 `site_version` 파라미터로 실림. 개선 전후 비교용 |

Vercel 환경변수 `GTM_ID`, `GA4_ID`, `GA4_DIRECT`, `SITE_VERSION` 이 있으면 파일보다 우선합니다(코드 수정 없이 환경별 ID 교체 가능).

> 현재 저장소에는 **자리표시자 ID**(`GTM-XXXXXXX`, `G-XXXXXXXXXX`)가 들어 있습니다. 실제 ID로 바꾸고 재배포하면 데이터가 GA4 속성에 쌓입니다.

### GTM에서 받을 때(ga4Direct=false 운영 시)

1. 변수 → 데이터 영역 변수: `cta_id`, `cta_location`, `site_version`, `ecommerce` 등
2. 트리거 → 맞춤 이벤트: 이벤트 이름 정규식 `^(view_item_list|select_item|view_item|add_to_cart|remove_from_cart|view_cart|begin_checkout|add_to_wishlist|view_promotion|select_promotion)$`
3. 태그 → GA4 이벤트: 이벤트 이름 `{{Event}}`, "전자상거래 데이터 보내기" 체크(데이터 영역)
4. CTA·리드 등은 `cta_click`, `generate_lead`, `faq_open`, `scroll_depth`, `filter_select` 맞춤 이벤트 트리거로 별도 태그

## 이벤트 설계

| 이벤트 | 시점 | 주요 파라미터 | 버전 |
|---|---|---|---|
| `page_view` | 페이지 로드(gtag config) | `site_version` | v1 |
| `view_item_list` | 상품 그리드가 처음 화면에 보일 때, 필터 변경 시 | `items[]`, `item_list_id` | v1 |
| `filter_select` | 카테고리 칩 클릭 | `filter_value`, `result_count` | v1 |
| `select_item` | 카드 클릭 | `items[]`(index 포함) | v1 |
| `view_item` | 상세 모달 열림 | `currency=KRW`, `value`, `items[]` | v1 |
| `add_to_cart` / `remove_from_cart` | 담기 / 삭제 | `value`, `items[]`, `add_source` | v1 |
| `view_cart` / `begin_checkout` | 장바구니 열기 / 주문하기 | `value`, `items[]`, `checkout_source` | v1 |
| `cta_click` | `data-cta` 속성이 있는 모든 버튼·링크 | `cta_id`, `cta_text`, `cta_location`, `link_url` | v1 |
| `nav_click` | 상단 메뉴 | `nav_item` | v1 |
| `generate_lead` / `form_error` | 쿠폰 폼 제출 / 검증 실패 | `form_id`, `lead_source` (이메일은 전송하지 않음) | v1 |
| `view_promotion` / `select_promotion` | 프로모션 배너 노출 50% / 클릭 | `promotion_id`, `promotion_name`, `creative_slot` | **v2** |
| `add_to_wishlist` / `remove_from_wishlist` | 카드 ♥ 토글 | `items[]` | **v2** |
| `faq_open` | FAQ 펼침 | `faq_id`, `faq_question` | **v2** |
| `scroll_depth` | 25/50/75/90% 도달 | `percent_scrolled` | **v2** |

전자상거래 이벤트는 GA4 권장 스키마로 `{ ecommerce: null }` 을 먼저 push 해 이전 값을 비운 뒤 `{ event, ecommerce: { items: [...] } }` 형태로 push 합니다. URL에 `?debug=1` 을 붙이면 GA4 `debug_mode`가 켜지고 콘솔에 `[track]` 로그가 찍힙니다.

## 로컬 실행 · 배포

```bash
npm run build          # public/ 생성
npm run dev            # 빌드 후 http://localhost:5173
```

Vercel 프로젝트 `ondam-catalog-page` 에 CLI로 배포합니다.

```bash
vercel deploy --prod
```

> **Windows 한글 PC 이름 주의**: PC 이름이 한글이면 Vercel CLI가 `Cannot convert argument to a ByteString` 오류로 멈춥니다(호스트명이 HTTP 헤더에 들어감). 아래처럼 Node의 `os.hostname()`을 영문으로 덮어써 실행했습니다.
>
> ```js
> // hostfix.cjs
> const os = require('os'); os.hostname = () => 'dev-pc';
> const ui = os.userInfo; os.userInfo = (o) => Object.assign({}, ui(o), { username: 'dev' });
> ```
> `NODE_OPTIONS="--require ./hostfix.cjs" vercel deploy --prod`
>
> GitHub push 자동 배포를 원하면 Vercel 계정 설정 → Authentication 에서 GitHub Login Connection을 추가한 뒤 프로젝트 Settings → Git 에서 저장소를 연결하세요(현재 미연결, CLI가 `You need to add a Login Connection` 오류 반환).

## 검증 결과 (2026-11-14, 배포 URL에서 브라우저 도구로 확인)

검증은 `performance.getEntriesByType('resource')`, `fetch`/`sendBeacon` 후킹, `window.dataLayer` 덤프로 했습니다. 콘솔에서 `docs/verify-snippet.js` 를 붙여 넣으면 같은 표를 볼 수 있습니다. 아래 결과는 **자리표시자 ID** 기준이라 요청은 발생하지만 수집된 데이터가 실제 GA4 속성에 쌓이지는 않습니다.

### v1 (최초 배포)

| 요청 | ID | 비고 |
|---|---|---|
| `www.googletagmanager.com/gtm.js` | GTM-XXXXXXX | GTM 컨테이너 로드 |
| `www.googletagmanager.com/gtag/js` | G-XXXXXXXXXX | GA4 태그 로드 |
| `www.google-analytics.com/g/collect?v=2` | G-XXXXXXXXXX | `en=page_view`, `ep.site_version=v1`, `ep.debug_mode=true` |
| `www.google-analytics.com/g/collect?v=2` | G-XXXXXXXXXX | 이후 이벤트 배치 전송 |

dataLayer: `gtm.js → gtm.dom → gtm.load → cta_click → filter_select → view_item_list → select_item → view_item → cta_click → add_to_cart → view_cart → cta_click → begin_checkout → generate_lead` (gtag 큐에도 같은 11개 `event` 명령 확인)

### v2 (개선 후 재배포)

| 요청 | ID | 비고 |
|---|---|---|
| `gtm.js` | GTM-XXXXXXX | 그대로 로드 |
| `gtag/js` | G-XXXXXXXXXX | 그대로 로드 |
| `g/collect?v=2` | G-XXXXXXXXXX | `en=page_view`, `ep.site_version=v2` |
| `g/collect?v=2` (fetch 본문 확인) | G-XXXXXXXXXX | 배치 본문에 `faq_open`, `add_to_wishlist`, `cta_click` 포함 |

dataLayer: `gtm.js → gtm.dom → gtm.load → view_item → select_promotion → cta_click → add_to_cart → add_to_wishlist → cta_click → add_to_cart → faq_open → cta_click → view_cart → cta_click → begin_checkout → generate_lead`, 스크롤 후 `view_promotion`(2개 배너) · `scroll_depth` 25/50/75/90 추가 확인.

결론: 개선 후에도 GTM·GA4 스니펫과 기존 이벤트가 그대로 동작하고, v2 신규 이벤트 6종이 추가로 수집 요청에 실립니다.
