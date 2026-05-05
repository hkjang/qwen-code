# 듀얼 출력

듀얼 출력은 대화형 TUI를 위한 사이드카 모드입니다. Qwen Code는 
정상적으로 렌더링`stdout`, 구조화된 JSON 이벤트를 동시에 내보냅니다. 
별도의 채널로 스트리밍하여 외부 프로그램(IDE 확장, 웹) 
프론트엔드, CI 파이프라인, 자동화 스크립트 — 관찰하고 조종할 수 있습니다. 
세션.

또한 역방향 채널도 제공합니다. 외부 프로그램이 JSONL을 작성할 수 있습니다. 
TUI가 감시하는 파일에 명령을 저장하여 프롬프트를 제출하고 
사람이 키보드 앞에 있는 것처럼 도구 권한 요청에 응답합니다.

듀얼 출력은 완전히 선택 사항입니다. 아래 플래그가 없으면 TUI가 작동합니다. 
추가 I/O나 동작 변경 없이 이전과 동일합니다.

## 사용 사례

이중 출력은 낮은 수준의 배관 기본 요소입니다. 이는 구체적인 통합입니다. 
잠금이 해제됩니다:

### 터미널 + 채팅 듀얼 모드 실시간 동기화

주력 사용 사례. 웹 또는 데스크톱 ChatUI는 PTY 내부에 TUI를 호스팅합니다. 
구조화된 이벤트에 의해 구동되는 병렬 대화 보기를 렌더링합니다. 
스트림:

* 사용자는 TUI(터미널 기본 고급 사용자용) 중 하나에 입력할 수 있습니다. 
  또는 웹 UI(더 풍부한 UX, 공유 가능한 링크, 모바일용). 두 가지 견해가 모두 유지됩니다. 
  모든 메시지가 동일한 JSON 이벤트를 통해 흐르기 때문에 동기화됩니다.
* 도구 승인 프롬프트는 두 위치 모두에 나타납니다. 먼저 승인하는 사람이 승리합니다.
* 세션 기록은 다음에서 그대로 캡처됩니다.`--json-file`, 그래서 서버 
  side에는 ANSI를 구문 분석하지 않고 기계가 읽을 수 있는 정식 기록이 있습니다.

### IDE 확장(VS Code / JetBrains / Cursor / Neovim)

IDE 내부에 Qwen 코드를 삽입합니다. TUI는 편집기의 통합에서 실행됩니다. 
확장 프로그램이 소비하는 동안 원하는 사용자를 위한 터미널 패널`--json-fd` / `--json-file`추진할 이벤트:

* 에이전트가 파일을 터치하면 인라인 diff 오버레이가 표시됩니다.
* 형식화된 마크다운, 구문 강조 도구가 포함된 Webview 측면 패널 
  전화 및 클릭 가능한 인용.
* 상태 표시줄 표시기(생각 중/응답/승인 대기 중)
* 프로그래밍 방식`confirmation_response`사용자가 클릭할 때 씁니다. 
  기본 IDE 승인 버튼.

### 브라우저 기반 Chat 프런트엔드

Node/Bun 서버는 렌더링 의미를 위해 PTY에서 TUI를 생성하지만 
WebSocket 채널을 브라우저에 노출합니다. 이벤트`--json-file`이다 
클라이언트에게 전달; 브라우저에 입력된 사용자 메시지가 삽입됩니다. 
통해`--input-file`. 양쪽 모두 ANSI 구문 분석이 없습니다.

### CI/자동화 관찰자

CI 작업은 작업 프롬프트와 함께 Qwen Code를 실행합니다. 인간은 TUI를 
작업 기록; CI 시스템 꼬리`--json-file`에게:

* 다음과 같은 경우 작업이 실패합니다.`result`이벤트에서 오류를 보고합니다.
* 푸시`token usage` / `duration_ms` / `tool_use`측정항목으로 계산됩니다.
* 전체 기록을 빌드 아티팩트로 보관합니다.

