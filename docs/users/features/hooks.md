# Qwen 코드 후크

## 개요

Qwen Code 후크는 Qwen Code 애플리케이션의 동작을 확장하고 사용자 정의하기 위한 강력한 메커니즘을 제공합니다. 후크를 사용하면 사용자는 도구 실행 전, 도구 실행 후, 세션 시작/종료 및 기타 주요 이벤트 도중과 같이 애플리케이션 수명주기의 특정 지점에서 사용자 정의 스크립트 또는 프로그램을 실행할 수 있습니다.

후크는 기본적으로 활성화되어 있습니다. 설정을 통해 일시적으로 모든 후크를 비활성화할 수 있습니다.`disableAllHooks`에게`true`설정 파일에서(최상위 수준에서`hooks`):

```json
{
  "disableAllHooks": true,
  "hooks": {
    "PreToolUse": [...]
  }
}
```

이렇게 하면 구성을 삭제하지 않고 모든 후크가 비활성화됩니다.

## 후크란 무엇입니까?

후크는 애플리케이션 흐름의 사전 정의된 지점에서 Qwen Code에 의해 자동으로 실행되는 사용자 정의 스크립트 또는 프로그램입니다. 이를 통해 사용자는 다음을 수행할 수 있습니다.

- 도구 사용 모니터링 및 감사
- 보안 정책 시행
- 대화에 추가 컨텍스트 삽입
- 이벤트를 기반으로 애플리케이션 동작 사용자 정의
- 외부 시스템 및 서비스와 통합
- 프로그래밍 방식으로 도구 입력 또는 응답 수정

## 후크 유형

Qwen Code는 세 가지 후크 실행기 유형을 지원합니다.

| 유형       | 설명                                                                                                          |
| :--------- | :------------------------------------------------------------------------------------------------------------ |
| `command`  | 쉘 명령을 실행합니다. 다음을 통해 JSON을 수신합니다.`stdin`, 다음을 통해 결과를 반환합니다.`stdout`.          |
| `http`     | JSON을 다음과 같이 보냅니다.`POST`요청 본문을 지정된 URL로 보냅니다. HTTP 응답 본문을 통해 결과를 반환합니다. |
| `function` | 등록된 JavaScript 함수를 직접 호출합니다(세션 수준 후크만 해당).                                              |

### 명령 후크

명령 후크는 하위 프로세스를 통해 명령을 실행합니다. 입력 JSON은 stdin을 통해 전달되고 출력은 stdout을 통해 반환됩니다.

**구성:**

| 필드            | 유형                     | 필수의 | 설명                                      |
| :-------------- | :----------------------- | :----- | :---------------------------------------- |
| `type`          | `"command"`              | 예     | 후크형                                    |
| `command`       | `string`                 | 예     | 실행할 명령                               |
| `name`          | `string`                 | 아니요 | 후크 이름(로깅용)                         |
| `description`   | `string`                 | 아니요 | 후크 설명                                 |
| `timeout`       | `number`                 | 아니요 | 시간 초과(밀리초), 기본값은 60000         |
| `async`         | `boolean`                | 아니요 | 백그라운드에서 비동기적으로 실행할지 여부 |
| `env`           | `Record<string, string>` | 아니요 | 환경변수                                  |
| `shell`         | `"bash" \| "powershell"` | 아니요 | 사용할 쉘                                 |
| `statusMessage` | `string`                 | 아니요 | 실행 중 표시되는 상태 메시지              |

