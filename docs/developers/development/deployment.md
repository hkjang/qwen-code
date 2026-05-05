# Qwen 코드 실행 및 배포

이 문서에서는 Qwen Code를 실행하는 방법을 설명하고 Qwen Code가 사용하는 배포 아키텍처를 설명합니다.

## Qwen 코드 실행

Qwen Code를 실행하는 방법에는 여러 가지가 있습니다. 선택하는 옵션은 사용하려는 방법에 따라 다릅니다.

***

### 1. 표준 설치(일반 사용자에게 권장)

이는 최종 사용자가 Qwen Code를 설치하는 데 권장되는 방법입니다. NPM 레지스트리에서 Qwen Code 패키지를 다운로드하는 작업이 포함됩니다.

* **글로벌 설치:**

  ```bash
  npm install -g @qwen-code/qwen-code
  ```

  그런 다음 어디에서나 CLI를 실행하세요.

  ```bash
  qwen
  ```

* **NPX 실행:**

  ```bash
  # Execute the latest version from NPM without a global install
  npx @qwen-code/qwen-code
  ```

***

### 2. 샌드박스에서 실행(Docker/Podman)

보안 및 격리를 위해 Qwen Code는 컨테이너 내부에서 실행될 수 있습니다. 이는 CLI가 부작용이 있을 수 있는 도구를 실행하는 기본 방법입니다.

* **레지스트리에서 직접:**게시된 샌드박스 이미지를 직접 실행할 수 있습니다. 이는 Docker만 있고 CLI를 실행하려는 환경에 유용합니다.
  ```bash
  # Run the published sandbox image
  docker run --rm -it ghcr.io/qwenlm/qwen-code:0.0.11
  ```
* **사용하여`--sandbox`깃발:**Qwen Code를 로컬에 설치한 경우(위에 설명된 표준 설치 사용) 샌드박스 컨테이너 내에서 실행되도록 지시할 수 있습니다.
  ```bash
  qwen --sandbox -y -p "your prompt here"
  ```

***

### 3. 소스에서 실행(Qwen Code 기여자에게 권장)

프로젝트 기여자는 소스 코드에서 직접 CLI를 실행하기를 원할 것입니다.

* **개발 모드:**이 방법은 핫 리로딩을 제공하며 활성 개발에 유용합니다.
  ```bash
  # From the root of the repository
  npm run start
  ```
* **프로덕션과 유사한 모드(링크된 패키지):**이 방법은 로컬 패키지를 연결하여 전역 설치를 시뮬레이션합니다. 프로덕션 워크플로에서 로컬 빌드를 테스트하는 데 유용합니다.

  ```bash
  # Link the local cli package to your global node_modules
  npm link packages/cli

  # Now you can run your local version using the `qwen` command
  qwen
  ```

***

### 4. GitHub에서 최신 Qwen Code 커밋 실행

GitHub 리포지토리에서 가장 최근에 커밋된 Qwen Code 버전을 직접 실행할 수 있습니다. 이는 아직 개발 중인 기능을 테스트하는 데 유용합니다.

```bash
# Execute the CLI directly from the main branch on GitHub
npx https://github.com/QwenLM/qwen-code
```

## 배포 아키텍처

위에 설명된 실행 방법은 다음과 같은 아키텍처 구성 요소 및 프로세스를 통해 가능해집니다.

**NPM 패키지**

Qwen Code 프로젝트는 NPM 레지스트리에 핵심 패키지를 게시하는 모노레포입니다.

* `@qwen-code/qwen-code-core`: 백엔드, 처리 논리 및 도구 실행입니다.
* `@qwen-code/qwen-code`: 사용자를 향한 프런트엔드입니다.

이 패키지는 표준 설치를 수행할 때와 소스에서 Qwen Code를 실행할 때 사용됩니다.

**빌드 및 패키징 프로세스**

배포 채널에 따라 두 가지 고유한 빌드 프로세스가 사용됩니다.

* **NPM 출판물:**NPM 레지스트리에 게시하려면 다음의 TypeScript 소스 코드를 사용하세요.`@qwen-code/qwen-code-core`그리고`@qwen-code/qwen-code`TypeScript 컴파일러(`tsc`). 결과`dist/`디렉토리는 NPM 패키지에 게시되는 것입니다. 이는 TypeScript 라이브러리에 대한 표준 접근 방식입니다.

* **GitHub`npx`실행:**GitHub에서 최신 버전의 Qwen Code를 직접 실행하면 다음 프로세스에 의해 다른 프로세스가 트리거됩니다.`prepare`스크립트`package.json`. 이 스크립트는`esbuild`전체 애플리케이션과 해당 종속성을 하나의 독립된 JavaScript 파일로 묶습니다. 이 번들은 사용자 컴퓨터에서 즉시 생성되며 저장소에 체크인되지 않습니다.

**Docker 샌드박스 이미지**

Docker 기반 실행 방법은 다음에서 지원됩니다.`qwen-code-sandbox`컨테이너 이미지. 이 이미지는 컨테이너 레지스트리에 게시되며 Qwen Code의 사전 설치된 글로벌 버전이 포함되어 있습니다.

## 출시 과정

릴리스 프로세스는 GitHub Actions를 통해 자동화됩니다. 릴리스 워크플로는 다음 작업을 수행합니다.

1. 다음을 사용하여 NPM 패키지를 빌드합니다.`tsc`.
2. NPM 패키지를 아티팩트 레지스트리에 게시합니다.
3. 번들 자산으로 GitHub 릴리스를 만듭니다.