### 다중 에이전트 오케스트레이션

감독자 에이전트는 각각 고유한 쌍을 가진 여러 TUI 작업자를 생성합니다. 
이벤트/입력 파일. 진행 상황을 관찰하고 후속 프롬프트를 삽입하며 
도구를 승인하거나 거부하여 글로벌 예산/안전 정책을 시행합니다. 
모든 작업자에게 전화를 겁니다.

### 세션 녹화, 감사 및 재생

모든 TUI 세션을 다음을 사용하여 일반 파일로 보냅니다.`--json-file`. 나중에:

* 규정 준수 감사는 실행된 내용을 정확하게 재구성할 수 있습니다.
* 자동화된 회귀 테스트는 여러 모델 버전의 실행을 비교할 수 있습니다.
* 재생 도구는 동일한 프로토콜을 통해 이벤트를 다시 내보내 피드할 수 있습니다. 
  시각화 대시보드.

### 관찰 가능성 대시보드

개울`--json-file`Loki / OTEL / JSONL을 허용하는 모든 파이프라인에. 
발췌`usage.input_tokens`,`tool_use.name`,`result.duration_api_ms`Grafana의 일류 측정항목으로 사용됩니다. 로그 구문 분석 정규식이 필요하지 않습니다.

### 테스트 및 QA

통합 테스트는 Qwen 코드를 헤드리스로 생성하고`--input-file`스크립트 및 어설션`--json-file`이벤트. stdout ANSI를 구문 분석하는 것과는 달리, 
어설션은 UI 리팩터링 전반에 걸쳐 안정적입니다.

## 플래그

| 깃발                    | 유형          | 목적                                                                           |
| --------------------- | ----------- | ---------------------------------------------------------------------------- |
| `--json-fd <n>`       | 숫자,`n >= 3` | 파일 설명자에 구조화된 JSON 이벤트 쓰기`n`. 호출자는 스폰을 통해 이 fd를 제공해야 합니다.`stdio`구성 또는 쉘 리디렉션. |
| `--json-file <path>`  | 길           | 구조화된 JSON 이벤트를 파일에 작성합니다. 경로는 일반 파일, FIFO(명명된 파이프) 또는`/dev/fd/N`.            |
| `--input-file <path>` | 길           | 외부 프로그램에서 작성된 JSONL 명령은 이 파일을 확인하세요.                                         |

`--json-fd`그리고`--json-file`상호 배타적입니다. fds 0, 1, 2는 
TUI 자체 출력 손상을 방지하기 위해 거부되었습니다.

## 왜 출력 플래그가 두 개인가요? (`--json-fd`대`--json-file`)

언뜻보기에`--json-fd`충분해 보입니다. 호출자가 Qwen 코드를 생성합니다. 
추가 파일 설명자를 사용하면 TUI가 이벤트를 기록합니다. 에서 
연습, fd 전달은 가장 중요한 임베딩에서 분해됩니다. 
시나리오: PTY(의사 터미널) 내에서 TUI를 실행합니다. 그렇기 때문에 
이 기능은 경로 기반 대안도 제공합니다.

### 언제`--json-fd`공장

순수한`child_process.spawn`와`stdio`정렬:

```ts
const child = spawn('qwen', ['--json-fd', '3'], {
  stdio: ['inherit', 'inherit', 'inherit', eventsFd],
});
```

노드의 생성은 임의 지원`stdio`항목; fd 3은 다음에 의해 상속됩니다. 
직접 쓸 수 있는 아이입니다. 제로 복사, 제로 버퍼, 제로 
파일 시스템 — 가장 빠른 경로.

### 왜`--json-fd`하다**\~ 아니다**PTY에서 일하다

