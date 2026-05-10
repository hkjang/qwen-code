<div align="center">

[![npm version](https://img.shields.io/npm/v/@qwen-code/qwen-code.svg)](https://www.npmjs.com/package/@qwen-code/qwen-code)
[![License](https://img.shields.io/github/license/QwenLM/qwen-code.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/@qwen-code/qwen-code.svg)](https://www.npmjs.com/package/@qwen-code/qwen-code)

<a href="https://trendshift.io/repositories/15287" target="_blank"><img src="https://trendshift.io/api/badge/repositories/15287" alt="QwenLM%2Fqwen-code | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

**터미널에서 바로 사용할 수 있는 오픈 소스 AI 에이전트.**

<a href="https://qwenlm.github.io/qwen-code-docs/zh/users/overview">中文</a> |
<a href="https://qwenlm.github.io/qwen-code-docs/de/users/overview">Deutsch</a> |
<a href="https://qwenlm.github.io/qwen-code-docs/fr/users/overview">français</a> |
<a href="https://qwenlm.github.io/qwen-code-docs/ja/users/overview">日本語</a> |
<a href="https://qwenlm.github.io/qwen-code-docs/ru/users/overview">Русский</a> |
<a href="https://qwenlm.github.io/qwen-code-docs/pt-BR/users/overview">Português (Brasil)</a>

</div>

## 🎉 소식

- **2026-04-15**: Qwen OAuth 무료 티어가 종료되었습니다. Qwen Code를 계속 사용하려면 [Alibaba Cloud Coding Plan](https://modelstudio.console.alibabacloud.com/?tab=coding-plan#/efm/coding-plan-index), [OpenRouter](https://openrouter.ai), [Fireworks AI](https://app.fireworks.ai)로 전환하거나 개별 API 키를 사용하세요. `qwen auth`를 실행하여 설정할 수 있습니다.

- **2026-04-13**: Qwen OAuth 무료 티어 정책 업데이트: 일일 할당량이 1,000회에서 100회로 조정되었습니다.

- **2026-04-02**: Qwen3.6-Plus가 출시되었습니다! [Alibaba Cloud ModelStudio](https://modelstudio.console.alibabacloud.com/ap-southeast-1?tab=doc#/doc/?type=model&url=2840914_2&modelId=qwen3.6-plus)에서 API 키를 받아 OpenAI 호환 API를 통해 접속할 수 있습니다.

- **2026-02-16**: Qwen3.5-Plus가 출시되었습니다!

## 왜 Qwen Code인가요?

Qwen Code는 Qwen 시리즈 모델에 최적화된 터미널용 오픈 소스 AI 에이전트입니다. 대규모 코드베이스를 이해하고, 지루한 작업을 자동화하며, 더 빠르게 결과물을 낼 수 있도록 도와줍니다.

- **다양한 프로토콜, 유연한 제공업체**: OpenAI / Anthropic / Gemini 호환 API, [Alibaba Cloud Coding Plan](https://modelstudio.console.alibabacloud.com/?tab=coding-plan#/efm/coding-plan-index), [OpenRouter](https://openrouter.ai), [Fireworks AI](https://app.fireworks.ai)를 사용하거나 개별 API 키를 가져와 사용할 수 있습니다.
- **오픈 소스, 동시 진화**: 프레임워크와 Qwen3-Coder 모델 모두 오픈 소스이며, 함께 출시되고 발전합니다.
- **에이전트 워크플로우, 풍부한 기능**: 에이전트 워크플로우와 Claude Code와 유사한 경험을 위한 풍부한 내장 도구(기술, 하위 에이전트)를 제공합니다.
- **터미널 우선, IDE 친화적**: 명령줄에서 주로 작업하는 개발자를 위해 제작되었으며 VS Code, Zed 및 JetBrains IDE와의 선택적 통합을 지원합니다.

![](https://gw.alicdn.com/imgextra/i1/O1CN01D2DviS1wwtEtMwIzJ_!!6000000006373-2-tps-1600-900.png)

## 설치

### 빠른 설치 (권장)

#### Linux / macOS

```bash
bash -c "$(curl -fsSL https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen.sh)"
```

#### Windows (관리자 권한으로 실행)

명령 프롬프트와 PowerShell 모두에서 작동합니다:

```cmd
powershell -Command "Invoke-WebRequest 'https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen.bat' -OutFile (Join-Path $env:TEMP 'install-qwen.bat'); & (Join-Path $env:TEMP 'install-qwen.bat')"
```

> **참고**: 설치 후 터미널을 다시 시작하여 환경 변수가 적용되도록 하는 것이 좋습니다.

### 수동 설치

#### 전제 조건

Node.js 20 이상이 설치되어 있어야 합니다. [nodejs.org](https://nodejs.org/en/download)에서 다운로드하세요.

#### NPM

```bash
npm install -g @qwen-code/qwen-code@latest
```

#### Homebrew (macOS, Linux)

```bash
brew install qwen-code
```

## 빠른 시작

```bash
# Qwen Code 시작 (대화형)
qwen

# 세션 내에서:
/help
/auth
```

처음 사용할 때 로그인 메시지가 표시됩니다. 언제든지 `/auth`를 실행하여 인증 방법을 전환할 수 있습니다.

예시 프롬프트:

```text
이 프로젝트는 무엇을 하나요?
코드베이스 구조를 설명해줘.
이 함수를 리팩토링하는 걸 도와줘.
이 모듈의 단위 테스트를 생성해줘.
```

<details>
<summary>데모 비전 보기를 보려면 클릭하세요</summary>

<video src="https://cloud.video.taobao.com/vod/HLfyppnCHplRV9Qhz2xSqeazHeRzYtG-EYJnHAqtzkQ.mp4" controls>
브라우저가 비디오 태그를 지원하지 않습니다.
</video>

</details>

## 🦞 Claw에서 코딩 작업을 위해 Qwen Code 사용하기

아래 프롬프트를 복사하여 에이전트에 붙여넣으세요:

```
Qwen Code를 코딩 에이전트로 사용하세요. 먼저 이 기술 참조를 가져와서 읽으세요:
https://raw.githubusercontent.com/QwenLM/qwen-code/refs/heads/main/.qwen/skills/qwen-code-claw/SKILL.md
그런 다음 내부 지침에 따라 acpx를 통해 모든 코딩 작업에 Qwen Code를 설치, 인증 및 사용하세요.
```

## 인증

Qwen Code는 다음과 같은 인증 방법을 지원합니다:

- **API 키 (권장)**: Alibaba Cloud Model Studio ([중국](https://bailian.console.aliyun.com/) / [글로벌](https://modelstudio.console.alibabacloud.com/)) 또는 지원되는 제공업체(OpenAI, Anthropic, Google GenAI 및 기타 호환 엔드포인트)의 API 키를 사용합니다.
- **코딩 플랜**: 고정된 월 사용료로 더 높은 할당량을 제공하는 Alibaba Cloud 코딩 플랜([중국](https://bailian.console.aliyun.com/cn-beijing?tab=coding-plan#/efm/coding-plan-index) / [글로벌](https://modelstudio.console.alibabacloud.com/?tab=coding-plan#/efm/coding-plan-index))에 가입하세요.

> ⚠️ **Qwen OAuth는 2026년 4월 15일에 종료되었습니다.** 이전에 Qwen OAuth를 사용하셨다면 위 방법 중 하나로 전환해 주세요. `qwen`을 실행한 다음 `/auth`를 입력하여 다시 설정할 수 있습니다.

#### API 키 (권장)

API 키를 사용하여 Alibaba Cloud Model Studio 또는 지원되는 제공업체에 연결합니다. 여러 프로토콜을 지원합니다:

- **OpenAI 호환**: Alibaba Cloud ModelStudio, ModelScope, OpenAI, OpenRouter 및 기타 OpenAI 호환 제공업체
- **Anthropic**: Claude 모델
- **Google GenAI**: Gemini 모델

모델과 제공업체를 설정하는 **권장** 방법은 `~/.qwen/settings.json`을 편집하는 것입니다(없으면 새로 만드세요). 이 파일을 사용하면 사용 가능한 모든 모델, API 키 및 기본 설정을 한 곳에서 정의할 수 있습니다.

##### 3단계 빠른 설정

**1단계:** `~/.qwen/settings.json` 생성 또는 편집

다음은 전체 예시입니다:

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3.6-plus",
        "name": "qwen3.6-plus",
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "description": "Dashscope를 통한 Qwen3-Coder",
        "envKey": "DASHSCOPE_API_KEY"
      }
    ]
  },
  "env": {
    "DASHSCOPE_API_KEY": "sk-xxxxxxxxxxxxx"
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "qwen3.6-plus"
  }
}
```

**2단계:** 각 필드 이해하기

| 필드                         | 설명                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `modelProviders`             | 어떤 모델을 사용할 수 있고 어떻게 연결할지 선언합니다. `openai`, `anthropic`, `gemini`와 같은 키는 API 프로토콜을 나타냅니다. |
| `modelProviders[].id`        | API로 전송되는 모델 ID입니다 (예: `qwen3.6-plus`, `gpt-4o`).                                                                  |
| `modelProviders[].envKey`    | API 키를 보유한 환경 변수의 이름입니다.                                                                                       |
| `modelProviders[].baseUrl`   | API 엔드포인트 URL입니다 (기본값이 아닌 경우 필수).                                                                           |
| `env`                        | API 키를 저장하기 위한 예비 장소입니다 (우선순위가 가장 낮으며, 민감한 키는 `.env` 파일이나 `export`를 권장합니다).           |
| `security.auth.selectedType` | 시작 시 사용할 프로토콜입니다 (`openai`, `anthropic`, `gemini`, `vertex-ai`).                                                 |
| `model.name`                 | Qwen Code 시작 시 사용할 기본 모델입니다.                                                                                     |

**3단계:** Qwen Code 시작 — 설정이 자동으로 적용됩니다:

```bash
qwen
```

`/model` 명령을 사용하여 언제든지 설정된 모든 모델 간에 전환할 수 있습니다.

##### 추가 예시

<details>
<summary>코딩 플랜 (Alibaba Cloud ModelStudio) — 고정 월 사용료, 더 높은 할당량</summary>

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3.6-plus",
        "name": "qwen3.6-plus (코딩 플랜)",
        "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
        "description": "ModelStudio 코딩 플랜의 qwen3.6-plus",
        "envKey": "BAILIAN_CODING_PLAN_API_KEY"
      },
      {
        "id": "qwen3.5-plus",
        "name": "qwen3.5-plus (코딩 플랜)",
        "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
        "description": "ModelStudio 코딩 플랜에서 사고(thinking) 모드가 활성화된 qwen3.5-plus",
        "envKey": "BAILIAN_CODING_PLAN_API_KEY",
        "generationConfig": {
          "extra_body": {
            "enable_thinking": true
          }
        }
      },
      {
        "id": "glm-4.7",
        "name": "glm-4.7 (코딩 플랜)",
        "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
        "description": "ModelStudio 코딩 플랜에서 사고(thinking) 모드가 활성화된 glm-4.7",
        "envKey": "BAILIAN_CODING_PLAN_API_KEY",
        "generationConfig": {
          "extra_body": {
            "enable_thinking": true
          }
        }
      },
      {
        "id": "kimi-k2.5",
        "name": "kimi-k2.5 (코딩 플랜)",
        "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
        "description": "ModelStudio 코딩 플랜에서 사고(thinking) 모드가 활성화된 kimi-k2.5",
        "envKey": "BAILIAN_CODING_PLAN_API_KEY",
        "generationConfig": {
          "extra_body": {
            "enable_thinking": true
          }
        }
      }
    ]
  },
  "env": {
    "BAILIAN_CODING_PLAN_API_KEY": "sk-xxxxxxxxxxxxx"
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "qwen3.6-plus"
  }
}
```

> 코딩 플랜에 가입하고 [Alibaba Cloud ModelStudio(중국)](https://bailian.console.aliyun.com/cn-beijing?tab=coding-plan#/efm/coding-plan-index) 또는 [Alibaba Cloud ModelStudio(글로벌)](https://modelstudio.console.alibabacloud.com/?tab=coding-plan#/efm/coding-plan-index)에서 API 키를 받으세요.

</details>

<details>
<summary>다중 제공업체 (OpenAI + Anthropic + Gemini)</summary>

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "envKey": "OPENAI_API_KEY",
        "baseUrl": "https://api.openai.com/v1"
      }
    ],
    "anthropic": [
      {
        "id": "claude-sonnet-4-20250514",
        "name": "Claude Sonnet 4",
        "envKey": "ANTHROPIC_API_KEY"
      }
    ],
    "gemini": [
      {
        "id": "gemini-2.5-pro",
        "name": "Gemini 2.5 Pro",
        "envKey": "GEMINI_API_KEY"
      }
    ]
  },
  "env": {
    "OPENAI_API_KEY": "sk-xxxxxxxxxxxxx",
    "ANTHROPIC_API_KEY": "sk-ant-xxxxxxxxxxxxx",
    "GEMINI_API_KEY": "AIzaxxxxxxxxxxxxx"
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "gpt-4o"
  }
}
```

</details>

<details>
<summary>사고(thinking) 모드 활성화 (qwen3.5-plus와 같이 지원되는 모델)</summary>

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3.5-plus",
        "name": "qwen3.5-plus (사고 모드)",
        "envKey": "DASHSCOPE_API_KEY",
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "generationConfig": {
          "extra_body": {
            "enable_thinking": true
          }
        }
      }
    ]
  },
  "env": {
    "DASHSCOPE_API_KEY": "sk-xxxxxxxxxxxxx"
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "qwen3.5-plus"
  }
}
```

</details>

> **팁:** 쉘의 `export`나 `.env` 파일을 통해 API 키를 설정할 수도 있으며, 이는 `settings.json` → `env`보다 높은 우선순위를 갖습니다. 자세한 내용은 [인증 가이드](https://qwenlm.github.io/qwen-code-docs/en/users/configuration/auth/)를 참조하세요.

> **보안 참고:** API 키를 버전 관리 시스템에 커밋하지 마세요. `~/.qwen/settings.json` 파일은 홈 디렉토리에 있으며 비공개로 유지되어야 합니다.

#### 로컬 모델 설정 (Ollama / vLLM)

API 키나 클라우드 계정 없이 로컬에서 모델을 실행할 수도 있습니다. 이것은 인증 방법이 아니며, 대신 `~/.qwen/settings.json`의 `modelProviders` 필드를 사용하여 로컬 모델 엔드포인트를 설정합니다.

<details>
<summary>Ollama 설정</summary>

1. [ollama.com](https://ollama.com/)에서 Ollama 설치
2. 모델 가져오기: `ollama pull qwen3:32b`
3. `~/.qwen/settings.json` 설정:

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3:32b",
        "name": "Qwen3 32B (Ollama)",
        "baseUrl": "http://localhost:11434/v1",
        "description": "Ollama를 통해 로컬에서 실행되는 Qwen3 32B"
      }
    ]
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "qwen3:32b"
  }
}
```

</details>

<details>
<summary>vLLM 설정</summary>

1. vLLM 설치: `pip install vllm`
2. 서버 시작: `vllm serve Qwen/Qwen3-32B`
3. `~/.qwen/settings.json` 설정:

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "Qwen/Qwen3-32B",
        "name": "Qwen3 32B (vLLM)",
        "baseUrl": "http://localhost:8000/v1",
        "description": "vLLM을 통해 로컬에서 실행되는 Qwen3 32B"
      }
    ]
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "Qwen/Qwen3-32B"
  }
}
```

</details>

## 사용법

오픈 소스 터미널 에이전트인 Qwen Code는 네 가지 주요 방식으로 사용할 수 있습니다:

1. 대화형 모드 (터미널 UI)
2. 헤드리스 모드 (스크립트, CI)
3. IDE 통합 (VS Code, Zed)
4. SDK (TypeScript, Python, Java)

#### 대화형 모드

```bash
cd your-project/
qwen
```

프로젝트 폴더에서 `qwen`을 실행하여 대화형 터미널 UI를 시작합니다. `@`를 사용하여 로컬 파일을 참조하세요 (예: `@src/main.ts`).

#### 헤드리스 모드

```bash
cd your-project/
qwen -p "질문 내용"
```

대화형 UI 없이 Qwen Code를 실행하려면 `-p`를 사용하세요. 스크립트, 자동화 및 CI/CD에 적합합니다. 더 알아보기: [헤드리스 모드](https://qwenlm.github.io/qwen-code-docs/en/users/features/headless).

#### IDE 통합

에디터(VS Code, Zed 및 JetBrains IDE) 내에서 Qwen Code를 사용하세요:

- [VS Code에서 사용](https://qwenlm.github.io/qwen-code-docs/en/users/integration-vscode/)
- [Zed에서 사용](https://qwenlm.github.io/qwen-code-docs/en/users/integration-zed/)
- [JetBrains IDE에서 사용](https://qwenlm.github.io/qwen-code-docs/en/users/integration-jetbrains/)

#### SDK

제공된 SDK를 사용하여 Qwen Code를 기반으로 개발하세요:

- TypeScript: [Qwen Code SDK 사용](./packages/sdk-typescript/README.md)
- Python: [Python SDK 사용](./packages/sdk-python/README.md)
- Java: [Java SDK 사용](./packages/sdk-java/qwencode/README.md)

Python SDK 예시:

```python
import asyncio

from qwen_code_sdk import is_sdk_result_message, query


async def main() -> None:
    result = query(
        "저장소 레이아웃을 요약해줘.",
        {
            "cwd": "/path/to/project",
            "path_to_qwen_executable": "qwen",
        },
    )

    async for message in result:
        if is_sdk_result_message(message):
            print(message["result"])


asyncio.run(main())
```

## 명령 및 단축키

### 세션 명령

- `/help` - 사용 가능한 명령 표시
- `/clear` - 대화 기록 지우기
- `/compress` - 토큰 절약을 위해 기록 압축
- `/stats` - 현재 세션 정보 표시
- `/bug` - 버그 리포트 제출
- `/exit` 또는 `/quit` - Qwen Code 종료

### 키보드 단축키

- `Ctrl+C` - 현재 작업 취소
- `Ctrl+D` - 종료 (빈 줄에서)
- `Up/Down` - 명령 기록 탐색

> [명령](https://qwenlm.github.io/qwen-code-docs/en/users/features/commands/)에 대해 더 알아보기
>
> **팁**: YOLO 모드(`--yolo`)에서는 이미지가 감지될 때 확인 메시지 없이 비전 전환이 자동으로 일어납니다. [승인 모드](https://qwenlm.github.io/qwen-code-docs/en/users/features/approval-mode/)에 대해 더 알아보기

## 설정

Qwen Code는 `settings.json`, 환경 변수 및 CLI 플래그를 통해 설정할 수 있습니다.

| 파일                    | 범위          | 설명                                                                               |
| ----------------------- | ------------- | ---------------------------------------------------------------------------------- |
| `~/.qwen/settings.json` | 사용자 (전역) | 모든 Qwen Code 세션에 적용됩니다. **`modelProviders` 및 `env` 설정에 권장됩니다.** |
| `.qwen/settings.json`   | 프로젝트      | 이 프로젝트에서 Qwen Code를 실행할 때만 적용됩니다. 사용자 설정을 덮어씁니다.      |

`settings.json`에서 가장 자주 사용되는 상위 필드:

| 필드                         | 설명                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `modelProviders`             | 프로토콜별로 사용 가능한 모델을 정의합니다 (`openai`, `anthropic`, `gemini`, `vertex-ai`). |
| `env`                        | 예비 환경 변수 (예: API 키)입니다. 쉘의 `export` 및 `.env` 파일보다 우선순위가 낮습니다.   |
| `security.auth.selectedType` | 시작 시 사용할 프로토콜입니다 (예: `openai`).                                              |
| `model.name`                 | Qwen Code 시작 시 사용할 기본 모델입니다.                                                  |

> 전체 `settings.json` 예시는 위의 [인증](#api-key-flexible) 섹션을, 모든 옵션에 대해서는 [설정 참조](https://qwenlm.github.io/qwen-code-docs/en/users/configuration/settings/)를 확인하세요.

## 벤치마크 결과

### Terminal-Bench 성능

| 에이전트  | 모델               | 정확도 |
| --------- | ------------------ | ------ |
| Qwen Code | Qwen3-Coder-480A35 | 37.5%  |
| Qwen Code | Qwen3-Coder-30BA3B | 31.3%  |

## 생태계

그래픽 인터페이스를 찾으시나요?

- [**AionUi**](https://github.com/iOfficeAI/AionUi) Qwen Code를 포함한 명령줄 AI 도구를 위한 현대적인 GUI
- [**Gemini CLI Desktop**](https://github.com/Piebald-AI/gemini-cli-desktop) Qwen Code를 위한 크로스 플랫폼 데스크탑/웹/모바일 UI

## 문제 해결

문제가 발생하면 [문제 해결 가이드](https://qwenlm.github.io/qwen-code-docs/en/users/support/troubleshooting/)를 확인하세요.

**일반적인 문제:**

- **`Qwen OAuth free tier was discontinued on 2026-04-15`**: Qwen OAuth를 더 이상 사용할 수 없습니다. `qwen` → `/auth`를 실행하여 API 키 또는 코딩 플랜으로 전환하세요. 설정 방법은 위의 [인증](#authentication) 섹션을 참조하세요.

CLI 내에서 버그를 보고하려면 `/bug`를 실행하고 짧은 제목과 재현 단계를 포함하세요.

## 소통하기

- Discord: https://discord.gg/RN7tqZCeDK
- Dingtalk: https://qr.dingtalk.com/action/joingroup?code=v1,k1,+FX6Gf/ZDlTahTIRi8AEQhIaBlqykA0j+eBKKdhLeAE=&_dt_no_comment=1&origin=1

## 감사의 말

이 프로젝트는 [Google Gemini CLI](https://github.com/google-gemini/gemini-cli)를 기반으로 합니다. Gemini CLI 팀의 훌륭한 작업에 감사드립니다. 우리의 주요 기여는 Qwen-Coder 모델을 더 잘 지원하기 위한 파서 수준의 적응에 초점을 맞추고 있습니다.
