# 확장 출시

사용자에게 확장 기능을 릴리스하는 세 가지 기본 방법은 다음과 같습니다.

* [힘내 저장소](#releasing-through-a-git-repository)
* [Github 릴리스](#releasing-through-github-releases)
* [npm 레지스트리](#releasing-through-npm-registry)

Git 리포지토리 릴리스는 가장 간단하고 유연한 접근 방식인 반면, GitHub 릴리스는 각 파일을 개별적으로 다운로드하는 git clone을 요구하는 대신 단일 아카이브로 제공되므로 초기 설치 시 더 효율적일 수 있습니다. 플랫폼별 바이너리 파일을 제공해야 하는 경우 Github 릴리스에는 플랫폼별 아카이브가 포함될 수도 있습니다. npm 레지스트리 릴리스는 특히 프라이빗 레지스트리와 함께 패키지 배포에 이미 npm을 사용하는 팀에 이상적입니다.

## git 저장소를 통해 릴리스

이것은 가장 유연하고 간단한 옵션입니다. 공개적으로 액세스할 수 있는 git 저장소(예: 공개 github 저장소)를 생성하기만 하면 사용자는 다음을 사용하여 확장 프로그램을 설치할 수 있습니다.`qwen extensions install <your-repo-uri>`, 또는 GitHub 저장소의 경우 단순화된`qwen extensions install <org>/<repo>`체재. 선택적으로 다음을 사용하여 특정 참조(브랜치/태그/커밋)에 의존할 수 있습니다.`--ref=<some-ref>`인수의 경우 기본값은 기본 분기입니다.

사용자가 의존하는 참조로 커밋이 푸시될 때마다 확장을 업데이트하라는 메시지가 표시됩니다. 이는 또한 쉬운 롤백을 허용하며 HEAD 커밋은 파일의 실제 버전에 관계없이 항상 최신 버전으로 처리됩니다.`qwen-extension.json`파일.

### git 저장소를 사용하여 릴리스 채널 관리

사용자는 여러 릴리스 채널을 관리할 수 있는 브랜치나 태그와 같은 Git 저장소의 모든 참조에 의존할 수 있습니다.

예를 들어, 다음을 유지할 수 있습니다.`stable`사용자가 이 방법으로 설치할 수 있는 브랜치`qwen extensions install <your-repo-uri> --ref=stable`. 또는 기본 브랜치를 안정적인 릴리스 브랜치로 처리하고 다른 브랜치(예:`dev`). 원하는 만큼 많은 브랜치나 태그를 유지 관리하여 귀하와 사용자에게 최대한의 유연성을 제공할 수 있습니다.

참고하세요`ref`인수는 태그, 브랜치 또는 특정 커밋이 될 수 있으며 이를 통해 사용자는 확장 프로그램의 특정 버전에 의존할 수 있습니다. 태그와 브랜치를 관리하는 방법은 귀하에게 달려 있습니다.

### git repo를 사용한 릴리스 흐름 예시

Git 흐름을 사용하여 릴리스를 관리하는 방법에는 여러 가지 옵션이 있지만 기본 브랜치를 "안정적인" 릴리스 브랜치로 취급하는 것이 좋습니다. 이는 기본 동작이`qwen extensions install <your-repo-uri>`안정적인 릴리스 지점에 있어야합니다.

세 가지 표준 릴리스 채널을 유지하고 싶다고 가정해 보겠습니다.`stable`,`preview`, 그리고`dev`. 당신은 모든 표준 개발을`dev`나뭇가지. 미리보기 릴리스를 수행할 준비가 되면 해당 분기를`preview`나뭇가지. 미리보기 분기를 안정 버전으로 승격할 준비가 되면 병합합니다.`preview`안정적인 브랜치(기본 브랜치일 수도 있고 다른 브랜치일 수도 있음)로 이동합니다.

다음을 사용하여 한 분기에서 다른 분기로 변경 사항을 선별적으로 선택할 수도 있습니다.`git cherry-pick`, 그러나 기록을 깨끗한 상태로 복원하기 위해 각 릴리스에서 브랜치에 푸시 변경을 강제로 적용하지 않는 한, 이렇게 하면 브랜치가 서로 약간씩 다른 기록을 갖게 된다는 점에 유의하세요(저장소 설정에 따라 기본 브랜치에서는 불가능할 수 있음). 체리 선택을 계획하고 있다면 일반적으로 피해야 하는 기본 브랜치로 강제 푸시하는 것을 피하기 위해 기본 브랜치를 안정적인 브랜치로 설정하지 않는 것이 좋습니다.

## Github 릴리스를 통해 릴리스

Qwen 코드 확장은 다음을 통해 배포될 수 있습니다.[GitHub 릴리스](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases). 이렇게 하면 저장소를 복제할 필요가 없으므로 사용자에게 더 빠르고 안정적인 초기 설치 환경을 제공합니다.

각 릴리스에는 연결된 태그에 저장소의 전체 내용이 포함된 아카이브 파일이 하나 이상 포함되어 있습니다. 릴리스에는 다음이 포함될 수도 있습니다.[사전 구축된 아카이브](#custom-pre-built-archives)확장에 빌드 단계가 필요하거나 플랫폼별 바이너리가 연결된 경우.

업데이트를 확인할 때 qwen 코드는 사용자가 다음을 전달하여 특정 릴리스를 설치하지 않는 한 github에서 최신 릴리스를 찾습니다(릴리스를 생성할 때 최신 릴리스로 표시해야 함).`--ref=<some-release-tag>`. 현재로서는 시험판 릴리스 또는 semver 선택을 지원하지 않습니다.

### 사전 구축된 맞춤형 아카이브

사용자 정의 아카이브는 자산으로 github 릴리스에 직접 첨부되어야 하며 완전히 독립적이어야 합니다. 이는 전체 확장을 포함해야 함을 의미합니다.[아카이브 구조](#archive-structure).

확장이 플랫폼 독립적인 경우 단일 일반 자산을 제공할 수 있습니다. 이 경우 릴리스에는 하나의 자산만 첨부되어야 합니다.

더 큰 저장소 내에서 확장 기능을 개발하려는 경우 사용자 정의 아카이브를 사용할 수도 있습니다. 저장소 자체와 다른 레이아웃을 가진 아카이브를 구축할 수 있습니다(예를 들어 확장 기능이 포함된 하위 디렉터리의 아카이브일 수도 있습니다).

#### 플랫폼별 아카이브

Qwen Code가 각 플랫폼에 대한 올바른 릴리스 자산을 자동으로 찾을 수 있도록 하려면 이 명명 규칙을 따라야 합니다. CLI는 다음 순서로 자산을 검색합니다.

1. **플랫폼 및 아키텍처별:** `{platform}.{arch}.{name}.{extension}`
2. **플랫폼별:** `{platform}.{name}.{extension}`
3. **일반적인:**하나의 자산만 제공되는 경우 일반 대체 수단으로 사용됩니다.

* `{name}`: 확장 이름입니다.
* `{platform}`: 운영 체제. 지원되는 값은 다음과 같습니다.
  * `darwin`(맥OS)
  * `linux`
  * `win32`(윈도우)
* `{arch}`: 건축. 지원되는 값은 다음과 같습니다.
  * `x64`
  * `arm64`
* `{extension}`: 아카이브의 파일 확장자(예:`.tar.gz`또는`.zip`).

**예:**

* `darwin.arm64.my-tool.tar.gz`(Apple Silicon Mac에만 해당)
* `darwin.my-tool.tar.gz`(모든 Mac용)
* `linux.x64.my-tool.tar.gz`
* `win32.my-tool.zip`

#### Archive structure

아카이브는 완전히 포함된 확장이어야 하며 모든 표준 요구 사항을 충족해야 합니다.`qwen-extension.json`파일은 아카이브의 루트에 있어야 합니다.

나머지 레이아웃은 일반적인 확장과 정확히 동일하게 보입니다.[확장명.md](extension.md).

#### GitHub Actions 워크플로 예시

다음은 여러 플랫폼용 Qwen Code 확장을 빌드하고 릴리스하는 GitHub Actions 워크플로의 예입니다.

```yaml
name: Release Extension

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build extension
        run: npm run build

      - name: Create release assets
        run: |
          npm run package -- --platform=darwin --arch=arm64
          npm run package -- --platform=linux --arch=x64
          npm run package -- --platform=win32 --arch=x64

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            release/darwin.arm64.my-tool.tar.gz
            release/linux.arm64.my-tool.tar.gz
            release/win32.arm64.my-tool.zip
```

## npm 레지스트리를 통해 릴리스

Qwen 코드 확장을 범위가 지정된 npm 패키지로 게시할 수 있습니다(예:`@your-org/my-extension`). 이는 다음과 같은 경우에 적합합니다.

* 귀하의 팀은 이미 패키지 배포를 위해 npm을 사용하고 있습니다.
* 기존 인증 인프라에 대한 개인 레지스트리 지원이 필요합니다.
* npm에서 처리되는 버전 확인 및 액세스 제어를 원합니다.

### 패키지 요구사항

npm 패키지에는 다음이 포함되어야 합니다.`qwen-extension.json`패키지 루트에 있는 파일입니다. 이는 모든 Qwen Code 확장에서 사용되는 것과 동일한 구성 파일입니다. npm tarball은 단순히 또 다른 전달 메커니즘일 뿐입니다.

최소 패키지 구조는 다음과 같습니다.

```
my-extension/
├── package.json
├── qwen-extension.json
├── QWEN.md              # optional context file
├── commands/             # optional custom commands
├── skills/               # optional custom skills
└── agents/               # optional custom subagents
```

확실하게 하다`qwen-extension.json`게시된 패키지에 포함되어 있습니다(즉, 다음에서 제외되지 않음).`.npmignore`또는`files`필드`package.json`).

### 출판

표준 npm 게시 도구를 사용하세요.

```bash
# Publish to the default registry
npm publish

# Publish to a private/custom registry
npm publish --registry https://your-registry.com
```

### 설치

사용자는 범위가 지정된 패키지 이름을 사용하여 확장 프로그램을 설치합니다.

```bash
# Install latest version
qwen extensions install @your-org/my-extension

# Install a specific version
qwen extensions install @your-org/my-extension@1.2.0

# Install from a custom registry
qwen extensions install @your-org/my-extension --registry https://your-registry.com
```

### 업데이트 동작

* 버전 핀 없이 설치된 확장 프로그램(예:`@scope/pkg`) 추적`latest`dist-tag.
* dist-tag로 설치된 확장 프로그램(예:`@scope/pkg@beta`) 해당 특정 태그를 추적합니다.
* 정확한 버전에 고정된 확장 프로그램(예:`@scope/pkg@1.2.0`)은 항상 최신 상태로 간주되며 업데이트 메시지가 표시되지 않습니다.

### 개인 레지스트리에 대한 인증

Qwen 코드는 npm 인증 자격 증명을 자동으로 읽습니다.

1. **`NPM_TOKEN`환경 변수**— 최우선 순위
2. **`.npmrc`파일**— 호스트 수준 및 경로 범위 모두 지원`_authToken`항목(예:`//your-registry.com/:_authToken=TOKEN`또는`//pkgs.dev.azure.com/org/_packaging/feed/npm/registry/:_authToken=TOKEN`)

`.npmrc`현재 디렉터리와 사용자의 홈 디렉터리에서 파일을 읽습니다.

### 출시 채널 관리

npm dist-tags를 사용하여 릴리스 채널을 관리할 수 있습니다.

```bash
# Publish a beta release
npm publish --tag beta

# Users install beta channel
qwen extensions install @your-org/my-extension@beta
```

이는 git 브랜치 기반 릴리스 채널과 유사하게 작동하지만 npm의 기본 dist-tag 메커니즘을 사용합니다.
