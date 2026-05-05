# 기여 방법

이 프로젝트에 대한 여러분의 패치와 기여를 환영합니다.

## 기여 프로세스

### 코드 리뷰

프로젝트 멤버의 제출물을 포함하여 모든 제출물은 리뷰가 필요합니다. 우리는 이를 위해 [GitHub pull requests](https://docs.github.com/articles/about-pull-requests)를 사용합니다.

### Pull Request 가이드라인

PR을 신속하게 리뷰하고 병합할 수 있도록 다음 가이드라인을 준수해 주세요. 이 기준을 충족하지 못하는 PR은 닫힐 수 있습니다.

#### 1. 기존 이슈와 연결

모든 PR은 이슈 트래커의 기존 이슈와 연결되어야 합니다. 이는 모든 변경 사항이 코드를 작성하기 전에 충분히 논의되었으며 프로젝트의 목표와 일치하는지 확인하기 위함입니다.

- **버그 수정:** PR은 해당 버그 리포트 이슈와 연결되어야 합니다.
- **기능 추가:** PR은 메인테이너에 의해 승인된 기능 요청 또는 제안 이슈와 연결되어야 합니다.

변경 사항에 대한 이슈가 없다면, 코딩을 시작하기 전에 **먼저 이슈를 생성**하고 피드백을 기다려 주세요.

#### 2. 작고 집중된 범위 유지

단일 이슈를 해결하거나 독립적인 단일 기능을 추가하는 작고 원자적인 PR을 선호합니다.

- **권장:** 하나의 특정 버그를 수정하거나 하나의 특정 기능을 추가하는 PR을 만드세요.
- **비권장:** 여러 관련 없는 변경 사항(예: 버그 수정, 새 기능, 리팩토링)을 하나의 PR에 묶지 마세요.

큰 변경 사항은 독립적으로 리뷰하고 병합할 수 있도록 작고 논리적인 일련의 PR로 나누어야 합니다.

#### 3. 작업 중인 내용은 Draft PR 사용

작업에 대해 조기에 피드백을 받고 싶다면 GitHub의 **Draft Pull Request** 기능을 사용해 주세요. 이는 메인테이너에게 해당 PR이 아직 공식 리뷰를 받을 준비는 되지 않았지만 논의와 초기 피드백을 위해 열려 있다는 신호를 보냅니다.

#### 4. 모든 체크 통과 확인

PR을 제출하기 전에 `npm run preflight`를 실행하여 모든 자동화된 체크를 통과했는지 확인하세요. 이 명령은 모든 테스트, 린팅 및 기타 스타일 체크를 실행합니다.

#### 5. 문서 업데이트

PR이 사용자에게 영향을 미치는 변경 사항(예: 새 명령, 수정된 플래그, 동작 변경)을 도입하는 경우 `/docs` 디렉토리의 관련 문서도 업데이트해야 합니다.

#### 6. 스크린샷 또는 비디오 데모 포함

리뷰어가 변경 사항을 신속하게 이해하고 우선순위를 정할 수 있도록, 변경 사항이 작동하는 스크린샷이나 짧은 비디오를 PR에 첨부해 주세요.

- **버그 수정:** 수정 전후의 동작을 보여주세요.
- **새 기능:** 기능이 처음부터 끝까지 작동하는 모습을 보여주세요.
- **리팩토링 또는 내부 변경:** 데모 섹션에 "해당 없음 — 사용자에게 보이는 변경 사항 없음"이라고 기재하세요.

시각적 데모가 있는 PR은 훨씬 더 빨리 리뷰되는 경향이 있으니 꼭 포함해 주세요!

#### 7. 명확한 커밋 메시지 및 PR 설명 작성

PR은 명확하고 설명적인 제목과 상세한 변경 내용을 포함해야 합니다. 커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 표준을 따르세요.

- **좋은 PR 제목:** `feat(cli): Add --json flag to 'config get' command`
- **나쁜 PR 제목:** `Made some changes`

PR 설명에서는 변경 이유를 설명하고 관련 이슈와 연결하세요(예: `Fixes #123`).

## 개발 설정 및 워크플로우

이 섹션은 프로젝트를 빌드, 수정 및 개발 설정을 이해하려는 기여자들을 위한 가이드입니다.

### 개발 환경 설정

**전제 조건:**

1.  **Node.js**:
    - **개발용:** Node.js `~20.19.0`을 사용해 주세요. 상위 개발 종속성 문제로 인해 이 특정 버전이 필요합니다. [nvm](https://github.com/nvm-sh/nvm)과 같은 도구를 사용하여 Node.js 버전을 관리할 수 있습니다.
    - **운영용:** 운영 환경에서 CLI를 실행하려면 Node.js `>=20` 버전이면 충분합니다.
2.  **Git**

### 빌드 프로세스

저장소 복제:

```bash
git clone https://github.com/QwenLM/qwen-code.git # 또는 포크한 저장소 URL
cd qwen-code
```

`package.json`에 정의된 종속성 및 루트 종속성 설치:

```bash
npm install
```

전체 프로젝트 빌드 (모든 패키지):

```bash
npm run build
```

이 명령은 일반적으로 TypeScript를 JavaScript로 컴파일하고, 자산을 번들링하며, 패키지를 실행할 수 있도록 준비합니다. 빌드 중에 일어나는 자세한 내용은 `scripts/build.js` 및 `package.json` 스크립트를 참조하세요.

### 샌드박싱 활성화

[샌드박싱](#샌드박싱)은 강력히 권장되며, 최소한 `~/.env`에 `QWEN_SANDBOX=true`를 설정하고 샌드박싱 제공업체(예: `macOS Seatbelt`, `docker`, `podman`)를 사용할 수 있어야 합니다. 자세한 내용은 [샌드박싱](#샌드박싱) 섹션을 참조하세요.

`qwen-code` CLI 유틸리티와 샌드박스 컨테이너를 모두 빌드하려면 루트 디렉토리에서 `build:all`을 실행하세요:

```bash
npm run build:all
```

샌드박스 컨테이너 빌드를 건너뛰려면 대신 `npm run build`를 사용할 수 있습니다.

### 실행하기

빌드 후 소스 코드에서 Qwen Code 애플리케이션을 시작하려면 루트 디렉토리에서 다음 명령을 실행하세요:

```bash
npm start
```

소스 빌드를 qwen-code 폴더 외부에서 실행하려면 `npm link path/to/qwen-code/packages/cli` ([문서](https://docs.npmjs.com/cli/v9/commands/npm-link) 참조)를 사용하여 `qwen-code`로 실행할 수 있습니다.

### 테스트 실행

이 프로젝트에는 단위 테스트와 통합 테스트의 두 가지 유형의 테스트가 있습니다.

#### 단위 테스트

프로젝트의 단위 테스트 제품군을 실행하려면:

```bash
npm run test
```

이 명령은 `packages/core` 및 `packages/cli` 디렉토리에 있는 테스트를 실행합니다. 변경 사항을 제출하기 전에 테스트가 통과하는지 확인하세요. 더 포괄적인 확인을 위해 `npm run preflight`를 실행하는 것을 권장합니다.

#### 통합 테스트

통합 테스트는 Qwen Code의 종단간 기능을 검증하도록 설계되었습니다. 기본 `npm run test` 명령의 일부로 실행되지 않습니다.

통합 테스트를 실행하려면 다음 명령을 사용하세요:

```bash
npm run test:e2e
```

통합 테스트 프레임워크에 대한 자세한 내용은 [통합 테스트 문서](./docs/integration-tests.md)를 참조하세요.

### 린팅 및 Preflight 체크

코드 품질과 포맷 일관성을 보장하기 위해 preflight 체크를 실행하세요:

```bash
npm run preflight
```

이 명령은 ESLint, Prettier, 모든 테스트 및 프로젝트의 `package.json`에 정의된 기타 체크를 실행합니다.

_팁_

저장소를 복제한 후 git precommit 훅 파일을 생성하여 커밋이 항상 깨끗한지 확인하세요.

```bash
echo "
# Run npm build and check for errors
if ! npm run preflight; then
  echo \"npm build failed. Commit aborted.\"
  exit 1
fi
" > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

#### 포매팅

이 프로젝트의 코드를 별도로 포맷하려면 루트 디렉토리에서 다음 명령을 실행하세요:

```bash
npm run format
```

이 명령은 Prettier를 사용하여 프로젝트의 스타일 가이드라인에 따라 코드를 포맷합니다.

#### 린팅

코드를 별도로 린트하려면 루트 디렉토리에서 다음 명령을 실행하세요:

```bash
npm run lint
```

### 코딩 컨벤션

- 기존 코드베이스 전체에서 사용되는 코딩 스타일, 패턴 및 컨벤션을 준수해 주세요.
- **임포트:** 임포트 경로에 특별히 주의해 주세요. 프로젝트는 ESLint를 사용하여 패키지 간의 상대 임포트 제한을 강제합니다.

### 프로젝트 구조

- `packages/`: 프로젝트의 개별 하위 패키지를 포함합니다.
  - `cli/`: 명령줄 인터페이스.
  - `core/`: Qwen Code의 핵심 백엔드 로직.
- `docs/`: 모든 프로젝트 문서를 포함합니다.
- `scripts/`: 빌드, 테스트 및 개발 작업을 위한 유틸리티 스크립트.

더 자세한 아키텍처는 `docs/architecture.md`를 참조하세요.

## 문서 개발

이 섹션은 문서를 로컬에서 개발하고 미리 보는 방법을 설명합니다.

### 전제 조건

1. Node.js (버전 18+) 설치 여부 확인
2. npm 또는 yarn 사용 가능 여부 확인

### 로컬에서 문서 사이트 설정

문서 작업을 하고 변경 사항을 로컬에서 미리 보려면:

1. `docs-site` 디렉토리로 이동합니다:

   ```bash
   cd docs-site
   ```

2. 종속성 설치:

   ```bash
   npm install
   ```

3. 메인 `docs` 디렉토리의 문서 콘텐츠 연결:

   ```bash
   npm run link
   ```

   이 명령은 `../docs`에서 docs-site 프로젝트의 `content`로 심볼릭 링크를 생성하여 Next.js 사이트에서 문서 콘텐츠를 제공할 수 있게 합니다.

4. 개발 서버 시작:

   ```bash
   npm run dev
   ```

5. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 변경 사항이 실시간으로 업데이트되는 문서 사이트를 확인합니다.

메인 `docs` 디렉토리의 문서 파일을 변경하면 문서 사이트에 즉시 반영됩니다.

## 디버깅

### VS Code:

0.  `F5` 키를 사용하여 VS Code에서 대화형으로 CLI를 디버깅할 수 있습니다.
1.  루트 디렉토리에서 디버그 모드로 CLI를 시작합니다:
    ```bash
    npm run debug
    ```
    이 명령은 `packages/cli` 디렉토리 내에서 `node --inspect-brk dist/index.js`를 실행하여 디버거가 연결될 때까지 실행을 일시 중지합니다. 그런 다음 Chrome 브라우저에서 `chrome://inspect`를 열어 디버거에 연결할 수 있습니다.
2.  VS Code에서 "Attach" 실행 구성(`.vscode/launch.json`에 있음)을 사용하세요.

또는 현재 열려 있는 파일을 직접 실행하려는 경우 VS Code에서 "Launch Program" 구성을 사용할 수 있지만, 일반적으로 'F5'를 권장합니다.

샌드박스 컨테이너 내부의 중단점에 도달하려면 다음을 실행하세요:

```bash
DEBUG=1 qwen-code
```

**참고:** 프로젝트의 `.env` 파일에 `DEBUG=true`가 있어도 자동 제외로 인해 qwen-code에는 영향을 미치지 않습니다. qwen-code 전용 디버그 설정에는 `.qwen-code/.env` 파일을 사용하세요.

### React DevTools

CLI의 React 기반 UI를 디버깅하기 위해 React DevTools를 사용할 수 있습니다. CLI 인터페이스에 사용된 라이브러리인 Ink는 React DevTools 버전 4.x와 호환됩니다.

1.  **Qwen Code 애플리케이션을 개발 모드로 시작:**

    ```bash
    DEV=true npm start
    ```

2.  **React DevTools 버전 4.28.5(또는 호환되는 최신 4.x 버전) 설치 및 실행:**

    전역으로 설치하거나:

    ```bash
    npm install -g react-devtools@4.28.5
    react-devtools
    ```

    npx를 사용하여 직접 실행할 수 있습니다:

    ```bash
    npx react-devtools@4.28.5
    ```

    실행 중인 CLI 애플리케이션이 React DevTools에 연결됩니다.

## 샌드박싱

> 추후 작성 예정

## 수동 배포

우리는 모든 커밋에 대해 내부 레지스트리에 아티팩트를 배포합니다. 하지만 수동으로 로컬 빌드를 생성해야 하는 경우 다음 명령을 실행하세요:

```bash
npm run clean
npm install
npm run auth
npm run prerelease:dev
npm publish --workspaces
```