**예:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "WriteFile",
        "hooks": [
          {
            "type": "command",
            "command": "$QWEN_PROJECT_DIR/.qwen/hooks/security-check.sh",
            "name": "security-check",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

### HTTP 후크

HTTP 후크는 지정된 URL에 대한 POST 요청으로 후크 입력을 보냅니다. URL 화이트리스트, DNS 수준 SSRF 보호, 환경 변수 보간 및 기타 보안 기능을 지원합니다.

**구성:**

| 필드             | 유형                     | 필수의 | 설명                                           |
| :--------------- | :----------------------- | :----- | :--------------------------------------------- |
| `type`           | `"http"`                 | 예     | 후크형                                         |
| `url`            | `string`                 | 예     | 타겟 URL                                       |
| `headers`        | `Record<string, string>` | 아니요 | 요청 헤더(env var 보간 지원)                   |
| `allowedEnvVars` | `string[]`               | 아니요 | URL/헤더에 허용되는 환경 변수 화이트리스트     |
| `timeout`        | `number`                 | 아니요 | 시간 초과(초), 기본값은 600                    |
| `name`           | `string`                 | 아니요 | 후크 이름(로깅용)                              |
| `statusMessage`  | `string`                 | 아니요 | 실행 중 표시되는 상태 메시지                   |
| `once`           | `boolean`                | 아니요 | 세션당 이벤트당 한 번만 실행(HTTP 후크만 해당) |

**보안 기능:**

- **URL 허용 목록**: 다음을 통해 허용된 URL 패턴을 구성합니다.`allowedUrls`
- **SSRF 보호**: 개인 IP(10.x.x.x, 172.16-31.x.x, 192.168.x.x 등)는 차단하지만 루프백 주소(127.0.0.1, ::1)는 허용합니다.
- **DNS 검증**: DNS 리바인딩 공격을 방지하기 위해 요청 전에 도메인 확인을 검증합니다.
- **환경 변수 보간**:`${VAR}`구문에서는 변수만 허용합니다.`allowedEnvVars`화이트리스트

**예:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "http",
            "url": "http://127.0.0.1:8080/hooks/pre-tool-use",
            "headers": {
              "Authorization": "Bearer ${HOOK_API_KEY}"
            },
            "allowedEnvVars": ["HOOK_API_KEY"],
            "timeout": 10,
            "name": "remote-security-check"
          }
        ]
      }
    ]
  }
}
```

### 함수 후크

함수 후크는 등록된 JavaScript/TypeScript 함수를 직접 호출합니다. 스킬 시스템에서 내부적으로 사용되며 현재 최종 사용자를 위한 공개 API로 노출되지 않습니다.

**메모**: 대부분의 사용 사례에서는 다음을 사용합니다.**명령 후크**또는**HTTP 후크**대신 설정 파일에서 구성할 수 있습니다.

## 후크 이벤트

Qwen Code 세션 중 특정 지점에서 후크가 실행됩니다. 다양한 이벤트는 트리거 조건을 필터링하기 위해 다양한 매처를 지원합니다.

| 이벤트               | 트리거되는 시기                       | 일치 대상                                               |
| :------------------- | :------------------------------------ | :------------------------------------------------------ |
| `PreToolUse`         | 도구 실행 전                          | 도구 이름(`WriteFile`,`ReadFile`,`Bash`, 등.)           |
| `PostToolUse`        | 성공적인 도구 실행 후                 | 도구 이름                                               |
| `PostToolUseFailure` | 도구 실행이 실패한 후                 | 도구 이름                                               |
| `UserPromptSubmit`   | 사용자가 프롬프트를 제출한 후         | 없음(항상 발생)                                         |
| `SessionStart`       | 세션이 시작되거나 재개될 때           | 원천 (`startup`,`resume`,`clear`,`compact`)             |
| `SessionEnd`         | 세션이 종료되면                       | 이유 (`clear`,`logout`,`prompt_input_exit`, 등.)        |
| `Stop`               | 클로드가 답변을 마무리할 준비를 할 때 | 없음(항상 발생)                                         |
| `SubagentStart`      | 하위 에이전트가 시작될 때             | 에이전트 유형(`Bash`,`Explorer`,`Plan`, 등.)            |
| `SubagentStop`       | 하위 에이전트가 중지되는 경우         | 에이전트 유형                                           |
| `PreCompact`         | 대화 압축 전                          | 방아쇠 (`manual`,`auto`)                                |
| `Notification`       | 알림이 전송되는 경우                  | 유형 (`permission_prompt`,`idle_prompt`,`auth_success`) |
| `PermissionRequest`  | 권한 대화 상자가 표시되는 경우        | 도구 이름                                               |

### 일치하는 패턴

`matcher`트리거 조건을 필터링하는 데 사용되는 정규식입니다.

| 이벤트 유형          | 이벤트                                                              | 일치자 지원    | 일치 대상                                             |
| :------------------- | :------------------------------------------------------------------ | :------------- | :---------------------------------------------------- |
| 도구 이벤트          | `PreToolUse`,`PostToolUse`,`PostToolUseFailure`,`PermissionRequest` | ✅ 정규식      | 도구 이름:`WriteFile`,`ReadFile`,`Bash`, 등.          |
| 하위 에이전트 이벤트 | `SubagentStart`,`SubagentStop`                                      | ✅ 정규식      | 에이전트 유형:`Bash`,`Explorer`, 등.                  |
| 세션 이벤트          | `SessionStart`                                                      | ✅ 정규식      | 원천:`startup`,`resume`,`clear`,`compact`             |
| 세션 이벤트          | `SessionEnd`                                                        | ✅ 정규식      | 이유:`clear`,`logout`,`prompt_input_exit`, 등.        |
| 알림 이벤트          | `Notification`                                                      | ✅ 정확히 일치 | 유형:`permission_prompt`,`idle_prompt`,`auth_success` |
| 컴팩트 이벤트        | `PreCompact`                                                        | ✅ 정확히 일치 | 방아쇠:`manual`,`auto`                                |
| 프롬프트 이벤트      | `UserPromptSubmit`                                                  | ❌ 아니요      | 해당 없음                                             |
| 이벤트 중지          | `Stop`                                                              | ❌ 아니요      | 해당 없음                                             |

**일치 구문:**

- 빈 문자열`""`또는`"*"`해당 유형의 모든 이벤트와 일치합니다.
- 표준 정규식 구문 지원(예:`^Bash$`,`Read.*`,`(WriteFile|Edit)`)

**예:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^Bash$",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'bash check' >> /tmp/hooks.log"
          }
        ]
      },
      {
        "matcher": "Write.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'write check' >> /tmp/hooks.log"
          }
        ]
      },
      {
        "matcher": "*",
        "hooks": [
          { "type": "command", "command": "echo 'all tools' >> /tmp/hooks.log" }
        ]
      }
    ],
    "SubagentStart": [
      {
        "matcher": "^(Bash|Explorer)$",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'subagent check' >> /tmp/hooks.log"
          }
        ]
      }
    ]
  }
}
```

