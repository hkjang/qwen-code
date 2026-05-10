## 샌드박스 환경 사용자 정의(Docker/Podman)

### 현재 프로젝트는 npm 패키지를 통해 설치 후 BUILD_SANDBOX 기능 사용을 지원하지 않습니다.

1. 사용자 정의 샌드박스를 빌드하려면 소스 코드 저장소의 빌드 스크립트(scripts/build_sandbox.js)에 액세스해야 합니다.
2. 이러한 빌드 스크립트는 npm에서 출시한 패키지에 포함되어 있지 않습니다.
3. 코드에는 소스 코드가 아닌 환경의 빌드 요청을 명시적으로 거부하는 하드 코딩된 경로 검사가 포함되어 있습니다.

컨테이너 내부에 추가 도구가 필요한 경우(예:`git`,`python`,`rg`), 사용자 정의 Dockerfile을 생성합니다. 구체적인 작업은 다음과 같습니다.

#### 1、먼저 qwen 코드 프로젝트를 복제하고,<https://github.com/QwenLM/qwen-code.git>

#### 2、소스 코드 저장소 디렉터리에서 다음 작업을 수행해야 합니다.

```bash
# 1. First, install the dependencies of the project
npm install

# 2. Build the Qwen Code project
npm run build

# 3. Verify that the dist directory has been generated
ls -la packages/cli/dist/

# 4. Create a global link in the CLI package directory
cd packages/cli
npm link

# 5. Verification link (it should now point to the source code)
which qwen
# Expected output: /xxx/xxx/.nvm/versions/node/v24.11.1/bin/qwen
# Or similar paths, but it should be a symbolic link

# 6. For details of the symbolic link, you can see the specific source code path
ls -la $(dirname $(which qwen))/../lib/node_modules/@qwen-code/qwen-code
# It should show that this is a symbolic link pointing to your source code directory

# 7.Test the version of qwen
qwen -v
# npm link will overwrite the global qwen. To avoid being unable to distinguish the same version number, you can uninstall the global CLI first

```

#### 3、자신의 프로젝트 루트 디렉터리에 샌드박스 Dockerfile을 만듭니다.

- 길:`.qwen/sandbox.Dockerfile`

- 공식 미러 이미지 주소:<https://github.com/QwenLM/qwen-code/pkgs/container/qwen-code>

```bash
# Based on the official Qwen sandbox image (It is recommended to explicitly specify the version)
FROM ghcr.io/qwenlm/qwen-code:sha-570ec43
# Add your extra tools here
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    ripgrep
```

#### 4、프로젝트의 루트 디렉터리 아래에 첫 번째 샌드박스 이미지를 만듭니다.

```bash
QWEN_SANDBOX=docker BUILD_SANDBOX=1 qwen -s
# Observe whether the sandbox version of the tool you launched is consistent with the version of your custom image. If they are consistent, the startup will be successful
```

그러면 기본 샌드박스 이미지를 기반으로 프로젝트별 이미지가 빌드됩니다.

#### npm 링크 제거

- qwen의 공식 CLI를 복원하려면 npm 링크를 제거하세요.

```bash
# Method 1: Unlink globally
npm unlink -g @qwen-code/qwen-code

# Method 2: Remove it in the packages/cli directory
cd packages/cli
npm unlink

# Verification has been lifted
which qwen
# It should display "qwen not found"

# Reinstall the global version if necessary
npm install -g @qwen-code/qwen-code

# Verification Recovery
which qwen
qwen --version
```
