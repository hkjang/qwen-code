# 헤드리스 모드

헤드리스 모드를 사용하면 명령줄에서 프로그래밍 방식으로 Qwen Code를 실행할 수 있습니다.
대화형 UI가 없는 스크립트 및 자동화 도구. 이것은 이상적입니다
스크립팅, 자동화, CI/CD 파이프라인 및 AI 기반 도구 구축.

## 개요

헤드리스 모드는 다음과 같은 Qwen Code에 대한 헤드리스 인터페이스를 제공합니다.

* 명령줄 인수 또는 stdin을 통해 프롬프트를 수락합니다.
* 구조화된 출력(텍스트 또는 JSON)을 반환합니다.
* 파일 리디렉션 및 파이핑 지원
* 자동화 및 스크립팅 워크플로우를 활성화합니다.
* 오류 처리를 위한 일관된 종료 코드 제공
* 다단계 자동화를 위해 현재 프로젝트로 범위가 지정된 이전 세션을 재개할 수 있습니다.

## 기본 사용법

### 직접 프롬프트

사용`--prompt`(또는`-p`) 헤드리스 모드에서 실행되는 플래그:

```bash
qwen --prompt "What is machine learning?"
```

### 표준 입력

터미널에서 Qwen Code로 파이프 입력:

```bash
echo "Explain this code" | qwen
```

### 파일 입력과 결합

파일에서 읽고 Qwen Code로 처리합니다.

```bash
cat README.md | qwen --prompt "Summarize this documentation"
```

### 이전 세션 재개(헤드리스)

헤드리스 스크립트에서 현재 프로젝트의 대화 컨텍스트를 재사용합니다.

```bash
# Continue the most recent session for this project and run a new prompt
qwen --continue -p "Run the tests again and summarize failures"

# Resume a specific session ID directly (no UI)
qwen --resume 123e4567-e89b-12d3-a456-426614174000 -p "Apply the follow-up refactor"
```

> \[!메모]
>
> * 세션 데이터는 프로젝트 범위 JSONL입니다.`~/.qwen/projects/<sanitized-cwd>/chats`.
> * 새 프롬프트를 보내기 전에 대화 기록, 도구 출력 및 채팅 압축 검사점을 복원합니다.

## 기본 세션 프롬프트 사용자 정의

공유 메모리 파일을 편집하지 않고도 단일 CLI 실행에 대한 기본 세션 시스템 프롬프트를 변경할 수 있습니다.

### 내장 시스템 프롬프트 무시

사용`--system-prompt`현재 실행에 대한 Qwen Code의 내장 기본 세션 프롬프트를 대체하려면 다음을 수행하십시오.

```bash
qwen -p "Review this patch" --system-prompt "You are a terse release reviewer. 저장소rt only blocking issues."
```

### 추가 지침 추가

사용`--append-system-prompt`내장된 프롬프트를 유지하고 이 실행에 대한 추가 지침을 추가하려면 다음을 수행하십시오.

```bash
qwen -p "Review this patch" --append-system-prompt "Be terse and focus on concrete findings."
```

사용자 정의 기본 프롬프트와 추가 실행 관련 지침을 원하는 경우 두 플래그를 결합할 수 있습니다.

```bash
qwen -p "Summarize this repository" \
  --system-prompt "You are a migration planner." \
  --append-system-prompt "Return exactly three bullets."
```

> \[!메모]
>
> * `--system-prompt`현재 실행의 기본 세션에만 적용됩니다.
> * 다음과 같은 로드된 메모리 및 컨텍스트 파일`QWEN.md`이후에도 계속 추가됩니다.`--system-prompt`.
> * `--append-system-prompt`내장 프롬프트 및 로드된 메모리 이후에 적용되며 다음과 함께 사용할 수 있습니다.`--system-prompt`.

## 출력 형식

Qwen 코드는 다양한 사용 사례에 대해 여러 출력 형식을 지원합니다.

### 텍스트 출력(기본값)