## 입력/출력 규칙

### 후크 입력 구조

모든 후크는 stdin(명령) 또는 POST 본문(http)을 통해 JSON 형식의 표준화된 입력을 받습니다.

**공통 필드:**

```json
{
  "session_id": "string",
  "transcript_path": "string",
  "cwd": "string",
  "hook_event_name": "string",
  "timestamp": "string"
}
```

후크 유형에 따라 이벤트별 필드가 추가됩니다. 하위 에이전트에서 실행하는 경우`agent_id`그리고`agent_type`추가적으로 포함되어 있습니다.

### 후크 출력 구조

후크 출력은 다음을 통해 반환됩니다.`stdout`(명령) 또는 HTTP 응답 본문(http)을 JSON으로 사용합니다.

**종료 코드 동작(명령 후크):**

| 종료 코드 | 행동                                                                    |
| :-------- | :---------------------------------------------------------------------- |
| `0`       | 성공. JSON을 구문 분석합니다.`stdout`행동을 통제하기 위해.              |
| `2`       | **차단 오류**. 무시`stdout`, 통과`stderr`모델에 대한 오류 피드백으로.   |
| 다른      | 비차단 오류입니다.`stderr`디버그 모드에서만 표시되며 실행은 계속됩니다. |

**출력 구조:**

