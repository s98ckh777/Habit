# habit Skin Lab 사이트 (site/)

시안(`../source/*.dc.html`)을 옮긴 정적 사이트입니다. 의존성 없이 Node 18 이상만 있으면 됩니다.

## 실행
```bash
node build.mjs          # 시안 빌드: 시안 메모·개발 바 표시
node build.mjs --prod   # 운영 빌드: 시안 메모(.note.memo)·개발 바 제거
node serve.mjs          # http://localhost:4173 미리보기 (dist/)
```

## 구조
| 경로 | 내용 |
|---|---|
| `config.json` | 전화·주소·외부 링크 등 공통 값. `"#"`은 아직 정해지지 않은 링크(네이버 예약, 카카오 채널, 병원 본 사이트, 지도) |
| `src/layout.html` | 모든 페이지의 틀(head, SEO 메타, 구조화 데이터 자리) |
| `src/partials/` | 헤더·모바일 메뉴, 오시는 길, 푸터, 플로팅 버튼·모바일 하단 바, 접속 팝업 (한 곳에서 수정) |
| `src/pages/*.html` | 페이지 본문. 첫 줄 `<!--meta {...} -->`에 제목·설명 |
| `src/css/` | `base`(토큰·버튼) + `components`(기존 시안 컴포넌트) + `layout`(새 레이아웃) → `dist/assets/css/site.css` |
| `assets/` | JS, 이미지. `dist/assets/`로 그대로 복사 |
| `dist/` | 빌드 결과 (직접 수정하지 마세요) |

본문에서 `{{cfg.키}}`를 쓰면 `config.json` 값으로 바뀝니다. 없는 키를 쓰면 빌드가 멈춥니다.

## 사진·영상 넣기
- **메인 히어로 영상**: `assets/video/hero.mp4`(1280×720, 8초, 1.3MB) + 포스터 `assets/img/hero-poster.webp/.jpg`(첫 프레임). 화면 오른쪽 패널에 넣고 왼쪽 가장자리를 아이보리로 흐리게 섞었습니다. 영상을 바꾸면 `src/css/layout.css`의 `.hero-media > video { object-position }` 값(데스크톱·태블릿·모바일 3곳)으로 얼굴 위치를 맞추세요. 1920×1080 원본이 있으면 더 선명합니다.
- 자리 표시(`.ph`)는 `.media` 상자 안에 있습니다. `.ph`를 지우고 `<picture>` / `<img>` / `<video>`를 넣으면 상자를 꽉 채웁니다.
- 메인 히어로와 영상 밴드에는 넣을 코드가 주석으로 들어 있습니다. 영상에 `data-bg`를 붙이면 화면 밖에서 멈추고, "동작 줄이기" 설정을 존중하며, 히어로의 재생/정지 버튼이 자동으로 나타납니다.
- 권장: 사진은 avif + webp(+jpg 대체), 첫 화면 밖 이미지는 `loading="lazy"`. 영상은 무음 10~15초 루프, webm + mp4, 각 4MB 이하.
- 모델 사진은 초상권 동의 확인 후 사용하고, 히어로 하단·푸터의 "실제 시술 결과가 아닙니다" 문구는 유지하세요.

## 동작
- 접속 팝업(메인만): 각각 닫기, "1일 동안 보지 않기"는 브라우저 localStorage에 저장. 시안 빌드의 상단 바에서 "팝업 다시 보기"로 초기화.
- 프로그램 카드 분류 필터, 칼럼 가로 슬라이더, 스크롤 등장 효과, 모바일 메뉴, 모바일 하단 상담 바(전화·카카오톡·네이버 예약).
- SEO: 페이지별 title/description/canonical/OG, 메인 `MedicalClinic`, 시술 페이지 `MedicalWebPage` + 이동 경로(Breadcrumb) 구조화 데이터, `sitemap.xml`(시술사례 제외), `robots.txt`. 도메인이 정해지면 `config.json`의 `siteUrl`만 바꾸세요.

## 아직 없는 것
상담 문의 폼(마케팅 동의 포함), 시술사례 회원 로그인(카카오·네이버), 관리자 화면(팝업·이벤트·칼럼·사례 편집). 서버나 외부 서비스가 필요해서, 호스팅 방식이 정해진 뒤에 붙입니다.