사람이 읽을 수 있는 표준 출력:

```bash
qwen -p "What is the capital of France?"
```

응답 형식:

```
The capital of France is Paris.
```

### JSON 출력

구조화된 데이터를 JSON 배열로 반환합니다. 세션이 완료되면 모든 메시지가 버퍼링되어 함께 출력됩니다. 이 형식은 프로그래밍 방식 처리 및 자동화 스크립트에 이상적입니다.

JSON 출력은 메시지 객체의 배열입니다. 출력에는 시스템 메시지(세션 초기화), 보조 메시지(AI 응답), 결과 메시지(실행 요약) 등 여러 메시지 유형이 포함됩니다.

#### 사용 예

```bash
qwen -p "What is the capital of France?" --output-format json
```

출력(실행 종료 시):

```json
[
  {
    "type": "system",
    "subtype": "session_start",
    "uuid": "...",
    "session_id": "...",
    "model": "qwen3-coder-plus",
    ...
  },
  {
    "type": "assistant",
    "uuid": "...",
    "session_id": "...",
    "message": {
      "id": "...",
      "type": "message",
      "role": "assistant",
      "model": "qwen3-coder-plus",
      "content": [
        {
          "type": "text",
          "text": "The capital of France is Paris."
        }
      ],
      "usage": {...}
    },
    "parent_tool_use_id": null
  },
  {
    "type": "result",
    "subtype": "success",
    "uuid": "...",
    "session_id": "...",
    "is_error": false,
    "duration_ms": 1234,
    "result": "The capital of France is Paris.",
    "usage": {...}
  }
]
```

### 스트림-JSON 출력

Stream-JSON 형식은 실행 중에 JSON 메시지가 발생하는 즉시 내보내므로 실시간 모니터링이 가능합니다. 이 형식은 각 메시지가 한 줄의 완전한 JSON 개체인 줄로 구분된 JSON을 사용합니다.

```bash
qwen -p "Explain TypeScript" --output-format stream-json
```

출력(이벤트 발생 시 스트리밍):

```json
{"type":"system","subtype":"session_start","uuid":"...","session_id":"..."}
{"type":"assistant","uuid":"...","session_id":"...","message":{...}}
{"type":"result","subtype":"success","uuid":"...","session_id":"..."}
```

와 결합하면`--include-partial-messages`, 실시간 UI 업데이트를 위해 추가 스트림 이벤트가 실시간(message\_start, content\_block\_delta 등)으로 발생합니다.

```bash
qwen -p "Write a Python script" --output-format stream-json --include-partial-messages
```

### 입력 형식

그만큼`--input-format`매개변수는 Qwen 코드가 표준 입력의 입력을 사용하는 방법을 제어합니다.

* **`text`**(기본값): stdin 또는 명령줄 인수의 표준 텍스트 입력
* **`stream-json`**: 양방향 통신을 위한 stdin을 통한 JSON 메시지 프로토콜

> **메모:**Stream-json 입력 모드는 현재 구축 중이며 SDK 통합을 위한 것입니다. 그것은 필요하다`--output-format stream-json`설정됩니다.

### 파일 리디렉션

출력을 파일에 저장하거나 다른 명령으로 파이프합니다.

```bash
# Save to file
qwen -p "Explain Docker" > docker-explanation.txt
qwen -p "Explain Docker" --output-format json > docker-explanation.json

# Append to file
qwen -p "Add more details" >> docker-explanation.txt

# Pipe to other tools
qwen -p "What is Kubernetes?" --output-format json | jq '.response'
qwen -p "Explain microservices" | wc -w
qwen -p "List programming languages" | grep -i "python"

# Stream-JSON output for real-time processing
qwen -p "Explain Docker" --output-format stream-json | jq '.type'
qwen -p "Write code" --output-format stream-json --include-partial-messages | jq '.event.type'
```

## 구성 옵션

헤드리스 사용을 위한 주요 명령줄 옵션:

