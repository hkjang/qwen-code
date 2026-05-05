# 모델 제공자

Qwen Code를 사용하면 다음을 통해 여러 모델 공급자를 구성할 수 있습니다.`modelProviders`당신의 설정`settings.json`. 이를 통해 다음을 사용하여 다양한 AI 모델과 공급자 간에 전환할 수 있습니다.`/model`명령.

## 개요

사용`modelProviders`인증 유형별로 선별된 모델 목록을 선언합니다.`/model`선택기는 사이를 전환할 수 있습니다. 키는 유효한 인증 유형이어야 합니다(`openai`,`anthropic`,`gemini`, 등.). 각 항목에는`id`그리고**반드시 포함해야 합니다`envKey`**, 선택 사항 포함`name`,`description`,`baseUrl`, 그리고`generationConfig`. 자격 증명은 설정에서 유지되지 않습니다. 런타임은 다음에서 이를 읽습니다.`process.env[envKey]`. Qwen OAuth 모델은 하드 코딩된 상태로 유지되며 재정의할 수 없습니다.

> \[!메모]
>
> 오직`/model`명령은 기본이 아닌 인증 유형을 노출합니다. Anthropic, Gemini 등은 다음을 통해 정의되어야 합니다.`modelProviders`. 그만큼`/auth`명령에는 Qwen OAuth, Alibaba Cloud Coding Plan 및 API 키가 기본 제공 인증 옵션으로 나열됩니다.

> \[!경고]
>
> **동일한 authType 내에서 중복된 모델 ID:**동일한 모델을 여러 개 정의`id`하나의 아래`authType`(예를 들어 다음과 같은 두 개의 항목이 있습니다.`"id": "gpt-4o"`\~에`openai`)은 현재 지원되지 않습니다. 중복이 존재하는 경우,**첫 번째 발생이 승리합니다.**후속 중복은 경고와 함께 건너뜁니다. 참고`id`필드는 구성 식별자와 API로 전송되는 실제 모델 이름으로 모두 사용되므로 고유 ID(예:`gpt-4o-creative`,`gpt-4o-balanced`) 실행 가능한 해결 방법이 아닙니다. 이는 향후 릴리스에서 해결할 예정인 알려진 제한 사항입니다.

## 인증 유형별 구성 예

다음은 다양한 인증 유형에 대한 포괄적인 구성 예이며, 사용 가능한 매개변수와 그 조합을 보여줍니다.

### 지원되는 인증 유형

그만큼`modelProviders`객체 키는 유효해야 합니다.`authType`가치. 현재 지원되는 인증 유형은 다음과 같습니다.

| 인증 유형        | 설명                                                            |
| ------------ | ------------------------------------------------------------- |
| `openai`     | OpenAI 호환 API(OpenAI, Azure OpenAI, vLLM/Ollama와 같은 로컬 추론 서버) |
| `anthropic`  | 인류 클로드 API                                                    |
| `gemini`     | 구글 제미니 API                                                    |
| `qwen-oauth` | Qwen OAuth(하드 코딩됨, 다음에서 재정의할 수 없음)`modelProviders`)           |

> \[!경고] 
> 잘못된 인증 유형 키가 사용된 경우(예: 다음과 같은 오타)`"openai-custom"`) 구성은 다음과 같습니다.**조용히 건너뛰었습니다**모델은 표시되지 않습니다.`/model`소매치기. 항상 위에 나열된 지원되는 인증 유형 값 중 하나를 사용하십시오.

### API 요청에 사용되는 SDK

Qwen Code는 다음 공식 SDK를 사용하여 각 공급자에게 요청을 보냅니다.