후크 출력은 세 가지 범주의 필드를 지원합니다.

1. **공통 필드**:`continue`,`stopReason`,`suppressOutput`,`systemMessage`
2. **최상위 결정**:`decision`,`reason`(일부 이벤트에서 사용됨)
3. **이벤트별 제어**:`hookSpecificOutput`(반드시 포함해야 함`hookEventName`)

```json
{
  "continue": true,
  "decision": "allow",
  "reason": "Operation approved",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "Additional context information"
  }
}
```

### 개별 후크 이벤트 세부정보

#### PreTool사용

**목적**: 권한 확인, 입력 유효성 검사 또는 컨텍스트 삽입을 허용하기 위해 도구를 사용하기 전에 실행됩니다.

**이벤트별 필드**:

```json
{
  "permission_mode": "default | plan | auto_edit | yolo",
  "tool_name": "name of the tool being executed",
  "tool_input": "object containing the tool's input parameters",
  "tool_use_id": "unique identifier for this tool use instance"
}
```

**출력 옵션**:

- `hookSpecificOutput.permission결정`: "허용", "거부" 또는 "요청"(필수)
- `hookSpecificOutput.permission결정Reason`: 결정에 대한 설명(필수)
- `hookSpecificOutput.updatedInput`: 원본 대신 사용할 수정된 도구 입력 매개변수
- `hookSpecificOutput.additionalContext`: 추가 컨텍스트 정보

**메모**: 표준 후크 출력 필드는 다음과 같습니다.`decision`그리고`reason`기본 클래스에서 기술적으로 지원되므로 공식 인터페이스에서는 다음을 기대합니다.`hookSpecificOutput`\~와 함께`permission결정`그리고`permission결정Reason`.