| 옵션                           | 설명                                     | 예                                                                        |
| ---------------------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `--prompt`,`-p`              | 헤드리스 모드로 실행                            | `qwen -p "query"`                                                        |
| `--output-format`,`-o`       | 출력 형식 지정(text, json, stream-json)      | `qwen -p "query" --output-format json`                                   |
| `--input-format`             | 입력 형식 지정(text, stream-json)            | `qwen --input-format text --output-format stream-json`                   |
| `--include-partial-messages` | stream-json 출력에 부분 메시지 포함              | `qwen -p "query" --output-format stream-json --include-partial-messages` |
| `--system-prompt`            | 이 실행에 대한 기본 세션 시스템 프롬프트를 재정의합니다.       | `qwen -p "query" --system-prompt "You are a terse reviewer."`            |
| `--append-system-prompt`     | 이 실행에 대한 기본 세션 시스템 프롬프트에 추가 지침을 추가합니다. | `qwen -p "query" --append-system-prompt "Focus on concrete findings."`   |
| `--debug`,`-d`               | 디버그 모드 활성화                             | `qwen -p "query" --debug`                                                |
| `--all-files`,`-a`           | 컨텍스트에 모든 파일 포함                         | `qwen -p "query" --all-files`                                            |
| `--include-directories`      | 추가 디렉터리 포함                             | `qwen -p "query" --include-directories src,docs`                         |
| `--yolo`,`-y`                | 모든 작업 자동 승인                            | `qwen -p "query" --yolo`                                                 |
| `--approval-mode`            | 승인 모드 설정                               | `qwen -p "query" --approval-mode auto_edit`                              |
| `--continue`                 | 이 프로젝트의 가장 최근 세션을 재개합니다.               | `qwen --continue -p "Pick up where we left off"`                         |
| `--resume [sessionId]`       | 특정 세션 재개(또는 대화형으로 선택)                  | `qwen --resume 123e... -p "Finish the refactor"`                         |

사용 가능한 모든 구성 옵션, 설정 파일 및 환경 변수에 대한 자세한 내용은 다음을 참조하세요.[구성 가이드](../configuration/settings).

## 예

### 코드 검토

```bash
cat src/auth.py | qwen -p "Review this authentication code for security issues" > security-review.txt
```

### 커밋 메시지 생성

```bash
result=$(git diff --cached | qwen -p "Write a concise commit message for these changes" --output-format json)
echo "$result" | jq -r '.response'
```

### API 문서

```bash
result=$(cat api/routes.js | qwen -p "Generate OpenAPI spec for these routes" --output-format json)
echo "$result" | jq -r '.response' > openapi.json
```

### 배치 코드 분석

```bash
for file in src/*.py; do
    echo "Analyzing $file..."
    result=$(cat "$file" | qwen -p "Find potential bugs and suggest improvements" --output-format json)
    echo "$result" | jq -r '.response' > "reports/$(basename "$file").analysis"
    echo "Completed analysis for $(basename "$file")" >> reports/progress.log
done
```

### PR 코드 검토

```bash
result=$(git diff origin/main...HEAD | qwen -p "Review these changes for bugs, security issues, and code quality" --output-format json)
echo "$result" | jq -r '.response' > pr-review.json
```

### 로그 분석

```bash
grep "ERROR" /var/log/app.log | tail -20 | qwen -p "Analyze these errors and suggest root cause and fixes" > error-analysis.txt
```

### 릴리스 노트 생성

```bash
result=$(git log --oneline v1.0.0..HEAD | qwen -p "Generate release notes from these commits" --output-format json)
response=$(echo "$result" | jq -r '.response')
echo "$response"
echo "$response" >> CHANGELOG.md
```

### 모델 및 도구 사용 추적

