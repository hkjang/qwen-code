# 모래 상자

이 문서에서는 도구가 셸 명령을 실행하거나 파일을 수정할 때 위험을 줄이기 위해 샌드박스 내에서 Qwen 코드를 실행하는 방법을 설명합니다.

## 전제조건

샌드박싱을 사용하기 전에 Qwen Code를 설치하고 설정해야 합니다.

```bash
npm install -g @qwen-code/qwen-code
```

설치를 확인하려면

```bash
qwen --version
```

## 샌드박스 개요

샌드박싱은 호스트 시스템에서 잠재적으로 위험한 작업(예: 셸 명령 또는 파일 수정)을 격리하여 CLI와 환경 사이에 보안 장벽을 제공합니다.

The benefits of sandboxing include:

- **보안**: 우발적인 시스템 손상이나 데이터 손실을 방지합니다.
- **격리**: 프로젝트 디렉터리에 대한 파일 시스템 액세스를 제한합니다.
- **일관성**: 다양한 시스템에 걸쳐 재현 가능한 환경을 보장합니다.
- **안전**: 신뢰할 수 없는 코드나 실험적인 명령으로 작업할 때 위험을 줄입니다.

> \[!메모]
>
> **명명 참고 사항:**일부 샌드박스 관련 환경 변수는`GEMINI_*`역사적으로 접두사. 모든 새로운 환경 변수는`QWEN_*`접두사.

## 샌드박싱 방법

이상적인 샌드박싱 방법은 플랫폼과 선호하는 컨테이너 솔루션에 따라 다를 수 있습니다.

### 1. macOS 안전벨트(macOS 전용)

경량의 내장형 샌드박싱`sandbox-exec`.

**기본 프로필**:`permissive-open`- 프로젝트 디렉터리 외부 쓰기를 제한하지만 대부분의 다른 작업과 아웃바운드 네트워크 액세스는 허용합니다.

**다음에 가장 적합**: 빠르고, Docker가 필요하지 않으며, 파일 쓰기를 위한 강력한 가드레일입니다.

### 2. 컨테이너 기반(Docker/Podman)

완전한 프로세스 격리를 갖춘 크로스 플랫폼 샌드박싱.

기본적으로 Qwen Code는 게시된 샌드박스 이미지(CLI 패키지에 구성됨)를 사용하고 필요에 따라 이를 가져옵니다.

컨테이너 샌드박스는 작업 공간과`~/.qwen`디렉터리를 컨테이너에 추가하면 실행 간에 인증 및 설정이 유지됩니다.

**다음에 가장 적합**: 모든 OS에서 강력한 격리, 알려진 이미지 내에서 일관된 도구 사용.

### 방법 선택

- **macOS에서**:
  - 가벼운 샌드박싱을 원할 경우 안전벨트를 사용하세요(대부분의 사용자에게 권장).
  - 전체 Linux 사용자 영역(예: Linux 바이너리가 필요한 도구)이 필요한 경우 Docker/Podman을 사용하세요.
- **리눅스/윈도우에서**:
  - Docker 또는 Podman을 사용하세요.

## 빠른 시작

```bash
# Enable sandboxing with command flag
qwen -s -p "analyze the code structure"

# Or enable sandboxing for your shell session (recommended for CI / scripts)
export QWEN_SANDBOX=true   # true auto-picks a provider (see notes below)
qwen -p "run the test suite"

# Configure in settings.json
{
  "tools": {
    "sandbox": true
  }
}
```

> \[!팁]
>
> **공급자 선택 참고사항:**
>
> - \~에**macOS**,`QWEN_SANDBOX=true`일반적으로 선택`sandbox-exec`(안전벨트) 가능한 경우.
> - \~에**리눅스/윈도우**,`QWEN_SANDBOX=true`필요하다`docker`또는`podman`설치됩니다.
> - 공급자를 강제하려면 다음을 설정하십시오.`QWEN_SANDBOX=docker|podman|sandbox-exec`.

## 구성

### 샌드박스 활성화(우선순위)

1. **환경변수**:`QWEN_SANDBOX=true|false|docker|podman|sandbox-exec`
2. **명령 플래그/인수**:`-s`,`--sandbox`, 또는`--sandbox=<provider>`
3. **설정 파일**:`tools.sandbox`당신의`settings.json`(예:`{"tools": {"sandbox": true}}`).

> \[!중요한]
>
> 만약에`QWEN_SANDBOX`설정됐어, 그거**재정의**CLI 플래그 및`settings.json`.

### 샌드박스 이미지 구성(Docker/Podman)

- **CLI 플래그**:`--sandbox-image <image>`
- **환경변수**:`QWEN_SANDBOX_IMAGE=<image>`
- **설정 파일**:`tools.sandboxImage`당신의`settings.json`(예:`{"tools": {"sandboxImage": "ghcr.io/qwenlm/qwen-code:0.14.1"}}`)

우선순위(가장 높은 것에서 가장 낮은 것까지):

1. `--sandbox-image`
2. `QWEN_SANDBOX_IMAGE`
3. `tools.sandboxImage`
4. CLI 패키지의 내장 기본 이미지(예:`ghcr.io/qwenlm/qwen-code:<version>`)

`settings.env.QWEN_SANDBOX_IMAGE`일반적인 env 주입 메커니즘으로도 작동하지만`tools.sandboxImage`선호되는 영구 설정입니다.

### macOS 안전벨트 프로필

내장 프로필(다음을 통해 설정)`SEATBELT_PROFILE`환경은) :

- `permissive-open`(기본값): 쓰기 제한, 네트워크 허용
- `permissive-closed`: 쓰기 제한, 네트워크 없음
- `permissive-proxied`: 쓰기 제한, 프록시를 통한 네트워크
- `restrictive-open`: 엄격한 제한, 네트워크 허용
- `restrictive-closed`: 최대 제한
- `restrictive-proxied`: 엄격한 제한, 프록시를 통한 네트워크