**예제 출력**:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permission결정": "deny",
    "permission결정Reason": "Security policy blocks database writes",
    "additionalContext": "Current environment: production. Proceed with caution."
  }
}
```

#### PostTool사용

**목적**: 결과를 처리하거나, 결과를 기록하거나, 추가 컨텍스트를 주입하기 위해 도구가 성공적으로 완료된 후에 실행됩니다.

**이벤트별 필드**:

```json
{
  "permission_mode": "default | plan | auto_edit | yolo",
  "tool_name": "name of the tool that was executed",
  "tool_input": "object containing the tool's input parameters",
  "tool_response": "object containing the tool's response",
  "tool_use_id": "unique identifier for this tool use instance"
}
```

**출력 옵션**:

- `decision`: "허용", "거부", "차단"(지정되지 않은 경우 기본값은 "허용")
- `reason`: 결정 이유
- `hookSpecificOutput.additionalContext`: 포함할 추가 정보

**예제 출력**:

```json
{
  "decision": "allow",
  "reason": "Tool executed successfully",
  "hookSpecificOutput": {
    "additionalContext": "File modification recorded in audit log"
  }
}
```

#### PostToolUse실패

**목적**: 도구 실행이 오류 처리, 경고 전송 또는 실패 기록에 실패할 때 실행됩니다.

**이벤트별 필드**:

```json
{
  "permission_mode": "default | plan | auto_edit | yolo",
  "tool_use_id": "unique identifier for the tool use",
  "tool_name": "name of the tool that failed",
  "tool_input": "object containing the tool's input parameters",
  "error": "error message describing the failure",
  "is_interrupt": "boolean indicating if failure was due to user interruption (optional)"
}
```

**출력 옵션**:

- `hookSpecificOutput.additionalContext`: 오류 처리 정보
- 표준 후크 출력 필드

**예제 출력**:

```json
{
  "hookSpecificOutput": {
    "additionalContext": "Error: File not found. Failure logged in monitoring system."
  }
}
```

#### 사용자 프롬프트제출

**목적**: 사용자가 입력을 수정, 검증 또는 강화하라는 메시지를 제출할 때 실행됩니다.

**이벤트별 필드**:

```json
{
  "prompt": "the user's submitted prompt text"
}
```

**출력 옵션**:

- `decision`: "허용", "거부", "차단" 또는 "요청"
- `reason`: 사람이 읽을 수 있는 결정에 대한 설명
- `hookSpecificOutput.additionalContext`: 프롬프트에 추가할 추가 컨텍스트(선택 사항)

**메모**: UserPromptSubmitOutput은 HookOutput을 확장하므로 모든 표준 필드를 사용할 수 있지만 HookSpecificOutput의 추가 컨텍스트만 이 이벤트에 대해 구체적으로 정의됩니다.

**예제 출력**:

```json
{
  "decision": "allow",
  "reason": "Prompt reviewed and approved",
  "hookSpecificOutput": {
    "additionalContext": "Remember to follow company coding standards."
  }
}
```

#### 세션 시작

**목적**: 초기화 작업을 수행하기 위해 새 세션이 시작될 때 실행됩니다.

**이벤트별 필드**:

```json
{
  "permission_mode": "default | plan | auto_edit | yolo",
  "source": "startup | resume | clear | compact",
  "model": "the model being used",
  "agent_type": "the type of agent if applicable (optional)"
}
```

**출력 옵션**:

- `hookSpecificOutput.additionalContext`: 세션에서 사용할 수 있는 컨텍스트
- 표준 후크 출력 필드

**예제 출력**:

```json
{
  "hookSpecificOutput": {
    "additionalContext": "Session started with security policies enabled."
  }
}
```

#### 세션 종료

**목적**: 정리 작업을 수행하기 위해 세션이 종료될 때 실행됩니다.

**이벤트별 필드**:

```json
{
  "reason": "clear | logout | prompt_input_exit | bypass_permissions_disabled | other"
}
```

**출력 옵션**:

- 표준 후크 출력 필드(일반적으로 차단에 사용되지 않음)

#### 멈추다

**목적**: Qwen이 최종 피드백이나 요약을 제공하기 위해 응답을 마치기 전에 실행됩니다.

**이벤트별 필드**:

```json
{
  "stop_hook_active": "boolean indicating if stop hook is active",
  "last_assistant_message": "the last message from the assistant"
}
```

**출력 옵션**:

- `decision`: "허용", "거부", "차단" 또는 "요청"
- `reason`: 사람이 읽을 수 있는 결정에 대한 설명
- `stopReason`: 중지 응답에 포함할 피드백
- `continue`: 실행을 중지하려면 false로 설정하세요.
- `hookSpecificOutput.additionalContext`: 추가 컨텍스트 정보

**메모**: StopOutput은 HookOutput을 확장하므로 모든 표준 필드를 사용할 수 있지만 stopReason 필드는 특히 이 이벤트와 관련이 있습니다.

**예제 출력**:

```json
{
  "decision": "block",
  "reason": "Must be provided when Qwen Code is blocked from stopping"
}
```

#### 중지실패

**목적**: API 오류로 인해 턴이 종료될 때 실행됩니다(Stop 대신). 이것은**실행하고 잊어버리세요**이벤트 - 후크 출력 및 종료 코드가 무시됩니다.

**이벤트별 필드**:

```json
{
  "error": "rate_limit | authentication_failed | billing_error | invalid_request | server_error | max_output_tokens | unknown",
  "error_details": "detailed error message (optional)",
  "last_assistant_message": "the last message from the assistant before the error (optional)"
}
```

**일치자**: 상대와의 경기`error`필드. 예를 들어,`"matcher": "rate_limit"`비율 제한 오류에 대해서만 트리거됩니다.

**출력 옵션**:

- **없음**- StopFailure는 실행 후 잊어버립니다. 모든 후크 출력 및 종료 코드는 무시됩니다.

**종료 코드 처리**:

| 종료 코드 | 행동                       |
| --------- | -------------------------- |
| 어느      | 무시됨(실행 후 잊어버리기) |

**예시 구성**:

```json
{
  "hooks": {
    "StopFailure": [
      {
        "matcher": "rate_limit",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/rate-limit-alert.sh",
            "name": "rate-limit-alerter"
          }
        ]
      }
    ]
  }
}
```

**사용 사례**:

- 비율 제한 모니터링 및 알림
- 인증 실패 로깅
- 결제 오류 알림
- 오류 통계 수집

#### 하위 에이전트시작

**목적**: 컨텍스트 또는 권한을 설정하기 위해 하위 에이전트(예: 작업 도구)가 시작될 때 실행됩니다.

**이벤트별 필드**:

```json
{
  "permission_mode": "default | plan | auto_edit | yolo",
  "agent_id": "identifier for the subagent",
  "agent_type": "type of agent (Bash, Explorer, Plan, Custom, etc.)"
}
```

**출력 옵션**:

- `hookSpecificOutput.additionalContext`: 하위 에이전트에 대한 초기 컨텍스트
- 표준 후크 출력 필드

**예제 출력**:

```json
{
  "hookSpecificOutput": {
    "additionalContext": "Subagent initialized with restricted permissions."
  }
}
```

#### 하위 에이전트 중지

**목적**: 하위 에이전트가 마무리 작업 수행을 완료하면 실행됩니다.

**이벤트별 필드**:

```json
{
  "permission_mode": "default | plan | auto_edit | yolo",
  "stop_hook_active": "boolean indicating if stop hook is active",
  "agent_id": "identifier for the subagent",
  "agent_type": "type of agent",
  "agent_transcript_path": "path to the subagent's transcript",
  "last_assistant_message": "the last message from the subagent"
}
```

**출력 옵션**:

- `decision`: "허용", "거부", "차단" 또는 "요청"
- `reason`: 사람이 읽을 수 있는 결정에 대한 설명

**예제 출력**:

```json
{
  "decision": "block",
  "reason": "Must be provided when Qwen Code is blocked from stopping"
}
```

#### 프리컴팩트

**목적**: 대화 압축 이전에 실행하여 압축을 준비하거나 기록합니다.

**이벤트별 필드**:

```json
{
  "trigger": "manual | auto",
  "custom_instructions": "custom instructions currently set"
}
```

**출력 옵션**:

- `hookSpecificOutput.additionalContext`: 압축하기 전에 포함할 컨텍스트
- 표준 후크 출력 필드

**예제 출력**:

```json
{
  "hookSpecificOutput": {
    "additionalContext": "Compacting conversation to maintain optimal context window."
  }
}
```

#### 포스트콤팩트

**목적**: 요약을 보관하거나 사용량을 추적하기 위해 대화 압축이 완료된 후 실행됩니다.

**이벤트별 필드**:

```json
{
  "trigger": "manual | auto",
  "compact_summary": "the summary generated by the compaction process"
}
```

**일치자**: 상대와의 경기`trigger`필드. 예를 들어,`"matcher": "manual"`다음을 통해서만 수동 압축이 실행됩니다.`/compact`명령.

**출력 옵션**:

- `hookSpecificOutput.additionalContext`: 추가 컨텍스트(로깅에만 해당)
- 표준 후크 출력 필드(로깅 전용)

**메모**: 포스트컴팩트는**\~ 아니다**공식 결정 모드에서 지원되는 이벤트 목록. 그만큼`decision`필드 및 기타 제어 필드는 제어 효과를 생성하지 않으며 로깅 목적으로만 사용됩니다.

**종료 코드 처리**:

| 종료 코드 | 행동                                                   |
| --------- | ------------------------------------------------------ |
| 0         | 성공 - 상세 모드에서 사용자에게 stdout이 표시됨        |
| 다른      | 비차단 오류 - 상세 모드에서 사용자에게 stderr이 표시됨 |

**예시 구성**:

```json
{
  "hooks": {
    "PostCompact": [
      {
        "matcher": "manual",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/save-compact-summary.sh",
            "name": "save-summary"
          }
        ]
      }
    ]
  }
}
```

**사용 사례**:

- 파일 또는 데이터베이스에 대한 요약 보관
- 사용 통계 추적
- 상황 변화 모니터링
- 압축 작업에 대한 감사 로깅

#### 공고

**목적**: 알림을 사용자 정의하거나 차단하기 위해 알림이 전송될 때 실행됩니다.

**이벤트별 필드**:

```json
{
  "message": "notification message content",
  "title": "notification title (optional)",
  "notification_type": "permission_prompt | idle_prompt | auth_success"
}
```

> **메모**:`elicitation_dialog`유형이 정의되었지만 현재 구현되지 않았습니다.

**출력 옵션**:

- `hookSpecificOutput.additionalContext`: 포함할 추가 정보
- 표준 후크 출력 필드

**예제 출력**:

```json
{
  "hookSpecificOutput": {
    "additionalContext": "Notification processed by monitoring system."
  }
}
```

#### 허가요청

**목적**: 결정을 자동화하거나 권한을 업데이트하기 위해 권한 대화 상자가 표시될 때 실행됩니다.

**이벤트별 필드**:

```json
{
  "permission_mode": "default | plan | auto_edit | yolo",
  "tool_name": "name of the tool requesting permission",
  "tool_input": "object containing the tool's input parameters",
  "permission_suggestions": "array of suggested permissions (optional)"
}
```

**출력 옵션**:

- `hookSpecificOutput.decision`: 권한 결정 세부정보가 포함된 구조화된 객체:
  - `behavior`: "허용" 또는 "거부"
  - `updatedInput`: 수정된 도구 입력(선택 사항)
  - `updatedPermissions`: 수정된 권한(선택 사항)
  - `message`: 사용자에게 보여줄 메시지 (선택)
  - `interrupt`: 작업 흐름을 중단할지 여부(선택 사항)

**예제 출력**:

```json
{
  "hookSpecificOutput": {
    "decision": {
      "behavior": "allow",
      "message": "Permission granted based on security policy",
      "interrupt": false
    }
  }
}
```

## 후크 구성

후크는 일반적으로 Qwen Code 설정에서 구성됩니다.`.qwen/settings.json`또는 사용자 구성 파일:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^Bash$",
        "sequential": false,
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/security-check.sh",
            "name": "security-check",
            "description": "Run security checks before tool execution",
            "timeout": 30000
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session started'",
            "name": "session-init"
          }
        ]
      }
    ]
  }
}
```

