# 작업 규칙

- 이 GitHub 저장소(`s98ckh777/Habit`)의 `main`이 홈페이지의 기준 버전입니다. PC의 `skinlab-handoff` 폴더 등 로컬 사본은 예전 버전이니 기준으로 쓰지 마세요.
- 수정을 마치면 커밋하고 GitHub에 push해서 다른 컴퓨터에서도 이어서 작업할 수 있게 하세요.
- 프로젝트 배경과 결정 사항은 `README.md`, 사이트 구조와 빌드 방법은 `site/README.md`를 먼저 읽으세요.
- 실제로 고치는 곳은 `site/src/`와 `site/assets/`입니다. 고친 뒤 `cd site && node build.mjs`로 `site/dist/`를 다시 만들고 함께 커밋하세요. `dist/`는 직접 수정하지 않습니다.
- 브라우저 미리보기 주소: https://claude.ai/artifact/3JE5shaRZNyxVUpJPQ4ukA (`site/dist/`를 올린 것). 수정 후 이 주소에 새 버전을 다시 올리세요. `index.html`을 페이지로, 나머지 파일은 같은 경로로 올립니다.
- 사용자는 개발자가 아니므로 설명은 한국어로 쉽게 해 주세요.
