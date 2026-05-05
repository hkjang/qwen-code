# 기여하는 방법

우리는 이 프로젝트에 대한 귀하의 패치와 기여를 환영합니다.

## 기여 프로세스

### 코드 리뷰

프로젝트 구성원의 제출물을 포함한 모든 제출물에는 검토가 필요합니다. 우리 
사용하다[GitHub 풀 요청](https://docs.github.com/articles/about-pull-requests)이 목적을 위해.

### Pull Request Guidelines

귀하의 PR을 신속하게 검토하고 병합할 수 있도록 다음 지침을 따르십시오. 이러한 기준을 충족하지 않는 PR은 폐쇄될 수 있습니다.

#### 1. 기존 이슈에 대한 링크

모든 PR은 추적기의 기존 문제에 연결되어야 합니다. 이렇게 하면 코드를 작성하기 전에 모든 변경 사항이 논의되고 프로젝트 목표에 맞춰 조정됩니다.

* **버그 수정:**PR은 버그 보고서 문제와 연결되어야 합니다.
* **기능의 경우:**PR은 관리자가 승인한 기능 요청 또는 제안 문제와 연결되어야 합니다.

변경사항에 대한 문제가 존재하지 않는 경우**먼저 하나 열어봐**코딩을 시작하기 전에 피드백을 기다리세요.

#### 2. 작게 집중해서 유지하세요

우리는 단일 문제를 해결하거나 단일 독립 기능을 추가하는 소규모의 원자적 PR을 선호합니다.

* **하다:**특정 버그 하나를 수정하거나 특정 기능 하나를 추가하는 PR을 만듭니다.
* **하지 않다:**관련되지 않은 여러 변경 사항(예: 버그 수정, 새로운 기능, 리팩터링)을 단일 PR로 묶습니다.

큰 변경 사항은 독립적으로 검토하고 병합할 수 있는 일련의 더 작은 논리적 PR로 나누어야 합니다.

#### 3. 진행 중인 작업에 초안 PR을 사용하세요.

작업에 대한 초기 피드백을 받으려면 GitHub의**초안 풀 요청**특징. 이는 PR이 아직 공식적인 검토를 받을 준비가 되지 않았지만 토론 및 초기 피드백을 위해 열려 있다는 신호를 유지관리자에게 보냅니다.

#### 4. 모든 검사가 통과되었는지 확인하세요.

PR을 제출하기 전에 다음을 실행하여 모든 자동 검사가 통과되었는지 확인하세요.`npm run preflight`. 이 명령은 모든 테스트, Linting 및 기타 스타일 검사를 실행합니다.

#### 5. 문서 업데이트

PR에서 사용자가 직면하는 변경 사항(예: 새 명령, 수정된 플래그 또는 동작 변경)을 도입하는 경우 다음에서 관련 문서도 업데이트해야 합니다.`/docs`예배 규칙서.

#### 6. 명확한 커밋 메시지와 좋은 PR 설명을 작성하세요.

PR에는 명확하고 설명이 포함된 제목과 변경 사항에 대한 자세한 설명이 있어야 합니다. 따라가다[기존 커밋](https://www.conventionalcommits.org/)커밋 메시지의 표준입니다.

* **좋은 홍보 제목:** `feat(cli): Add --json flag to 'config get' command`
* **잘못된 PR 제목:** `Made some changes`

PR 설명에서 변경 이면의 '이유'를 설명하고 관련 문제에 대한 링크(예:`Fixes #123`).

## 개발 설정 및 작업 흐름

이 섹션에서는 기여자에게 이 프로젝트의 개발 설정을 구축, 수정 및 이해하는 방법을 안내합니다.

### 개발 환경 설정

**전제 조건:**

1. **Node.js**:
   * **개발:**Node.js를 사용하세요`~20.19.0`. 이 특정 버전은 업스트림 개발 종속성 문제로 인해 필요합니다. 다음과 같은 도구를 사용할 수 있습니다.[NVM](https://github.com/nvm-sh/nvm)Node.js 버전을 관리합니다.
   * **생산:**프로덕션 환경에서 CLI를 실행하려면 Node.js의 모든 버전이 필요합니다.`>=20`허용됩니다.
2. **힘내**

### 빌드 프로세스

저장소를 복제하려면 다음 안내를 따르세요.

```bash
git clone https://github.com/QwenLM/qwen-code.git # Or your fork's URL
cd qwen-code
```

다음에 정의된 종속성을 설치하려면`package.json`루트 종속성도 마찬가지입니다.

```bash
npm install
```

전체 프로젝트(모든 패키지)를 빌드하려면:

```bash
npm run build
```

이 명령은 일반적으로 TypeScript를 JavaScript로 컴파일하고, 자산을 묶고, 실행할 패키지를 준비합니다. 참조`scripts/build.js`그리고`package.json`빌드 중에 일어나는 일에 대한 자세한 내용은 스크립트를 참조하세요.

### 샌드박싱 활성화

[샌드박싱](#sandboxing)적극 권장되며 최소한의 설정이 필요합니다.`QWEN_SANDBOX=true`당신의`~/.env`샌드박싱 제공업체 확보(예:`macOS Seatbelt`,`docker`, 또는`podman`)을 사용할 수 있습니다. 보다[샌드박싱](#sandboxing)자세한 내용은.

두 가지를 모두 구축하려면`qwen-code`CLI 유틸리티 및 샌드박스 컨테이너를 실행합니다.`build:all`루트 디렉터리에서:

```bash
npm run build:all
```

샌드박스 컨테이너 빌드를 건너뛰려면 다음을 사용할 수 있습니다.`npm run build`대신에.

### 달리기

소스 코드에서 Qwen Code 애플리케이션을 시작하려면(빌드 후) 루트 디렉터리에서 다음 명령을 실행합니다.

```bash
npm start
```

qwen-code 폴더 외부에서 소스 빌드를 실행하려면 다음을 활용하세요.`npm link path/to/qwen-code/packages/cli`(보다:[문서](https://docs.npmjs.com/cli/v9/commands/npm-link))와 함께 실행`qwen-code`

### 테스트 실행

이 프로젝트에는 단위 테스트와 통합 테스트라는 두 가지 유형의 테스트가 포함되어 있습니다.

#### 단위 테스트

프로젝트에 대한 단위 테스트 도구 모음을 실행하려면 다음 안내를 따르세요.

```bash
npm run test
```

그러면 다음 위치에 있는 테스트가 실행됩니다.`packages/core`그리고`packages/cli`디렉토리. 변경 사항을 제출하기 전에 테스트를 통과했는지 확인하세요. 보다 포괄적인 검사를 위해서는 다음을 실행하는 것이 좋습니다.`npm run preflight`.

#### 통합 테스트

통합 테스트는 Qwen Code의 엔드투엔드 기능을 검증하도록 설계되었습니다. 기본값의 일부로 실행되지 않습니다.`npm run test`명령.

통합 테스트를 실행하려면 다음 명령을 사용하십시오.

```bash
npm run test:e2e
```

통합 테스트 프레임워크에 대한 자세한 내용은 다음을 참조하세요.[통합 테스트 문서](./docs/integration-tests.md).

### 린팅 및 실행 전 검사

코드 품질과 형식 일관성을 보장하려면 실행 전 검사를 실행하세요.

```bash
npm run preflight
```

이 명령은 프로젝트에 정의된 대로 ESLint, Prettier, 모든 테스트 및 기타 검사를 실행합니다.`package.json`.

*프로팁*

복제 후 git precommit 후크 파일을 생성하여 커밋이 항상 깔끔하게 유지되도록 하세요.

```bash
echo "
# Run npm build and check for errors
if ! npm run preflight; then
  echo "npm build failed. Commit aborted."
  exit 1
fi
" > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

#### 서식 지정

루트 디렉터리에서 다음 명령을 실행하여 이 프로젝트의 코드 형식을 별도로 지정하려면:

```bash
npm run format
```

이 명령은 Prettier를 사용하여 프로젝트의 스타일 지침에 따라 코드 형식을 지정합니다.

#### 린팅

이 프로젝트의 코드를 별도로 린트하려면 루트 디렉터리에서 다음 명령을 실행합니다.

```bash
npm run lint
```

### 코딩 규칙

* 기존 코드베이스 전체에서 사용되는 코딩 스타일, 패턴 및 규칙을 준수하세요.
* **수입품:** Pay special attention to import paths. The project uses ESLint to enforce restrictions on relative imports between packages.

### 프로젝트 구조

* `packages/`: 프로젝트의 개별 하위 패키지가 포함되어 있습니다.
  * `cli/`: 이 명령은-line interface.
  * `core/`: Qwen Code의 핵심 백엔드 로직입니다.
* `docs/`: 모든 프로젝트 문서가 포함되어 있습니다.
* `scripts/`: 빌드, 테스트, 개발 작업을 위한 유틸리티 스크립트입니다.

자세한 아키텍처는 다음을 참조하세요.`docs/architecture.md`.

## 문서 개발

이 섹션에서는 문서를 로컬에서 개발하고 미리 보는 방법을 설명합니다.

### 전제조건

1. Node.js(버전 18+)가 설치되어 있는지 확인하세요.
2. npm 또는 Yarn을 사용할 수 있음

### 로컬로 문서 사이트 설정

로컬에서 문서 작업을 하고 변경 사항을 미리 보려면 다음을 수행하세요.

1. 다음으로 이동하세요.`docs-site`예배 규칙서:

   ```bash
   cd docs-site
   ```

2. 종속성을 설치합니다.

   ```bash
   npm install
   ```

3. 기본 문서 내용을 링크하세요.`docs`예배 규칙서:

   ```bash
   npm run link
   ```

   그러면 다음에서 심볼릭 링크가 생성됩니다.`../docs`에게`content`docs-site 프로젝트에서 Next.js 사이트에서 문서 콘텐츠를 제공할 수 있습니다.

4. 개발 서버를 시작합니다.

   ```bash
   npm run dev
   ```

5. 열려 있는<http://localhost:3000>브라우저에서 변경 사항이 적용되면 실시간 업데이트가 포함된 설명서 사이트를 볼 수 있습니다.

기본 문서 파일에 대한 변경 사항`docs`디렉토리는 문서 사이트에 즉시 반영됩니다.

## 디버깅

### VS 코드:

0. CLI를 실행하여 VS Code에서 대화형으로 디버깅`F5`
1. 루트 디렉터리에서 디버그 모드로 CLI를 시작합니다.
   ```bash
   npm run debug
   ```
   이 명령은 실행됩니다`node --inspect-brk dist/index.js`이내에`packages/cli`디버거가 연결될 때까지 실행을 일시 중지합니다. 그런 다음 열 수 있습니다`chrome://inspect`Chrome 브라우저에서 디버거에 연결합니다.
2. VS Code에서는 "연결" 시작 구성을 사용합니다(다음 위치에 있음).`.vscode/launch.json`).

또는 현재 열려 있는 파일을 직접 실행하려는 경우 VS Code에서 "프로그램 실행" 구성을 사용할 수 있지만 일반적으로 'F5' 키를 사용하는 것이 좋습니다.

샌드박스 컨테이너 내부에서 중단점에 도달하려면 다음을 실행하세요.

```bash
DEBUG=1 qwen-code
```

**메모:**만약 당신이`DEBUG=true`프로젝트에서`.env`파일의 경우 자동 제외로 인해 qwen-code에는 영향을 미치지 않습니다. 사용`.qwen-code/.env`qwen 코드 특정 디버그 설정을 위한 파일입니다.

### React DevTools

CLI의 React 기반 UI를 디버그하려면 React DevTools를 사용할 수 있습니다. CLI 인터페이스에 사용되는 라이브러리인 Ink는 React DevTools 버전 4.x와 호환됩니다.

1. **개발 모드에서 Qwen Code 애플리케이션을 시작합니다.**

   ```bash
   DEV=true npm start
   ```

2. **React DevTools 버전 4.28.5(또는 호환되는 최신 4.x 버전)를 설치하고 실행합니다.**

   전역적으로 설치할 수 있습니다.

   ```bash
   npm install -g react-devtools@4.28.5
   react-devtools
   ```

   또는 npx를 사용하여 직접 실행하십시오.

   ```bash
   npx react-devtools@4.28.5
   ```

   그러면 실행 중인 CLI 애플리케이션이 React DevTools에 연결되어야 합니다.

## 샌드박싱

> 미정

## 수동 게시

우리는 내부 레지스트리에 각 커밋에 대한 아티팩트를 게시합니다. 그러나 로컬 빌드를 수동으로 잘라야 하는 경우 다음 명령을 실행하세요.

```
npm run clean
npm install
npm run auth
npm run prerelease:dev
npm publish --workspaces
```