## 후크 실행

### 병렬 실행과 순차 실행

- 기본적으로 후크는 더 나은 성능을 위해 병렬로 실행됩니다.
- 사용`sequential: true`순서에 따른 실행을 강제하기 위한 후크 정의
- 순차 후크는 체인의 후속 후크에 대한 입력을 수정할 수 있습니다.

### 비동기 후크

오직`command`유형은 비동기 실행을 지원합니다. 환경`"async": true`메인 흐름을 차단하지 않고 백그라운드에서 후크를 실행합니다.

**특징:**

- 결정 제어를 반환할 수 없습니다(작업이 이미 발생했습니다).
- 결과는 다음 대화 차례에 주입됩니다.`systemMessage`또는`additionalContext`
- 감사, 로깅, 백그라운드 테스트 등에 적합합니다.

**예:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "WriteFile|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$QWEN_PROJECT_DIR/.qwen/hooks/run-tests-async.sh",
            "async": true,
            "timeout": 300000
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.js ]]; then exit 0; fi
RESULT=$(npm test 2>&1)
if [ $? -eq 0 ]; then
  echo "{\"systemMessage\": \"Tests passed after editing $FILE_PATH\"}"
else
  echo "{\"systemMessage\": \"Tests failed: $RESULT\"}"
fi
```

### 보안 모델

- Hook은 사용자 권한으로 사용자 환경에서 실행됩니다.
- 프로젝트 수준 후크에는 신뢰할 수 있는 폴더 상태가 필요합니다.
- 시간 초과로 후크 걸림 방지(기본값: 60초)

## 모범 사례

### 예 1: 보안 검증 후크

위험한 명령을 기록하고 잠재적으로 차단하는 PreToolUse 후크:

**security_check.sh**

```bash
#!/bin/bash

