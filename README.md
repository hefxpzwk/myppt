# MyPPT Hub

정적 HTML 발표를 한곳에서 탐색하고 실행하는 프론트엔드 허브입니다.

## 슬라이드 등록 방식

`public/slides` 아래에 `.html` 파일을 추가하면 갤러리에 자동으로 반영됩니다.

- 추가된 HTML: 자동으로 목록에 추가
- 삭제된 HTML: 자동으로 목록에서 제거
- 목록 데이터 생성 파일: `src/data/slides.generated.ts`

자동 생성은 아래 시점에 실행됩니다.

- `npm run dev` 실행 전
- `npm run build` 실행 전

수동으로 생성만 실행하려면:

```bash
npm run generate:presentations
```