> \[!팁]
>
> 다음으로 시작`permissive-open`으로 조인 다음`restrictive-closed`작업 흐름이 여전히 작동하는 경우.

### 사용자 정의 안전벨트 프로필(macOS)

사용자 정의 안전벨트 프로필을 사용하려면:

1. 라는 이름의 파일을 생성합니다.`.qwen/sandbox-macos-<profile_name>.sb`당신의 프로젝트에서.
2. 세트`SEATBELT_PROFILE=<profile_name>`.

### 사용자 정의 샌드박스 플래그

컨테이너 기반 샌드박싱의 경우 사용자 정의 플래그를`docker`또는`podman`명령을 사용하여`SANDBOX_FLAGS`환경 변수. 이는 특정 사용 사례에 대한 보안 기능 비활성화와 같은 고급 구성에 유용합니다.

**예시(팟맨)**:

볼륨 마운트에 대해 SELinux 레이블 지정을 비활성화하려면 다음을 설정하면 됩니다.

```bash
export SANDBOX_FLAGS="--security-opt label=disable"
```

여러 플래그를 공백으로 구분된 문자열로 제공할 수 있습니다.

```bash
export SANDBOX_FLAGS="--flag1 --flag2=value"
```

### 네트워크 프록시(모든 샌드박스 방법)

아웃바운드 네트워크 액세스를 허용 목록으로 제한하려면 샌드박스와 함께 로컬 프록시를 실행할 수 있습니다.

- 세트`QWEN_SANDBOX_PROXY_COMMAND=<command>`
- 이 명령은 수신 대기하는 프록시 서버를 시작해야 합니다.`:::8877`

이는 특히 다음과 같은 경우에 유용합니다.`*-proxied`안전벨트 프로필.

작동하는 허용 목록 스타일 프록시의 예는 다음을 참조하세요.[예제 프록시 스크립트](/developers/examples/proxy-script).

## Linux UID/GID 처리

Linux에서 Qwen Code는 기본적으로 UID/GID 매핑을 활성화하여 샌드박스가 사용자로 실행되고 마운트된`~/.qwen`). 다음으로 재정의:

```bash
export SANDBOX_SET_UID_GID=true   # Force host UID/GID
export SANDBOX_SET_UID_GID=false  # Disable UID/GID mapping
```

## 문제 해결

### 일반적인 문제

**"작업이 허용되지 않습니다"**

- 작업을 수행하려면 샌드박스 외부에 액세스해야 합니다.
- macOS 안전벨트: 좀 더 관대하게 시도해보세요`SEATBELT_PROFILE`.
- Docker/Podman에서: 작업 영역이 마운트되어 있고 명령에 프로젝트 디렉터리 외부 액세스가 필요하지 않은지 확인하세요.

**누락된 명령**

- 컨테이너 샌드박스: 다음을 통해 추가하세요.`.qwen/sandbox.Dockerfile`또는`.qwen/sandbox.bashrc`.
- 안전벨트: 호스트 바이너리가 사용되지만 샌드박스가 일부 경로에 대한 액세스를 제한할 수 있습니다.

**Docker 샌드박스에서는 Java를 사용할 수 없습니다.**

공식 Qwen Code Docker 이미지는 이미지를 작고 안전하며 빠르게 가져오기 위해 의도적으로 최소화되었습니다. 사용자마다 서로 다른 언어 런타임(Java, Python, Node.js 등)이 필요하며 모든 환경을 단일 이미지로 묶는 것은 실용적이지 않습니다. 그러므로 자바는**기본적으로 포함되지 않음**Docker 샌드박스에서.

워크플로에 Java가 필요한 경우`.qwen/sandbox.Dockerfile`프로젝트에서:

```dockerfile
FROM ghcr.io/qwenlm/qwen-code:latest

RUN apt-get update && \
    apt-get install -y openjdk-17-jre && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

그런 다음 샌드박스 이미지를 다시 빌드합니다.

```bash
QWEN_SANDBOX=docker BUILD_SANDBOX=1 qwen -s
```

샌드박스 사용자 정의에 대한 자세한 내용은 다음을 참조하세요.[샌드박스 환경 사용자 정의](/developers/tools/sandbox).

**네트워크 문제**

- 샌드박스 프로필이 네트워크를 허용하는지 확인하세요.
- 프록시 구성을 확인하십시오.

### 디버그 모드

```bash
DEBUG=1 qwen -s -p "debug command"
```

**메모:**만약 당신이`DEBUG=true`프로젝트에서`.env`파일의 경우 자동 제외로 인해 CLI에 영향을 미치지 않습니다. 사용`.qwen/.env`Qwen 코드 관련 디버그 설정을 위한 파일입니다.

### 샌드박스 검사

```bash
# Check environment
qwen -s -p "run shell command: env | grep SANDBOX"

# List mounts
qwen -s -p "run shell command: mount | grep workspace"
```

## 보안 참고사항

- 샌드박싱은 모든 위험을 줄여주기는 하지만 모든 위험을 제거하지는 않습니다.
- 작업을 허용하는 가장 제한적인 프로필을 사용하십시오.
- 컨테이너 오버헤드는 첫 번째 가져오기/빌드 이후 최소화됩니다.
- GUI 응용 프로그램은 샌드박스에서 작동하지 않을 수 있습니다.

## 관련 문서

- [구성](../configuration/settings): 전체 구성 옵션.
- [명령](../features/commands): 사용 가능한 명령입니다.
- [문제 해결](../support/troubleshooting): 일반적인 문제 해결.