# Read input from stdin
INPUT=$(cat)

# Parse the input to extract tool info
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input')

# Check for potentially dangerous operations
if echo "$TOOL_INPUT" | grep -qiE "(rm.*-rf|mv.*\/|chmod.*777)"; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permission결정": "deny",
      "permission결정Reason": "Security policy blocks dangerous command"
    }
  }'
  exit 2  # Blocking error
fi

# Log the operation
echo "INFO: Tool $TOOL_NAME executed safely at $(date)" >> /var/log/qwen-security.log

# Allow with additional context
echo '{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permission결정": "allow",
    "permission결정Reason": "Security check passed",
    "additionalContext": "Command approved by security policy"
  }
}'
exit 0
```

구성`.qwen/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${SECURITY_CHECK_SCRIPT}",
            "name": "security-checker",
            "description": "Security validation for bash commands",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

### 예 2: HTTP 감사 후크

모든 도구 실행 기록을 원격 감사 서비스로 보내는 PostToolUse HTTP 후크:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "http",
            "url": "https://audit.example.com/api/tool-execution",
            "headers": {
              "Authorization": "Bearer ${AUDIT_API_TOKEN}",
              "Content-Type": "application/json"
            },
            "allowedEnvVars": ["AUDIT_API_TOKEN"],
            "timeout": 10,
            "name": "audit-logger"
          }
        ]
      }
    ]
  }
}
```

### 예 3: 사용자 프롬프트 유효성 검사 후크

민감한 정보에 대한 사용자 프롬프트의 유효성을 검사하고 긴 프롬프트에 대한 컨텍스트를 제공하는 UserPromptSubmit 후크:

**프롬프트\_validator.py**

```python
import json
import sys
import re