| 인증 유형        | SDK 패키지                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------- |
| `openai`     | [`openai`](https://www.npmjs.com/package/openai)- 공식 OpenAI Node.js SDK                  |
| `anthropic`  | [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk)- 공식 Anthropic SDK |
| `gemini`     | [`@google/genai`](https://www.npmjs.com/package/@google/genai)- 공식 Google GenAI SDK      |
| `qwen-oauth` | [`openai`](https://www.npmjs.com/package/openai)맞춤형 공급자 사용(DashScope 호환)                 |

이는 다음을 의미합니다.`baseUrl`구성은 해당 SDK의 예상 API 형식과 호환되어야 합니다. 예를 들어,`openai`인증 유형을 사용하려면 엔드포인트가 OpenAI API 형식 요청을 수락해야 합니다.

### OpenAI 호환 제공업체(`openai`)

이 인증 유형은 OpenAI의 공식 API뿐만 아니라 OpenRouter와 같은 집계 모델 공급자를 포함한 모든 OpenAI 호환 엔드포인트도 지원합니다.

```json
{
  "env": {
    "OPENAI_API_KEY": "sk-your-actual-openai-key-here",
    "OPENROUTER_API_KEY": "sk-or-your-actual-openrouter-key-here"
  },
  "modelProviders": {
    "openai": [
      {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "envKey": "OPENAI_API_KEY",
        "baseUrl": "https://api.openai.com/v1",
        "generationConfig": {
          "timeout": 60000,
          "maxRetries": 3,
          "enableCacheControl": true,
          "contextWindowSize": 128000,
          "modalities": {
            "image": true
          },
          "customHeaders": {
            "X-Client-Request-ID": "req-123"
          },
          "extra_body": {
            "enable_thinking": true,
            "service_tier": "priority"
          },
          "samplingParams": {
            "temperature": 0.2,
            "top_p": 0.8,
            "max_tokens": 4096,
            "presence_penalty": 0.1,
            "frequency_penalty": 0.1
          }
        }
      },
      {
        "id": "gpt-4o-mini",
        "name": "GPT-4o Mini",
        "envKey": "OPENAI_API_KEY",
        "baseUrl": "https://api.openai.com/v1",
        "generationConfig": {
          "timeout": 30000,
          "samplingParams": {
            "temperature": 0.5,
            "max_tokens": 2048
          }
        }
      },
      {
        "id": "openai/gpt-4o",
        "name": "GPT-4o (via OpenRouter)",
        "envKey": "OPENROUTER_API_KEY",
        "baseUrl": "https://openrouter.ai/api/v1",
        "generationConfig": {
          "timeout": 120000,
          "maxRetries": 3,
          "samplingParams": {
            "temperature": 0.7
          }
        }
      }
    ]
  }
}
```

### 인류(`anthropic`)

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-your-actual-anthropic-key-here"
  },
  "modelProviders": {
    "anthropic": [
      {
        "id": "claude-3-5-sonnet",
        "name": "Claude 3.5 Sonnet",
        "envKey": "ANTHROPIC_API_KEY",
        "baseUrl": "https://api.anthropic.com/v1",
        "generationConfig": {
          "timeout": 120000,
          "maxRetries": 3,
          "contextWindowSize": 200000,
          "samplingParams": {
            "temperature": 0.7,
            "max_tokens": 8192,
            "top_p": 0.9
          }
        }
      },
      {
        "id": "claude-3-opus",
        "name": "Claude 3 Opus",
        "envKey": "ANTHROPIC_API_KEY",
        "baseUrl": "https://api.anthropic.com/v1",
        "generationConfig": {
          "timeout": 180000,
          "samplingParams": {
            "temperature": 0.3,
            "max_tokens": 4096
          }
        }
      }
    ]
  }
}
```

### 구글 제미니(`gemini`)

```json
{
  "env": {
    "GEMINI_API_KEY": "AIza-your-actual-gemini-key-here"
  },
  "modelProviders": {
    "gemini": [
      {
        "id": "gemini-2.0-flash",
        "name": "Gemini 2.0 Flash",
        "envKey": "GEMINI_API_KEY",
        "baseUrl": "https://generativelanguage.googleapis.com",
        "capabilities": {
          "vision": true
        },
        "generationConfig": {
          "timeout": 60000,
          "maxRetries": 2,
          "contextWindowSize": 1000000,
          "schemaCompliance": "auto",
          "samplingParams": {
            "temperature": 0.4,
            "top_p": 0.95,
            "max_tokens": 8192,
            "top_k": 40
          }
        }
      }
    ]
  }
}
```

### 로컬 자체 호스팅 모델(OpenAI 호환 API를 통해)

대부분의 로컬 추론 서버(vLLM, Ollama, LM Studio 등)는 OpenAI 호환 API 엔드포인트를 제공합니다. 다음을 사용하여 구성합니다.`openai`로컬 인증 유형`baseUrl`:

```json
{
  "env": {
    "OLLAMA_API_KEY": "ollama",
    "VLLM_API_KEY": "not-needed",
    "LMSTUDIO_API_KEY": "lm-studio"
  },
  "modelProviders": {
    "openai": [
      {
        "id": "qwen2.5-7b",
        "name": "Qwen2.5 7B (Ollama)",
        "envKey": "OLLAMA_API_KEY",
        "baseUrl": "http://localhost:11434/v1",
        "generationConfig": {
          "timeout": 300000,
          "maxRetries": 1,
          "contextWindowSize": 32768,
          "samplingParams": {
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 4096
          }
        }
      },
      {
        "id": "llama-3.1-8b",
        "name": "Llama 3.1 8B (vLLM)",
        "envKey": "VLLM_API_KEY",
        "baseUrl": "http://localhost:8000/v1",
        "generationConfig": {
          "timeout": 120000,
          "maxRetries": 2,
          "contextWindowSize": 128000,
          "samplingParams": {
            "temperature": 0.6,
            "max_tokens": 8192
          }
        }
      },
      {
        "id": "local-model",
        "name": "Local Model (LM Studio)",
        "envKey": "LMSTUDIO_API_KEY",
        "baseUrl": "http://localhost:1234/v1",
        "generationConfig": {
          "timeout": 60000,
          "samplingParams": {
            "temperature": 0.5
          }
        }
      }
    ]
  }
}
```

인증이 필요하지 않은 로컬 서버의 경우 API 키에 대한 자리 표시자 값을 사용할 수 있습니다.

```bash
# For Ollama (no auth required)
export OLLAMA_API_KEY="ollama"

# For vLLM (if no auth is configured)
export VLLM_API_KEY="not-needed"
```

> \[!메모]
>
> 그만큼`extra_body`매개변수는**OpenAI 호환 공급자에만 지원됩니다.**(`openai`,`qwen-oauth`). Anthropic 및 Gemini 공급자의 경우 무시됩니다.

> \[!메모]
>
> **에 대한`envKey`**:`envKey`필드는 다음을 지정합니다.**환경 변수의 이름**, 실제 API 키 값이 아닙니다. 구성이 작동하려면 해당 환경 변수가 실제 API 키로 설정되어 있는지 확인해야 합니다. 이를 수행하는 방법에는 두 가지가 있습니다.
>
> * **옵션 1:`.env`파일**(보안을 위해 권장됨):
>   ```bash
>   # ~/.qwen/.env (or project root)
>   OPENAI_API_KEY=sk-your-actual-key-here
>   ```
>   꼭 추가하세요`.env`당신에게`.gitignore`실수로 비밀을 범하는 것을 방지합니다.
> * **옵션 2:`env`필드`settings.json`**(위의 예에 표시된 대로):
>   ```json
>   {
>     "env": {
>       "OPENAI_API_KEY": "sk-your-actual-key-here"
>     }
>   }
>   ```
>
> 각 공급자 예에는 다음이 포함됩니다.`env`API 키 구성 방법을 설명하는 필드입니다.

## Alibaba Cloud 코딩 계획

Alibaba Cloud Coding Plan은 코딩 작업에 최적화된 사전 구성된 Qwen 모델 세트를 제공합니다. 이 기능은 Alibaba Cloud Coding Plan API 액세스 권한이 있는 사용자에게 제공되며 자동 모델 구성 업데이트를 통해 단순화된 설정 환경을 제공합니다.

### 개요

다음을 사용하여 Alibaba Cloud Coding Plan API 키로 인증하는 경우`/auth`명령을 실행하면 Qwen Code는 다음 모델을 자동으로 구성합니다.

| 모델 ID                  | 이름                   | 설명                |
| ---------------------- | -------------------- | ----------------- |
| `qwen3.5-plus`         | qwen3.5-플러스          | 사고가 가능한 고급 모델     |
| `qwen3-coder-plus`     | qwen3-코더-플러스         | 코딩 작업에 최적화됨       |
| `qwen3-max-2026-01-23` | qwen3-max-2026-01-23 | 사고가 가능한 최신 Max 모델 |

### 설정

1. Alibaba Cloud Coding Plan API 키를 얻으세요:
   * **중국**:<https://bailian.console.aliyun.com/?tab=model#/efm/coding_plan>
   * **국제적인**:<https://modelstudio.console.alibabacloud.com/?tab=dashboard#/efm/coding_plan>
2. 실행`/auth`Qwen 코드의 명령
3. 선택하다**Alibaba Cloud 코딩 계획**
4. 지역을 선택하세요
5. 메시지가 나타나면 API 키를 입력하세요.

모델이 자동으로 구성되어 모델에 추가됩니다.`/model`소매치기.

### 지역

Alibaba Cloud Coding Plan은 두 지역을 지원합니다.

| 지역     | 엔드포인트                                           | 설명          |
| ------ | ----------------------------------------------- | ----------- |
| 중국     | `https://coding.dashscope.aliyuncs.com/v1`      | 중국 본토 엔드포인트 |
| 글로벌/국제 | `https://coding-intl.dashscope.aliyuncs.com/v1` | 국제 엔드포인트    |

지역은 인증 중에 선택되어 저장됩니다.`settings.json`아래에`codingPlan.region`. 지역을 전환하려면 다음을 다시 실행하세요.`/auth`명령을 내리고 다른 지역을 선택하세요.

### API 키 저장소

코딩 계획을 통해 구성할 때`/auth`명령을 실행하면 API 키는 예약된 환경 변수 이름을 사용하여 저장됩니다.`BAILIAN_CODING_PLAN_API_KEY`. 기본적으로 다음 위치에 저장됩니다.`env`당신의 분야`settings.json`파일.

> \[!경고]
>
> **보안 권장 사항**: 보안 강화를 위해 API 키를 다음에서 이동하는 것이 좋습니다.`settings.json`별도의`.env`파일을 만들어 환경 변수로 로드합니다. 예를 들어:
>
> ```bash
> # ~/.qwen/.env
> BAILIAN_CODING_PLAN_API_KEY=your-api-key-here
> ```
>
> 그런 다음 이 파일이`.gitignore`프로젝트 수준 설정을 사용하는 경우.

### 자동 업데이트

코딩 계획 모델 구성의 버전이 지정됩니다. Qwen Code가 최신 버전의 모델 템플릿을 감지하면 업데이트하라는 메시지가 표시됩니다. 업데이트를 수락하면 다음이 수행됩니다.

* 기존 코딩 계획 모델 구성을 최신 버전으로 교체
* 수동으로 추가한 사용자 정의 모델 구성을 유지합니다.
* 업데이트된 구성의 첫 번째 모델로 자동 전환

업데이트 프로세스를 통해 수동 개입 없이 항상 최신 모델 구성 및 기능에 액세스할 수 있습니다.

### 수동 구성(고급)

코딩 계획 모델을 수동으로 구성하려는 경우 해당 모델을`settings.json`OpenAI 호환 제공업체처럼:

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3-coder-plus",
        "name": "qwen3-coder-plus",
        "description": "Qwen3-Coder via Alibaba Cloud Coding Plan",
        "envKey": "YOUR_CUSTOM_ENV_KEY",
        "baseUrl": "https://coding.dashscope.aliyuncs.com/v1"
      }
    ]
  }
}
```

> \[!메모]
>
> 수동 구성을 사용하는 경우:
>
> * 어떤 환경 변수 이름이든 사용할 수 있습니다.`envKey`
> * 구성할 필요가 없습니다.`codingPlan.*`
> * **자동 업데이트가 적용되지 않습니다.**수동으로 구성된 코딩 계획 모델

> \[!경고]
>
> 자동 코딩 계획 구성도 사용하는 경우 자동 업데이트가 동일한 구성을 사용하면 수동 구성을 덮어쓸 수 있습니다.`envKey`그리고`baseUrl`자동 구성으로. 이를 방지하려면 수동 구성에서 다른 방법을 사용하는지 확인하십시오.`envKey`가능하다면.

## 해상도 레이어와 원자성

유효한 인증/모델/자격 증명 값은 다음 우선 순위를 사용하여 필드별로 선택됩니다(첫 번째 현재 우선). 결합할 수 있습니다.`--auth-type`\~와 함께`--model`공급자 항목을 직접 가리킵니다. 이러한 CLI 플래그는 다른 레이어보다 먼저 실행됩니다.

| 레이어(최고 → 최저)        | 인증 유형                            | 모델                                | API 키                               | 기본 URL                               | apiKeyEnvKey           | 대리                        |
| ------------------- | -------------------------------- | --------------------------------- | ----------------------------------- | ------------------------------------ | ---------------------- | ------------------------- |
| 프로그래밍 방식 재정의        | `/auth`                          | `/auth`입력                         | `/auth`입력                           | `/auth`입력                            | —                      | —                         |
| 모델 제공자 선택           | —                                | `modelProvider.id`                | `env[modelProvider.envKey]`         | `modelProvider.baseUrl`              | `modelProvider.envKey` | —                         |
| CLI 인수              | `--auth-type`                    | `--model`                         | `--openaiApiKey`(또는 공급자별 이에 상응하는 것) | `--openaiBaseUrl`(또는 공급자별 이에 상응하는 것) | —                      | —                         |
| 환경변수                | —                                | 제공업체별 매핑(예:`OPENAI_MODEL`)        | 제공업체별 매핑(예:`OPENAI_API_KEY`)        | 제공업체별 매핑(예:`OPENAI_BASE_URL`)        | —                      | —                         |
| 설정(`settings.json`) | `security.auth.selectedType`     | `model.name`                      | `security.auth.apiKey`              | `security.auth.baseUrl`              | —                      | —                         |
| 기본값 / 계산됨           | 다음으로 돌아갑니다.`AuthType.QWEN_OAUTH` | 기본 내장(OpenAI ⇒`qwen3-coder-plus`) | —                                   | —                                    | —                      | `Config.getProxy()`구성된 경우 |

\*있는 경우 CLI 인증 플래그가 설정을 재정의합니다. 그렇지 않으면,`security.auth.selectedType`또는 암시적 기본값에 따라 인증 유형이 결정됩니다. Qwen OAuth 및 OpenAI는 추가 구성 없이 표시되는 유일한 인증 유형입니다.

> \[!경고]
>
> **지원 중단`security.auth.apiKey`그리고`security.auth.baseUrl`:**다음을 통해 API 자격 증명을 직접 구성`security.auth.apiKey`그리고`security.auth.baseUrl`\~에`settings.json`더 이상 사용되지 않습니다. 이러한 설정은 UI를 통해 입력된 자격 증명에 대한 기록 버전에서 사용되었지만 버전 0.10.1에서는 자격 증명 입력 흐름이 제거되었습니다. 이러한 필드는 향후 릴리스에서 완전히 제거될 예정입니다.**다음으로 마이그레이션하는 것이 좋습니다.`modelProviders`**모든 모델 및 자격 증명 구성에 적용됩니다. 사용`envKey`\~에`modelProviders`설정 파일에 자격 증명을 하드코딩하는 대신 안전한 자격 증명 관리를 위해 환경 변수를 참조합니다.

## 세대 구성 계층화: 불침투성 공급자 계층

구성 해결은 한 가지 중요한 규칙이 있는 엄격한 계층화 모델을 따릅니다.**modelProvider 레이어는 불침투성입니다.**.

### 작동 원리

1. **modelProvider 모델이 선택된 경우**(예를 들어, 가다`/model`공급자 구성 모델을 선택하는 명령):
   * 전체`generationConfig`공급자의 적용**원자적으로**
   * **공급자 계층은 완전히 침투할 수 없습니다.**— 하위 계층(CLI, env, 설정)은 GenerationConfig 확인에 전혀 참여하지 않습니다.
   * 다음에 정의된 모든 필드`modelProviders[].generationConfig`공급자의 값을 사용하십시오.
   * 모든 분야**정의되지 않음**공급자가 다음과 같이 설정했습니다.`undefined`(설정에서 상속되지 않음)
   * 이를 통해 공급자 구성이 완전하고 독립적인 "봉인된 패키지"로 작동하도록 보장합니다.

2. **modelProvider 모델이 선택되지 않은 경우**(예를 들어,`--model`원시 모델 ID를 사용하거나 CLI/env/settings를 직접 사용):
   * 해상도는 하위 레이어로 떨어집니다.
   * 필드는 CLI → env → 설정 → 기본값으로 채워집니다.
   * 이것은**런타임 모델**(다음 섹션 참조)

### 필드별 우선순위`generationConfig`

| 우선 사항 | 원천                                            | 행동                                                             |
| ----- | --------------------------------------------- | -------------------------------------------------------------- |
| 1     | 프로그래밍 방식 재정의                                  | 실행 시간`/model`,`/auth`변화                                        |
| 2     | `modelProviders[authType][].generationConfig` | **불투수층**- 모든 GenerationConfig 필드를 완전히 대체합니다. 하위 레이어는 참여하지 않습니다 |
| 3     | `settings.model.generationConfig`             | 다음 용도로만 사용됨**런타임 모델**(공급자 모델을 선택하지 않은 경우)                      |
| 4     | 콘텐츠 생성기 기본값                                   | 공급자별 기본값(예: OpenAI 및 Gemini) - 런타임 모델에만 해당                     |

### 원자장 치료

다음 필드는 원자 개체로 처리됩니다. 공급자 값은 전체 개체를 완전히 대체하며 병합이 발생하지 않습니다.

* `samplingParams`- 온도, top\_p, max\_tokens 등
* `customHeaders`- 사용자 정의 HTTP 헤더
* `extra_body`- 추가 요청 본문 매개변수

### 예

```json
// User settings (~/.qwen/settings.json)
{
  "model": {
    "generationConfig": {
      "timeout": 30000,
      "samplingParams": { "temperature": 0.5, "max_tokens": 1000 }
    }
  }
}