PTY 래퍼는 다음과 같습니다.[`node-pty`](https://github.com/microsoft/node-pty)그리고[`bun-pty`](https://github.com/oven-sh/bun)정말 심각한 삽입자입니까? 
(IDE 확장, 웹 터미널, tmux 같은 멀티플렉서)는 
대화형 TUI. 그들은 세 가지 동안 추가 fd를 아이에게 전달할 수 없습니다. 
강화 이유:

1. **API 표면.** `node-pty.spawn(file, args, options)`받아들인다`cwd`,`env`,`cols`,`rows`,`encoding`등 — 하지만**아니요`stdio`정렬**. 거기 
   단순히 API에서 "이 fd를 fd 3으로 첨부할 수도 있습니다"라고 말할 수 있는 위치는 없습니다. 
   그 아이."`bun-pty`같은 모양을 드러냅니다.
2. **`forkpty(3)`의미론.**내부적으로 PTY 래퍼 호출`forkpty(3)`(또는 이에 상응하는`posix_openpt`+`login_tty`춤). 
   해당 syscall은 마스터/슬레이브 의사 터미널 쌍을 할당하고 
   자식의 fds 0/1/2를 슬레이브 측으로 리디렉션하므로 자식은 다음과 같이 생각합니다. 
   실제 터미널에 연결되어 있습니다. 상위 항목에서 2보다 큰 모든 fd는 다음과 같습니다. 
   폐쇄된 사람`login_tty`, 호출`close(fd)`\~을 위한`fd >= 3`\~ 전에`exec`. 추가 fd는 상속되지 않고 적극적으로 삭제됩니다.
3. **제어 터미널 부작용.**추가로 fd를 해킹했더라도
   이를 통해 터미널이 아니므로 하위 TUI 렌더러
   (fd 1에 TTY를 가정하여 이스케이프 시퀀스를 작성함)는 여전히
   출력을 위해서는 슬레이브가 필요합니다. 당신은 두 개의 독립적인 결과를 얻게 될 것입니다
   어쨌든 운송.

간단히 말해서, 임베더가 TUI 렌더링을 위해 실제 TTY가 필요한 순간 —
모든 IDE 확장, 모든 웹 터미널, 모든 데스크톱 채팅이 여기에 해당됩니다.
app — fd 상속은 불가능합니다.

### `--json-file`공백을 메운다

파일 경로는 일반 CLI 인수로 전달되므로
스폰 모델:

```ts
import { spawn } from 'node-pty';

const pty = spawn(
  'qwen',
  [
    '--json-file',
    '/tmp/qwen-events.jsonl',
    '--input-file',
    '/tmp/qwen-input.jsonl',
  ],
  { cols: 120, rows: 40 },
);
```

자식은 파일 자체를 열고 거기에 이벤트를 씁니다. 삽입하는 사람
와 같은 길을 따라간다`fs.watch`+ 증분 읽기. 세 가지
참고:

* **일반 파일**, FIFO(명명된 파이프) 또는`/dev/fd/N`모든 일. FIFO는
  양측이 동일한 호스트에 있을 때 레이턴시이 가장 짧은 옵션입니다.
* 브리지는 다음을 사용하여 FIFO를 엽니다.`O_NONBLOCK`그리고 다시 차단 상태로 돌아갑니다
  모드 켜짐`ENXIO`(아직 리더가 없음) PTY 시작이 교착 상태에 빠지는 일이 없습니다.
  소비자를 기다리고 있습니다.
* 다중 세션 격리의 경우 다음의 세션별 경로를 사용하세요.`$XDG_RUNTIME_DIR`또는`mkdtemp`모드가 있는 디렉토리`0700`.

### 어떤 플래그를 사용해야 합니까?

| 임베딩 스타일                            | 사용                  |
| ---------------------------------- | ------------------- |
| `child_process.spawn`일반 스튜디오와 함께   | `--json-fd`         |
| `node-pty` / `bun-pty`/ 모든 PTY 호스트 | `--json-file`       |
| 셸 리디렉션/수동 파이프라인 테스트                | 어느 하나               |
| CI 로그 수집(일반 파일, 종료 후 읽기)           | `--json-file`       |
| 동일한 호스트에서 가능한 최저 대기 시간             | `--json-file`+ FIFO |

일반 규칙:**올바르게 렌더링하기 위해 TUI가 필요한 경우
PTY는 다음이 필요함을 의미합니다.`--json-file`.** `--json-fd`더 간단합니다
TUI 충실도를 고려하지 않는 임베더 — 일반적으로 프로그래밍 방식
어쨌든 stdout을 버리는 래퍼.

## 빠른 시작

세 가지 채널을 모두 활성화한 상태에서 Qwen 코드를 실행합니다.

```bash
mkfifo /tmp/qwen-events.jsonl /tmp/qwen-input.jsonl
qwen \
  --json-file /tmp/qwen-events.jsonl \
  --input-file /tmp/qwen-input.jsonl
```

두 번째 터미널에서 이벤트 스트림을 추적합니다.

```bash
cat /tmp/qwen-events.jsonl
```

세 번째 터미널에서는 실행 중인 TUI에 프롬프트를 푸시합니다.

```bash
echo '{"type":"submit","text":"Explain this repo"}' >> /tmp/qwen-input.jsonl
```

프롬프트는 사용자가 입력한 것과 똑같이 TUI에 표시되며,
스트리밍 응답이 미러링됩니다.`/tmp/qwen-events.jsonl`.

## 출력 이벤트 스키마

이벤트는 JSON 라인(라인당 하나의 객체)으로 생성됩니다. 스키마는 동일합니다.
비대화형에서 사용하는 것`--output-format=stream-json`모드, 와`includePartialMessages`항상 활성화되어 있습니다.

채널의 첫 번째 이벤트는 항상`system` / `session_start`, 방출
다리가 건설되면. 이를 사용하여 채널을
다른 이벤트가 도착하기 전의 세션 ID입니다.

```jsonc
// Session lifecycle
{
  "type": "system",
  "subtype": "session_start",
  "uuid": "...",
  "session_id": "...",
  "data": { "session_id": "...", "cwd": "/path/to/cwd" }
}

// Streaming events for an in-progress assistant turn
{ "type": "stream_event", "event": { "type": "message_start", "message": { ... } }, ... }
{ "type": "stream_event", "event": { "type": "content_block_start", "index": 0, "content_block": { "type": "text" } }, ... }
{ "type": "stream_event", "event": { "type": "content_block_delta", "index": 0, "delta": { "type": "text_delta", "text": "Hello" } }, ... }
{ "type": "stream_event", "event": { "type": "content_block_stop", "index": 0 }, ... }
{ "type": "stream_event", "event": { "type": "message_stop" }, ... }

// Completed messages
{ "type": "user", "message": { "role": "user", "content": [...] }, ... }
{ "type": "assistant", "message": { "role": "assistant", "content": [...], "usage": { ... } }, ... }
{ "type": "user", "message": { "role": "user", "content": [{ "type": "tool_result", ... }] } }

// Permission control plane (only when a tool needs approval)
{
  "type": "control_request",
  "request_id": "...",
  "request": {
    "subtype": "can_use_tool",
    "tool_name": "run_shell_command",
    "tool_use_id": "...",
    "input": { "command": "rm -rf /tmp/x" },
    "permission_suggestions": null,
    "blocked_path": null
  }
}
{
  "type": "control_response",
  "response": {
    "subtype": "success",
    "request_id": "...",
    "response": { "allowed": true }
  }
}
```

`control_response`TUI에서 결정이 내려졌는지 여부가 표시됩니다.
(기본 승인 UI) 또는 외부`confirmation_response`(아래 참조).
어느 쪽이든 모든 관찰자는 최종 결과를 봅니다.

## 입력 명령 스키마

두 가지 명령 모양이 허용됩니다.`--input-file`:

```jsonc
// Submit a user message into the prompt queue
{ "type": "submit", "text": "What does this function do?" }

// Reply to a pending control_request
{ "type": "confirmation_response", "request_id": "...", "allowed": true }
```

행동:

* `submit`명령이 대기열에 추가되었습니다. TUI가 응답 중이면
  다음에 TUI가 유휴 상태로 돌아갈 때 자동으로 다시 시도됩니다.
* `confirmation_response`명령은 즉시 전달되며 결코 전달되지 않습니다.
  도구 호출이 차단되고 응답이 도달해야 하기 때문에 대기 중입니다.
  기본`onConfirm`이전을 기다리지 않고 핸들러`submit`.
* 도구를 먼저 승인하는 쪽이 승리합니다. 상대방의 반응이 늦다
  무해하게 떨어집니다.
* JSON으로 구문 분석하지 못한 줄은 기록되고 건너뜁니다.
  감시자를 멈춰라.

## 레이턴시 참고

입력 파일은 다음과 같이 관찰됩니다.`fs.watchFile`500ms 폴링 간격으로,
원격의 최악의 왕복 대기 시간`submit`반쯤이야
두 번째. 이는 의도적인 것입니다. 폴링은 플랫폼 간에 이식 가능하며
파일 시스템(macOS/네트워크 마운트 포함)이며 일반적인 것과 일치합니다.
Human-In-The-Loop 기능 타겟의 속도를 조정합니다. 출력 채널에는
폴링 — TUI가 이벤트를 내보낼 때 이벤트가 동기적으로 작성됩니다.

## 실패 모드

* **잘못된 fd.**fd가 다음으로 전달된 경우`--json-fd`열려 있지 않거나 다음 중 하나입니다.
  0/1/2, TUI는 경고를 인쇄합니다.`stderr`듀얼 없이 계속
  출력이 활성화되었습니다.
* **나쁜 길.**파일이 전달된 경우`--json-file`열 수 없습니다.
  TUI는 경고를 인쇄하고 이중 출력 없이 계속됩니다.
* **소비자 연결 끊김.**채널 반대편에 독자가 있는 경우
  가버린다(`EPIPE`), 브리지가 자동으로 비활성화되고 TUI가 비활성화됩니다.
  계속 달리고 있습니다. 재시도하지 마세요.
* **어댑터 예외.**이벤트를 내보내는 동안 발생하는 예외는 다음과 같습니다.
  브리지를 포착하고 기록하고 비활성화합니다. TUI는 절대로 충돌하지 않습니다.
  이중 출력 오류.

## 스폰 예시

일반적인 임베딩 상위 프로세스는 두 채널 모두에서 Qwen 코드를 생성합니다.

```ts
import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';

const eventsFd = openSync('/tmp/qwen-events.jsonl', 'w');
const child = spawn(
  'qwen',
  ['--json-fd', '3', '--input-file', '/tmp/qwen-input.jsonl'],
  { stdio: ['inherit', 'inherit', 'inherit', eventsFd] },
);
```

TUI는 여전히 stdio 0/1/2에서 사용자 터미널을 소유하고 있지만 임베더는
fd 3을 지원하는 파일에서 구조화된 이벤트를 읽고 명령을 푸시합니다.
JSONL 줄 추가`/tmp/qwen-input.jsonl`.

## 설정 기반 구성

수명이 긴 임베더의 경우 CLI 플래그를 스레드하는 것이 불편한 경우가 많습니다.
모든 출시를 통해. 동일한 채널을 다음에서 구성할 수 있습니다.`settings.json`최상위 수준에서`dualOutput`열쇠:

```jsonc
// ~/.qwen/settings.json  (user-level)
// or <workspace>/.qwen/settings.json  (workspace-level)
{
  "dualOutput": {
    "jsonFile": "/tmp/qwen-events.jsonl",
    "inputFile": "/tmp/qwen-input.jsonl",
  },
}
```

우선순위 규칙:

* CLI 플래그**승리**설정 이상. 통과`--json-file /foo`에
  명령줄 재정의`dualOutput.jsonFile`설정에서.
* `--json-fd`이에 상응하는 설정이 없습니다. fd 전달은 생성 시간입니다.
  정적으로 선언할 수 없는 문제입니다.
* 플래그나 설정이 없으면 이중 출력은 비활성화된 상태로 유지됩니다.
  (오늘의 기본값과 동일)

그만큼`requiresRestart: true`플래그는 변경 사항이 다음에 대해서만 적용됨을 의미합니다.
다음 Qwen Code 출시(다리가 한 번 건설되었기 때문에)
시작.

## 실행 가능한 데모

아래의 모든 스크립트는 복사-붙여넣기가 가능합니다. POC 1로 시작하여 확인
빌드에는 이중 출력이 있습니다. POC 4는 실제와 가장 가까운 아날로그입니다.
IDE 확장 통합.

### POC 1 — 이벤트 스트림 관찰

사람이 TUI를 사용하는 동안 TUI에서 발생하는 모든 구조적 이벤트를 시청하세요.
일반적으로:

```bash
# Terminal A
mkfifo /tmp/qwen-events.jsonl
cat /tmp/qwen-events.jsonl | jq -c 'select(.type != "stream_event") | {type, subtype}'

# Terminal B
qwen --json-file /tmp/qwen-events.jsonl
# ...then chat normally; terminal A shows session_start,
# user/assistant/result/control_request lifecycle in real time.
```

터미널 A에서 예상되는 첫 번째 줄:

```json
{ "type": "system", "subtype": "session_start" }
```

### POC 2 — 외부에서 프롬프트 삽입

키보드를 건드리지 않고 두 번째 터미널에서 TUI를 구동합니다.
첫 번째:

```bash
# Terminal A
touch /tmp/qwen-in.jsonl
qwen --input-file /tmp/qwen-in.jsonl

# Terminal B — the TUI responds as if you typed it
echo '{"type":"submit","text":"list files in the current directory"}' \
  >> /tmp/qwen-in.jsonl
```

### POC 3 — 원격 도구 권한 브리지

별도의 프로세스에서 도구 호출을 승인하거나 거부합니다.

```bash
# Terminal A — observe control_requests
mkfifo /tmp/qwen-out.jsonl
touch /tmp/qwen-in.jsonl
(cat /tmp/qwen-out.jsonl \
  | jq -c 'select(.type == "control_request")') &

# Terminal B
qwen --json-file /tmp/qwen-out.jsonl --input-file /tmp/qwen-in.jsonl
# Ask Qwen to do something that needs approval, e.g.
# "run `ls -la /tmp`". A control_request will appear in terminal A.
# Copy the request_id, then in a third terminal:
echo '{"type":"confirmation_response","request_id":"<paste-id>","allowed":true}' \
  >> /tmp/qwen-in.jsonl
# The TUI confirmation prompt dismisses and the tool executes.
```

알 수 없는 답변을 했다면`request_id`, 브리지는`control_response`\~와 함께`subtype: "error"`출력 채널에서
소비자는 이를 기록하거나 재시도할 수 있습니다.

```json
{
  "type": "control_response",
  "response": {
    "subtype": "error",
    "request_id": "...",
    "error": "unknown request_id (already resolved, cancelled, or never issued)"
  }
}
```

### POC 4 - 노드 임베더(IDE와 유사)

가장 현실적인 모양: 상위 프로세스가 Qwen 코드, 꼬리를 생성합니다.
이벤트를 실행하고 자체 일정에 따라 프롬프트를 삽입합니다.

```ts
// demo-embedder.ts
import { spawn } from 'node:child_process';
import { appendFileSync, createReadStream, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const events = join(tmpdir(), `qwen-events-${process.pid}.jsonl`);
const input = join(tmpdir(), `qwen-input-${process.pid}.jsonl`);
writeFileSync(events, '');
writeFileSync(input, '');

const child = spawn('qwen', ['--json-file', events, '--input-file', input], {
  stdio: 'inherit',
});

// Tail the output channel. In production you'd use a proper
// byte-offset tail; this one re-streams from 0 for brevity.
const rl = createInterface({
  input: createReadStream(events, { encoding: 'utf8' }),
});
rl.on('line', (line) => {
  if (!line.trim()) return;
  const ev = JSON.parse(line);
  if (ev.type === 'system' && ev.subtype === 'session_start') {
    console.log('[embedder] handshake:', {
      protocol_version: ev.data.protocol_version,
      version: ev.data.version,
      supported_events: ev.data.supported_events,
    });
    // Feature-detect before using a capability
    if (ev.data.supported_events.includes('control_request')) {
      console.log('[embedder] permission control-plane available');
    }
  }
  if (ev.type === 'assistant') {
    console.log(
      '[embedder] assistant turn ended, tokens =',
      ev.message.usage?.output_tokens,
    );
  }
  if (ev.type === 'system' && ev.subtype === 'session_end') {
    console.log('[embedder] session ended cleanly');
  }
});

// After 2s, inject a prompt as if the user typed it
setTimeout(() => {
  appendFileSync(
    input,
    JSON.stringify({ type: 'submit', text: 'hello from embedder' }) + '\n',
  );
}, 2000);

child.on('exit', () => process.exit(0));
```

다음으로 실행:

```bash
npx tsx demo-embedder.ts
# Qwen Code TUI opens in the current terminal; the embedder logs
# handshake + turn-end + session_end events to the parent's stdout.
```

### POC 5 — 기능 핸드셰이크 기능 감지

이전 Qwen 코드 버전은 방출되지 않습니다.`protocol_version`. 필드를 다루다
선택 사항 및 기능 감지:

```ts
rl.on('line', (line) => {
  const ev = JSON.parse(line);
  if (ev.type === 'system' && ev.subtype === 'session_start') {
    const v = ev.data?.protocol_version ?? 0;
    if (v < 1) {
      console.error(
        'qwen-code dual output is present but protocol < 1; ' +
          'falling back to best-effort behavior',
      );
    } else {
      console.log('qwen-code dual output protocol v' + v);
    }
  }
});
```

### POC 6 — 깨끗한 종료 신호로서의 session\_end

```ts
rl.on('line', (line) => {
  const ev = JSON.parse(line);
  if (ev.type === 'system' && ev.subtype === 'session_end') {
    console.log('[embedder] clean shutdown, session', ev.data.session_id);
    // Flush metrics, close WebSockets, etc.
  }
});
```

이전에 TUI가 충돌한 경우`session_end`, 출력 스트림이 닫힙니다.
(`EPIPE`다음 쓰기에); 임베더는 두 경로를 모두 처리해야 합니다.

### POC 7 — 실패 훈련(플래그가 TUI를 위반하지 않음을 증명)

```bash
qwen --json-fd 1
# stderr: "Warning: dual output disabled — ..."
# TUI still launches normally.

qwen --json-fd 9999
# stderr: "Warning: dual output disabled — fd 9999 not open"
# TUI still launches normally.

qwen --json-fd 3 --json-file /tmp/x.jsonl
# yargs rejects: "--json-fd and --json-file are mutually exclusive."
# Process exits before TUI starts.

qwen --json-file /nonexistent/dir/x.jsonl
# stderr warning; TUI still launches.
```

## 클로드 코드와의 관계

Claude Code는 다음과 유사한 stream-json 이벤트 형식을 노출합니다.`--print --output-format stream-json`, 그러나 비대화형 모드에서만 가능
— TUI 및 구조화된 사이드카를 실행하는 것과 동일하지 않습니다.
동시에 채널을 운영하세요. 듀얼 출력이 그 격차를 메워줍니다.