# Load input from stdin
try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError as e:
    print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
    exit(1)

user_prompt = input_data.get("prompt", "")

# Sensitive words list
sensitive_words = ["password", "secret", "token", "api_key"]

# Check for sensitive information
for word in sensitive_words:
    if re.search(rf"\b{word}\b", user_prompt.lower()):
        # Block prompts containing sensitive information
        output = {
            "decision": "block",
            "reason": f"Prompt contains sensitive information '{word}'. Please remove sensitive content and resubmit.",
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit"
            }
        }
        print(json.dumps(output))
        exit(0)

# Check prompt length and add warning context if too long
if len(user_prompt) > 1000:
    output = {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": "Note: User submitted a long prompt. Please read carefully and ensure all requirements are understood."
        }
    }
    print(json.dumps(output))
    exit(0)

# No processing needed for normal cases
exit(0)
```

## 문제 해결

- 후크 실행 세부정보는 애플리케이션 로그를 확인하세요.
- 후크 스크립트 권한 및 실행 가능성 확인
- 후크 출력에 적절한 JSON 형식이 있는지 확인하세요.
- 의도하지 않은 후크 실행을 방지하려면 특정 일치자 패턴을 사용하세요.
- 사용`--debug`자세한 Hook 매칭 및 실행 정보를 볼 수 있는 모드
- 일시적으로 모든 후크를 비활성화합니다. 추가`"disableAllHooks": true`설정에서