// modelProviders configuration
{
  "modelProviders": {
    "openai": [{
      "id": "gpt-4o",
      "envKey": "OPENAI_API_KEY",
      "generationConfig": {
        "timeout": 60000,
        "samplingParams": { "temperature": 0.2 }
      }
    }]
  }
}
```

언제`gpt-4o`modelProviders에서 선택되었습니다.

* `timeout`= 60000(공급자로부터, 설정 재정의)
* `samplingParams.temperature`= 0.2(공급자에서 설정 개체를 완전히 대체함)
* `samplingParams.max_tokens`=**한정되지 않은**(제공자에 정의되지 않았으며 제공자 레이어는 설정에서 상속되지 않습니다. 제공되지 않은 경우 필드는 명시적으로 정의되지 않음으로 설정됩니다)

원시 모델을 사용하는 경우`--model gpt-4`(modelProviders가 아닌 런타임 모델 생성):

* `timeout`= 30000 (설정에서)
* `samplingParams.temperature`= 0.5 (설정에서)
* `samplingParams.max_tokens`= 1000 (설정에서)

병합 전략`modelProviders`그 자체는 REPLACE입니다: 전체`modelProviders`프로젝트 설정에서 두 섹션을 병합하는 대신 사용자 설정의 해당 섹션을 재정의합니다.

## 추론/사고 구성

선택 사항`reasoning`아래 필드`generationConfig`모델이 응답하기 전에 얼마나 공격적으로 추론하는지 제어합니다. Anthropic 및 Gemini 변환기는 항상 이를 존중합니다. OpenAI 호환 파이프라인은 이를 존중합니다.**\~하지 않는 한** `generationConfig.samplingParams`설정됨 - '상호작용'을 참조하세요.`samplingParams`"주의 사항은 아래에 있습니다.

```jsonc
{
  "modelProviders": {
    "openai": [
      {
        "id": "deepseek-v4-pro",
        "name": "DeepSeek V4 Pro",
        "baseUrl": "https://api.deepseek.com/v1",
        "envKey": "DEEPSEEK_API_KEY",
        "generationConfig": {
          // The four-tier scale:
          //   'low'    | 'medium' — server-mapped to 'high' on DeepSeek
          //   'high'   — default reasoning intensity
          //   'max'    — DeepSeek-specific extra-strong tier
          // Or set `false` to disable reasoning entirely.
          "reasoning": { "effort": "max" },
        },
      },
    ],
  },
}
```

### 공급자별 동작

| 프로토콜/공급자                              | 와이어 모양                                                     | 메모                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **오픈AI/딥시크**(`api.deepseek.com`)      | 평평한`reasoning_effort: <effort>`신체 매개변수                     | 언제`reasoning.effort`중첩된 구성 모양으로 설정되어 플랫으로 다시 작성됩니다.`reasoning_effort`그리고`'low'`/`'medium'`정규화되었습니다`'high'`,`'xhigh'`에게`'max'`— DeepSeek의 미러링[서버 측 하위 호환](https://api-docs.deepseek.com/zh-cn/api/create-chat-completion). 최상위`samplingParams.reasoning_effort`또는`extra_body.reasoning_effort`재정의하면 이 정규화를 건너뛰고 그대로 전달됩니다. |
| **오픈AI**(다른 호환 서버)                    | `reasoning: { effort, ... }`말 그대로 통과했다                     | 다음을 통해 설정`samplingParams`(예:`samplingParams.reasoning_effort`GPT-5/o 시리즈의 경우) 공급자가 다른 모양을 기대하는 경우.                                                                                                                                                                                                                        |
| **인류학**(진짜`api.anthropic.com`)        | `output_config: { effort }`게다가`effort-2025-11-24`베타 헤더     | 실제 인류는 받아들인다`'low'`/`'medium'`/`'high'`오직.`'max'`\~이다**\~에 고정되어 있다`'high'`**와`debugLogger.warn`라인(발전기당 한 번); 최대한 노력하려면 baseURL을 이를 지원하는 DeepSeek 호환 엔드포인트로 전환하세요.                                                                                                                                           |
| **인류학**(`api.deepseek.com/anthropic`) | 같은`output_config: { effort }`+ 베타 헤더                       | `'max'`변함없이 통과됩니다.                                                                                                                                                                                                                                                                                                        |
| **쌍둥이자리**(`@google/genai`)            | `thinkingConfig: { includeThoughts: true, thinkingLevel }` | `'low'`→`LOW`,`'high'`/`'max'`→`HIGH`, 기타 →`THINKING_LEVEL_UNSPECIFIED`(쌍둥이자리는 없어요`MAX`층).                                                                                                                                                                                                                                |

### `reasoning: false`

환경`reasoning: false`(리터럴 부울)은 모든 제공자에 대한 사고를 명시적으로 비활성화합니다. 추론의 이점을 얻지 못하는 저렴한 부가 쿼리에 유용합니다. 이는 요청 수준에서도 다음을 통해 적용됩니다.`request.config.thinkingConfig.includeThoughts: false`일회성 통화(예: 제안 생성)

에`api.deepseek.com`baseURL, OpenAI 파이프라인은 명시적인 URL을 내보냅니다.`thinking: { type: 'disabled' }`DeepSeek V4+에 필요한 필드 — 서버측 기본값은`'enabled'`, 그래서 간단히 생략`reasoning_effort`여전히 생각하는 대기 시간/비용을 지불할 것입니다. 자체 호스팅 DeepSeek 백엔드(sglang/vllm) 및 기타 OpenAI 호환 서버는**\~ 아니다**이 필드를 수신합니다. 그런 생각을 비활성화해야 한다면, 주입하세요.`thinking: { type: 'disabled' }`(또는 추론 프레임워크가 노출하는 노브)를 통해`samplingParams`/`extra_body`.

### 상호작용`samplingParams`(OpenAI 호환만 가능)

> \[!경고]
>
> 언제`generationConfig.samplingParams`OpenAI 호환 공급자에 설정되어 있으면 파이프라인은 해당 키를 유선으로 전달합니다.**말 그대로**별도의 내용을 건너뜁니다.`reasoning`완전히 주입합니다. 그래서 다음과 같은 구성`{ samplingParams: { temperature: 0.5 }, reasoning: { effort: 'max' } }`OpenAI/DeepSeek 요청에 대한 추론 필드를 자동으로 삭제합니다.
>
> 설정하면`samplingParams`, 내부에 추론 손잡이를 직접 포함합니다. DeepSeek의 경우`samplingParams.reasoning_effort`, GPT-5/o 시리즈의 경우`samplingParams.reasoning_effort`(평평한 필드) 또는`samplingParams.reasoning`(중첩된 객체). OpenRouter 및 기타 공급자의 경우 필드 이름이 다릅니다. 공급자 문서를 참조하십시오.
>
> Anthropic 및 Gemini 변환기는 영향을 받지 않습니다. 항상 읽습니다.`reasoning.effort`직접적으로 관계없이`samplingParams`.

### `budget_tokens`

다음을 포함하여 정확한 사고 토큰 예산을 고정할 수 있습니다.`budget_tokens`나란히`effort`:

```jsonc
"reasoning": { "effort": "high", "budget_tokens": 50000 }
```

인류학의 경우 이는 다음과 같습니다.`thinking.budget_tokens`. OpenAI/DeepSeek의 경우 필드가 유지되지만 현재 서버에서는 무시됩니다.`reasoning_effort`하중을 지지하는 손잡이입니다.

## 공급자 모델과 런타임 모델

Qwen Code는 두 가지 유형의 모델 구성을 구별합니다.

### 공급자 모델

* 정의됨`modelProviders`구성
* 완전한 원자 구성 패키지가 있습니다.
* 선택 시 해당 구성이 불투수 레이어로 적용됩니다.
* 다음에 나타납니다`/model`전체 메타데이터(이름, 설명, 기능)가 포함된 명령 목록
* 다중 모델 워크플로우 및 팀 일관성을 위해 권장됩니다.

### 런타임 모델

* CLI를 통해 원시 모델 ID를 사용할 때 동적으로 생성됨(`--model`), 환경 변수 또는 설정
* 정의되지 않음`modelProviders`
* 구성은 해상도 레이어(CLI → env → 설정 → 기본값)를 통해 "투영"하여 구축됩니다.
* 자동으로 캡처됨**런타임모델스냅샷**완전한 구성이 감지되면
* 자격 증명을 다시 입력하지 않고도 재사용 가능

### RuntimeModelSnapshot 수명주기

사용하지 않고 모델을 구성하는 경우`modelProviders`, Qwen Code는 자동으로 RuntimeModelSnapshot을 생성하여 구성을 보존합니다.

```bash
# This creates a RuntimeModelSnapshot with ID: $runtime|openai|my-custom-model
qwen --auth-type openai --model my-custom-model --openaiApiKey $KEY --openaiBaseUrl https://api.example.com/v1
```

스냅샷:

* 모델 ID, API 키, 기본 URL 및 세대 구성을 캡처합니다.
* 세션 전반에 걸쳐 지속됩니다(런타임 중에 메모리에 저장됨).
* 에 나타납니다`/model`런타임 옵션으로서의 명령 목록
* 사용으로 전환 가능`/model $runtime|openai|my-custom-model`

### 주요 차이점

| 측면      | 공급자 모델               | 런타임 모델                 |
| ------- | -------------------- | ---------------------- |
| 구성 소스   | `modelProviders`설정에서 | CLI, 환경, 설정 레이어        |
| 구성 원자성  | 완전하고 불침투성 패키지        | 계층화되어 각 필드가 독립적으로 해결됨  |
| 재사용성    | 항상 사용 가능`/model`목록   | 스냅샷으로 캡처되고 완료되면 표시됩니다. |
| 팀 공유    | 예(커밋된 설정을 통해)        | 아니요(사용자 로컬)            |
| 자격증명 저장 | 참조를 통해`envKey`오직     | 스냅샷에서 실제 키를 캡처할 수 있음   |

### 각각을 사용하는 경우

* **공급자 모델 사용**시기: 팀 전체에서 표준 모델을 공유하고 있거나 일관된 구성이 필요하거나 우발적인 재정의를 방지하고 싶은 경우
* **런타임 모델 사용**시기: 임시 자격 증명을 사용하거나 임시 엔드포인트로 작업하여 새 모델을 빠르게 테스트하는 경우

## 선택 지속성 및 권장 사항

> \[!중요한]
>
> 정의하다`modelProviders`사용자 범위에서`~/.qwen/settings.json`가능할 때마다 모든 범위에서 자격 증명 재정의를 유지하지 마십시오. 사용자 설정에서 공급자 카탈로그를 유지하면 프로젝트와 사용자 범위 간의 병합/재정의 충돌을 방지하고`/auth`그리고`/model`업데이트는 항상 일관된 범위에 다시 작성됩니다.

* `/model`그리고`/auth`지속하다`model.name`(해당되는 경우) 그리고`security.auth.selectedType`이미 정의된 가장 가까운 쓰기 가능한 범위`modelProviders`; 그렇지 않으면 사용자 범위로 돌아갑니다. 이렇게 하면 작업공간/사용자 파일이 활성 공급자 카탈로그와 동기화된 상태로 유지됩니다.
* 없이`modelProviders`, 해석기는 CLI/env/settings 레이어를 혼합하여 런타임 모델을 생성합니다. 이는 단일 공급자 설정에는 적합하지만 자주 전환하는 경우에는 번거롭습니다. 스위치가 원자성, 소스 속성 및 디버깅 가능 상태를 유지하도록 다중 모델 워크플로가 공통될 때마다 공급자 카탈로그를 정의하십시오.
