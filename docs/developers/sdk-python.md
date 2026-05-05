# 파이썬 SDK

## `qwen-code-sdk`

`qwen-code-sdk`Qwen Code용 실험용 Python SDK입니다. v1은 
기존`stream-json`CLI 프로토콜을 사용하여 전송 표면을 작게 유지하고 
테스트 가능.

## 범위

* 패키지 이름:`qwen-code-sdk`
* 가져오기 경로:`qwen_code_sdk`
* 런타임 요구 사항: Python`>=3.10`
* CLI 종속성: 외부`qwen`v1에는 실행 파일이 필요합니다
* 전송 범위: 프로세스 전송만
* v1에 포함되지 않음: ACP 전송, SDK 내장 MCP 서버

## 설치하다

```bash
pip install qwen-code-sdk
```

만약에`qwen`켜져 있지 않습니다`PATH`, 통과하다`path_to_qwen_executable`명시적으로.

## 빠른 시작

```python
import asyncio

from qwen_code_sdk import is_sdk_result_message, query


async def main() -> None:
    result = query(
        "Explain the repository structure.",
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

## API 표면

### 최상위 진입점

* `query(prompt, options=None) -> Query`
* `query_sync(prompt, options=None) -> SyncQuery`

`prompt`다음 중 하나를 지원합니다:

* `str`단일 회전 요청의 경우
* `AsyncIterable[SDKUserMessage]`다중 턴 스트림용

### `Query`

* SDK 메시지를 통한 비동기 반복 가능
* `close()`
* `interrupt()`
* `set_model(model)`
* `set_permission_mode(mode)`
* `supported_commands()`
* `mcp_server_status()`
* `get_session_id()`
* `is_closed()`

### `QueryOptions`

v1에서 지원되는 옵션:

* `cwd`
* `model`
* `path_to_qwen_executable`
* `permission_mode`
* `can_use_tool`
* `env`
* `system_prompt`
* `append_system_prompt`
* `debug`
* `max_session_turns`
* `core_tools`
* `exclude_tools`
* `allowed_tools`
* `auth_type`
* `include_partial_messages`
* `resume`
* `continue_session`
* `session_id`
* `timeout`
* `mcp_servers`
* `stderr`

세션 인수 우선순위는 다음과 같이 고정됩니다.

1. `resume`
2. `continue_session`
3. `session_id`

## 권한 처리

CLI가`can_use_tool`제어 요청이 있으면 SDK는 이를 통해 요청을 라우팅합니다.`can_use_tool(tool_name, tool_input, context)`.

* 기본 동작: 거부
* 기본 시간 초과: 60초
* 시간 초과 대체: 거부
* 콜백 예외: 오류 메시지와 함께 거부로 변환됨
* 콜백 컨텍스트:`cancel_event`,`suggestions`, 그리고`blocked_path`
* 콜백 계약:`can_use_tool`3개의 위치 인수를 사용하여 비동기식이어야 합니다.`stderr`위치 문자열 인수 1개를 허용해야 합니다.

## 오류 모델

* `ValidationError`: 잘못된 옵션, 잘못된 UUID, 지원되지 않는 조합
* `ControlRequestTimeoutError`: 초기화, 인터럽트, 기타 제어 요청 
  시간 초과
* `ProcessExitError`: CLI가 0이 아닌 값으로 종료되었습니다.
* `AbortError`: 제어 요청 또는 세션이 취소되었습니다.

## 문제 해결

SDK가 CLI를 시작할 수 없는 경우:

* 확인하다`qwen --version`대상 환경에서 작동
* 통과하다`path_to_qwen_executable`쉘이 사용하는 경우`nvm`,`pyenv`, 또는 기타
  비표준 PATH 설정
* 사용`debug=True`또는`stderr=print`디버깅하는 동안 CLI 표준 오류를 표시하려면

세션 제어 호출 시간이 초과된 경우:

* 대상이 맞는지 확인하세요`qwen`버전 지원`--input-format stream-json`
* 증가하다`timeout.control_request`
* stdout/stderr을 삼키는 래퍼 스크립트가 없는지 확인하세요.

## 저장소 통합

저장소 수준 도우미 명령:

* `npm run test:sdk:python`
* `npm run lint:sdk:python`
* `npm run typecheck:sdk:python`
* `npm run smoke:sdk:python -- --qwen qwen`

## 실제 E2E 연기

실제 런타임 확인을 위해(실제`qwen`프로세스 + 실제 모델 호출), 다음에서 실행
저장소 루트. npm 도우미는 다음을 사용합니다.`python3`이므로 다음과 같이 해결되는지 확인하세요.
파이썬`>=3.10`통역사:

```bash
npm run smoke:sdk:python -- --qwen qwen
```

이 스크립트는 다음과 같이 실행됩니다.

* 비동기 단일 회전 쿼리
* 비동기 제어 흐름(`supported_commands`, 권한 모드 업데이트)
* 동조`query_sync`질문

JSON을 인쇄하고 실패 시 0이 아닌 값을 반환합니다.