```bash
result=$(qwen -p "Explain this database schema" --include-directories db --output-format json)
total_tokens=$(echo "$result" | jq -r '.stats.models // {} | to_entries | map(.value.tokens.total) | add // 0')
models_used=$(echo "$result" | jq -r '.stats.models // {} | keys | join(", ") | if . == "" then "none" else . end')
tool_calls=$(echo "$result" | jq -r '.stats.tools.totalCalls // 0')
tools_used=$(echo "$result" | jq -r '.stats.tools.byName // {} | keys | join(", ") | if . == "" then "none" else . end')
echo "$(date): $total_tokens tokens, $tool_calls tool calls ($tools_used) used with models: $models_used" >> usage.log
echo "$result" | jq -r '.response' > schema-docs.md
echo "Recent usage trends:"
tail -5 usage.log
```

## 영구 재시도 모드

Qwen 코드가 CI/CD 파이프라인에서 또는 백그라운드 데몬으로 실행되는 경우 짧은 API 중단(속도 제한 또는 과부하)으로 인해 여러 시간이 소요되는 작업이 중단되어서는 안 됩니다.**지속적인 재시도 모드**Qwen Code는 서비스가 복구될 때까지 일시적인 API 오류를 무기한 재시도합니다.

### 작동 원리

* **일시적인 오류만**: HTTP 429(속도 제한) 및 529(오버로드)가 무기한 재시도됩니다. 다른 오류(400, 500 등)는 여전히 정상적으로 실패합니다.
* **제한이 있는 지수 백오프**: 재시도 레이턴시이 기하급수적으로 늘어나지만 한도는 다음과 같습니다.**5분**재시도 당.
* **하트비트 연결 유지**: 오랫동안 기다리는 동안 상태 줄은 매회 stderr에 인쇄됩니다.**30초**CI 실행기가 비활성으로 인해 프로세스를 종료하는 것을 방지합니다.
* **우아한 저하**: 일시적이지 않은 오류와 대화형 모드는 전혀 영향을 받지 않습니다.

### 활성화

설정`QWEN_CODE_UNATTENDED_RETRY`환경 변수`true`또는`1`(엄격한 일치, 대소문자 구분):

```bash
export QWEN_CODE_UNATTENDED_RETRY=1
```

> \[!중요] 
> 지속적인 재시도에는**명시적인 동의**. `CI=true`혼자서는**\~ 아니다**활성화하십시오. 빠르게 실패하는 CI 작업을 자동으로 무한 대기 작업으로 바꾸는 것은 위험할 수 있습니다. 항상 설정`QWEN_CODE_UNATTENDED_RETRY`파이프라인 구성에서 명시적으로.

### 예

#### GitHub 작업

```yaml
- name: Automated code review
  env:
    QWEN_CODE_UNATTENDED_RETRY: '1'
  run: |
    qwen -p "Review all files in src/ for security issues" \
      --output-format json \
      --yolo > review.json
```

#### 야간 일괄 처리

```bash
export QWEN_CODE_UNATTENDED_RETRY=1
qwen -p "Migrate all callback-style functions to async/await in src/" --yolo
```

#### 배경 데몬

```bash
QWEN_CODE_UNATTENDED_RETRY=1 nohup qwen -p "Audit all dependencies for known CVEs" \
  --output-format json > audit.json 2> audit.log &
```

### 모니터링

지속적인 재시도 중에는 하트비트 메시지가 인쇄됩니다.**stderr**:

```
[qwen-code] Waiting for API capacity... attempt 3, retry in 45s
[qwen-code] Waiting for API capacity... attempt 3, retry in 15s
```

이러한 메시지는 CI 실행기를 활성 상태로 유지하고 진행 상황을 모니터링할 수 있게 해줍니다. stdout에는 표시되지 않으므로 다른 도구로 파이프된 JSON 출력은 깨끗하게 유지됩니다.

## 리소스

* [CLI 구성](../configuration/settings#command-line-arguments)- 전체 구성 가이드
* [입증](../configuration/settings#environment-variables-for-api-access)- 설정 인증
* [명령](../features/commands)- 대화형 명령 참조
* [튜토리얼](../quickstart)- 단계별 자동화 가이드
