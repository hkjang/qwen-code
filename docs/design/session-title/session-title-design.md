# 세션 타이틀 디자인

> 이후 빠른 모델에 의해 생성된 3-7 단어 문장-케이스 세션 제목
> 첫 번째 어시스턴트 턴. JSONL 세션에서 지속됨`titleSource: 'auto' | 'manual'`세션 선택기에 표시되는 태그,
> 다음을 통해 요청 시 재생성 가능`/rename --auto`.

## 개요

`/rename`(#3093) 사용자가 세션에 레이블을 지정하여 세션을 다시 찾을 수 있도록 합니다.
나중에 선택기를 실행하지만 실행하기 전까지 선택기는 첫 번째 사용자를 표시합니다.
프롬프트 — 종종 문장 중간이 잘리거나 프레임 질문을 설명합니다.
세션의 실제 내용이 무엇인지가 아니라. 수동 이름 바꾸기는
대부분의 사용자는 선택적 마찰을 수행하지 않습니다.

목표는 세션 이름을 만드는 것입니다*기본적으로 유용함*:

* **설명**세션이 실제로 성취한 것뿐만 아니라
  오프닝라인. 3-7 단어, 문장 케이스, git-commit-subject 스타일.
* **최선의 노력**: 첫 번째 응답 후 백그라운드에서 실행됩니다. 그렇다면
  실패하면 사용자는 오류를 볼 수 없습니다.
* **사용자에 대한 존중**: 절대 두들겨 패지 마세요`/rename`사용자에게 제목을 붙인다
  동일한 세션의 CLI 탭에서도 의도적으로 선택했습니다.
* **명시적으로 재생성 가능**\~을 통해`/rename --auto`"자동 제목
  낡아졌어요 / 새 것을 원해요' 케이스.

## 트리거

| 방아쇠    | 정황                                                                                                                | 구현                                                       |
| ------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **자동** | 후에`recordAssistantTurn`화재. 기존 제목이 설정되어 있거나, 다른 시도가 진행 중이거나, 한도에 도달했거나, 비대화형이거나, 환경이 비활성화되었거나, 빠른 모델이 없는 경우 건너뜁니다. | `ChatRecordingService.maybeTriggerAutoTitle`— 실행 후 잊어버리기 |
| **수동** | 사용자가 실행`/rename --auto`                                                                                           | `renameCommand.ts`\~을 통해`tryGenerateSessionTitle`        |

두 경로 모두 단일 기능으로 유입됩니다.`tryGenerateSessionTitle(config,
signal)`— 동일한 프롬프트, 스키마, 모델 선택 및
위생. 자동 트리거는 최선의 백그라운드 호출입니다. 는
매뉴얼`/rename --auto`차단하는 사용자 작업은 다음과 같습니다.
실패 시 이유별 오류입니다.

## 건축학

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        packages/core/src/services/                      │
│                                                                         │
│  ┌──────────────────────────┐                                           │
│  │ chatRecordingService.ts  │                                           │
│  │                          │                                           │
│  │  recordAssistantTurn()   │                                           │
│  │     │                    │                                           │
│  │     ↓                    │                                           │
│  │  maybeTriggerAutoTitle() │── 6 guards ──→ IIFE(autoTitleController)  │
│  │     │                    │                       │                   │
│  │     └── resume hydrate   │                       ↓                   │
│  │         via              │          tryGenerateSessionTitle          │
│  │         getSessionTitle- │          (sessionTitle.ts)                │
│  │         Info             │                       │                   │
│  │                          │                       ↓                   │
│  └──────────────────────────┘          BaseLlmClient.generateJson       │
│                                        (fastModel + JSON schema)        │
│                                                       │                 │
│  ┌──────────────────────────┐                         ↓                 │
│  │ sessionService.ts        │         sanitizeTitle + sanity checks     │
│  │                          │                         │                 │
│  │  getSessionTitleInfo()   │◀── cross-process        ↓                 │
│  │      uses                │    re-read             recordCustomTitle  │
│  │  readLastJsonString-     │    before write        (…, 'auto')        │
│  │  FieldsSync              │                                           │
│  │  (sessionStorageUtils)   │                                           │
│  └──────────────────────────┘                                           │
│                                                                         │
│                          ┌─────────────────────┐                        │
│                          │ utils/terminalSafe  │                        │
│                          │ stripTerminalCtrl-  │                        │
│                          │ Sequences           │                        │
│                          └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     packages/cli/src/ui/                                │
│                                                                         │
│  commands/renameCommand.ts     ─── /rename <name>          → manual      │
│                                ─── /rename                 → kebab       │
│                                ─── /rename --auto          → auto       │
│                                ─── /rename -- --literal    → manual     │
│                                ─── /rename --unknown-flag  → error      │
│                                                                         │
│  components/SessionPicker.tsx  ── dims rows where                       │
│                                   session.titleSource === 'auto'        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 파일

| 파일                                                   | 책임                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/core/src/services/sessionTitle.ts`         | 원샷 LLM 통화 + 내역 필터 + 정리. 수출`tryGenerateSessionTitle`.                  |
| `packages/core/src/services/chatRecordingService.ts` | `maybeTriggerAutoTitle`트리거, 가드, 프로세스 간 다시 읽기, 종료 시 중단.                |
| `packages/core/src/services/sessionService.ts`       | `getSessionTitleInfo`공개 접속자;`renameSession`받아들인다`titleSource`.        |
| `packages/core/src/utils/sessionStorageUtils.ts`     | `extractLastJsonStringFields`+`readLastJsonStringFieldsSync`원자 쌍 판독기. |
| `packages/core/src/utils/terminalSafe.ts`            | `stripTerminalControlSequences`문장 케이스와 케밥 경로로 공유됩니다.                  |
| `packages/cli/src/ui/commands/renameCommand.ts`      | `/rename --auto`, 센티넬 파서, 실패 이유 메시지 맵.                                |
| `packages/cli/src/ui/components/SessionPicker.tsx`   | 희미한 스타일링`titleSource === 'auto'`.                                     |

## 프롬프트 디자인

### 시스템 프롬프트

이 단일 통화에 대한 주 상담원의 시스템 프롬프트를 대체하여 모델이
코딩 보조자 역할을 하지 않고 세션에 레이블만 지정하려고 합니다.

아래 글머리 기호는 다음과 1:1에 해당합니다.`TITLE_SYSTEM_PROMPT`:

* 3\~7단어, 문장 케이스(첫 번째 단어와 고유명사만 대문자로 표기)
* 후행 구두점, 마크다운, 따옴표가 없습니다.
* 대화의 주요 언어를 일치시키세요. 중국어, 예산 
  대략 12\~20자 정도입니다.
* 사용자의 실제 목표를 구체적으로 설명하세요. 기능, 버그 또는 이름을 지정하세요. 
  주제 영역. "코드 변경" 또는 "도움말"과 같은 모호한 포괄 문구는 피하세요. 
  요청".
* 좋은 예 4개(영어 3개 + 중국어 1개)와 나쁜 예 4개 
  (너무 모호함 / 너무 길음 / 대소 문자가 잘못됨 / 후행 구두점).
* 단일을 포함하는 JSON 객체만 반환`title`열쇠.

### 구조화된 출력(JSON 스키마)

세션 요약처럼 출력을 태그로 래핑하는 대신 다음을 사용합니다.`BaseLlmClient.generateJson`함수 호출 스키마를 사용하면 다음과 같습니다.

```ts
const TITLE_SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description:
        'A concise sentence-case session title, 3-7 words, no trailing punctuation.',
    },
  },
  required: ['title'],
};
```

자유 텍스트 + 태그 추출이 아닌 함수 호출이 필요한 이유:

1. 공급자 간 안정성 — OpenAI 호환 엔드포인트, Gemini 및 
   Qwen의 기본 도구 호출은 모든 구현 함수 호출을 구현합니다. 태그 파싱 
   텍스트 규칙을 존중하는 모든 모델에 의존합니다.
2. 추론 프리앰블 누출 없음 — 함수 호출 인수가 다시 나타납니다. 
   구조화되어 있으므로 답변 앞의 "생각" 문단이 흘러나오지 않습니다. 
   제목에.
3. 더 간단한 후처리 - 단일`typeof result.title === 'string'`플러스를 확인하세요`sanitizeTitle`모든 현실적인 모델 드리프트를 다룹니다.

모델은 여전히 스키마에서 허용하는 것을 반환할 수 있지만 UX는 
거부(빈 문자열, 공백만 가능, 500자, 마크다운 펜싱, 
제어 문자).`sanitizeTitle`이 모든 것을 처리하고 반환합니다.`''`→ 
서비스 반품`{ok: false, reason: 'empty_result'}`.

### 통화 매개변수

| 매개변수              | 값                       | 이유                                                           |
| ----------------- | ----------------------- | ------------------------------------------------------------ |
| `model`           | `getFastModel()`— 대체 없음 | 메인 모델 토큰의 자동 제목 지정은 침묵하기에는 너무 비쌉니다.                          |
| `schema`          | `TITLE_SCHEMA`          | 힘`{title: string}`; 필터는 전송 계층에서 모양 드리프트를 필터링합니다.             |
| `maxOutputTokens` | `100`                   | 7단어에 스키마 오버헤드를 더하면 충분합니다.                                    |
| `temperature`     | `0.2`                   | 대부분 결정적입니다. 세션 제목은 재생성 전반에 걸쳐 안정성을 누리는 데 도움이 됩니다.            |
| `maxAttempts`     | `1`                     | 제목은 최선을 다한 외관적 메타데이터입니다. 재시도는 사용자에게 표시되는 기본 트래픽 뒤에 대기하게 됩니다. |

기본 모델로 돌아가는 세션 요약과 대조됩니다. 제목 
생성은 자동으로 자주 실행됩니다. 조용히 지출 
사용자 동의 없이 메인 모델 토큰을 사용하는 것은 정말 놀라운 일입니다. 수동`/rename --auto`명시적으로 실패`no_fast_model`오히려 
fallback — 사용자가 의식적으로 빠른 모델을 선택하도록 강요합니다.

## 기록 필터링

`geminiClient.getChat().getHistory()`보고`Content[]`여기에는 다음이 포함됩니다 
도구 호출, 도구 응답(종종 파일 콘텐츠 토큰 10,000개 이상) 및 모델 
생각 부분. 해당 원본을 LLM 제목에 입력하면 레이블이 편향됩니다. 
"인증 모듈에서 grep 호출"과 같은 구현 소음에 대해.

`filterToDialog`만 유지`user` / `model`비어 있지 않은 텍스트가 있는 항목 
그리고 아니`thought` / `thoughtSignature`부분품.`takeRecentDialog`슬라이스 
마지막 20개의 메시지를 확인하고 매달린 모델/도구에서 시작을 거부합니다. 
응답.`flattenToTail`"역할: 텍스트" 줄로 변환하고 
마지막 1000자.

### 1000자 꼬리 조각

다음으로 시작하는 세션`help me debug X`하지만 Y를 리팩토링하는 것으로 피벗합니다. 
Y에 대한 제목이 있어야 합니다. 입구의 헤드 잠금 장치로 제목을 지정해야 합니다. 
프레이밍; 꼬리 부분에 제목을 붙이면 세션이 어떻게 되었는지를 알 수 있습니다.

### UTF-16 대리 처리

`.slice(-1000)`UTF-16 코드 단위 경계에서 높거나 낮은 값이 고아가 될 수 있습니다. 
CJK 보조 문자 또는 이모티콘이 잘리는 경우 대리합니다. 일부 제공업체 
결과적으로 유효하지 않은 UTF-16에 400으로 응답합니다. 
처리하면 아무 이유 없이 시도가 불타버릴 것입니다.`flattenToTail`떨어뜨린다 
주요 고아 낮은 대리자;`sanitizeTitle`고아를 문질러 닦다 
출력 경로의 최대 길이 트림 이후에도 대리됩니다.

## 고집

### 레코드 모양

`CustomTitleRecordPayload`선택적인 성장`titleSource: 'auto' |
'manual'`필드:

```jsonc
{
  "type": "system",
  "subtype": "custom_title",
  "systemPayload": {
    "customTitle": "Debug login button on mobile",
    "titleSource": "auto",
  },
}
```

이 필드는 선택 사항이며, 기존 부재 레코드는 다음과 같이 처리됩니다.`undefined`. `SessionPicker`엄격한 조건에서만 행을 어둡게 합니다.`=== 'auto'`match — 변경 전 사용자`/rename`제목은 자동으로 재분류되지 않습니다. 
모델 추측으로.

### 수분 공급 재개

이력서에는`ChatRecordingService`생성자 호출`sessionService.getSessionTitleInfo(sessionId)`읽기**둘 다**는 
제목과 출처. 소스에 수분을 공급하지 않고,`finalize()`의 
re-append(모든 세션 수명주기 이벤트에서 실행됨)는 다시 작성됩니다. 
모든 재개 주기마다 자동을 수동으로 - 자동으로 희미한 부분 제거 
여유.

### 원자 쌍 읽기

`extractLastJsonStringFields`보고`customTitle`그리고`titleSource`에서**같은 매칭 라인**한 번의 스캔으로. 두 개의 별도`readLastJsonStringFieldSync`다음과 같은 경우 통화가 다른 기록에 남을 수 있습니다. 
이전 라인에는 기본 필드만 있어서 일치하지 않는 쌍이 생성됩니다. 
추출기는 기본 값에 대한 적절한 닫는 따옴표도 필요합니다. 
따라서 충돌로 잘린 후행 기록은 최신 경기 경주에서 승리할 수 없습니다.

### 전체 파일 검사 한도

2단계(tail-window 빠른 경로가 누락된 경우)는 전체 파일을 스트리밍합니다. 
64KB 청크로 구성됩니다. 한도:`MAX_FULL_SCAN_BYTES = 64 MB`그래서 부패한 
다중 GB JSONL은 기본 이벤트 루프에서 세션 선택기를 고정할 수 없습니다. 
선택기의 대기 시간 봉투는 손상 후에도 유지됩니다.

### 심볼릭 링크 방어

다음으로 세션 읽기 열기`O_NOFOLLOW`(일반 읽기 전용으로 돌아갑니다. 
상수가 노출되지 않는 Windows). 심층 방어 
심볼릭 링크가 심어져 있음`~/.qwen/projects/<proj>/chats/`리디렉션할 수 없습니다. 
관련 없는 파일에 대한 메타데이터 읽기입니다.

## 동시성과 엣지 케이스

### 트리거 가드 주문

`maybeTriggerAutoTitle`이 정확한 순서로 6가지 조건을 확인합니다. 
나머지를 단락시켜 값싼 것이 먼저 실행되도록 합니다.

1. `currentCustomTitle`설정 → 건너뛰기. 수동/이전 자동을 덮어쓰지 마십시오.
2. `autoTitleController !== undefined`→ 건너뛰세요. 한 번에 한 번씩 시도합니다.
3. `autoTitleAttempts >= 3`→ 건너뛰세요. 총 폐기물의 한계를 정합니다.
4. `!config.isInteractive()`→ 건너뛰세요. 목이 없는`qwen -p`/ CI는 절대 지출하지 않는다 
   원샷 세션의 빠른 모델 토큰.
5. `autoTitleDisabledByEnv()`→ 건너뛰세요.`QWEN_DISABLE_AUTO_TITLE=1`명시적인 거부.
6. `!config.getFastModel()`→ 건너뛰세요. 빠른 모델 없음 → 작동하지 않음.

### 왜 상한선은 1이 아니라 3인가요?

첫 번째 보조 턴은 사용자가 볼 수 없는 순수한 도구 호출일 수 있습니다. 
텍스트(예: 모델은`grep`).`tryGenerateSessionTitle`보고`{ok: false, reason: 'empty_history'}`그 경우에는. 없이 
재시도 기간이 지나면 전체 세션에서 타이틀을 획득할 기회가 사라집니다. 
사용자가 흥미로운 말을 하기 전에 1번을 설정하세요. 3개의 캡이 포함됩니다. 
여전히 경계 런어웨이 재시도를 하는 동안 일반적인 "첫 번째 회전은 소음입니다" 사례 
지속적으로 실패하는 빠른 모델.

### 크로스 프로세스 수동 이름 바꾸기 경쟁

동일한 세션 파일에 있는 두 개의 CLI 탭이 메모리에서 다를 수 있습니다. 탭 A가 실행됩니다.`/rename foo`그리고 쓴다`titleSource: manual`. 탭 B`ChatRecordingService`자신의 것이있다`currentCustomTitle = undefined`그리고 
순진하게 자동 제목으로 덮어씁니다.

LLM 호출이 해결된 후 IIFE는 다음을 통해 JSONL을 다시 읽습니다.`sessionService.getSessionTitleInfo`. 파일이 표시되면`source: 'manual'`, IIFE는 메모리 내 상태를 보석하고 동기화하므로 
후속 턴에서도 이름 변경을 존중합니다. 비용: 64KB 테일 읽기 1회 
성공적인 세대; 무시할 수 있는.

### 다음 날짜에 전파 중단`finalize()`

`autoTitleController`기내 깃발로도 사용됩니다.`finalize()`(실행 
세션 전환 및 프로세스 종료시) 호출`autoTitleController.abort()`타이틀 레코드를 다시 추가하기 전에. 는 
LLM 소켓이 즉시 취소됩니다. 세션 스위치가 느리게 기다리지 않습니다 
빠른 모델 호출. IIFE의`finally`블록 클리어`autoTitleController`아직 활성 상태인 경우에만 완료하세요. 
비행 중에는 동시에 경주하지 않습니다`recordAssistantTurn`.

### 수동`/rename`비행 중에 착륙하다

IIFE 사이`await`완료하고`recordCustomTitle('auto')`전화를 걸면 사용자는`/rename foo`. IIFE가 다시 확인합니다.`this.currentTitleSource === 'manual'`그리고 보석금. 진행중인 점검 
그리고 프로세스 간 다시 읽기가 모두 실행됩니다. 수동이 두 레이어 모두에서 승리합니다.

## 구성

### 사용자용 손잡이

| 설정 / 환경 변수                  | 기본      | 효과                                                                         |
| --------------------------- | ------- | -------------------------------------------------------------------------- |
| `fastModel`                 | 설정되지 않음 | 자동 제목 지정에 필요합니다. 설정 해제 → 작동하지 않음(메인 모델 대체 없음)                              |
| `QWEN_DISABLE_AUTO_TITLE=1` | 설정되지 않음 | 설정을 해제하지 않고 자동 트리거를 선택 해제합니다.`fastModel`. `/rename --auto`요청에 따라 계속 작동합니다. |

아니요`settings.json`토글 — env var는 사용자가 볼 수 있는 유일한 변수입니다. 
오프 스위치. 근거: 이 기능은 외관상 좋고 저렴합니다. 설정 
토글은 일회성으로 실행될 수 있는 UI 표면을 추가합니다. 
비활성화하려는 소수의 사용자를 위한 env 내보내기.

### 자동이 기본 모델로 돌아가지 않는 이유

자동 제목 지정은 모든 보조 회전 후에 무조건 실행됩니다. 
빠른 모델이 없는 사용자에게 자동으로 기본 모델 토큰이 청구된 경우 
모든 새 세션 제목에 대해 비용 델타는 
월별 청구서가 도착합니다. 조용히 실패하는 것(무작위, 제목 없음, 비용 없음)은 
더 안전한 기본값.`/rename --auto`표면`no_fast_model`로서 
사용자가 원하는 경우 조치 가능한 오류를 설정할 수 있습니다.

## 관찰 가능성

`createDebugLogger('SESSION_TITLE')`방출하다`debugLogger.warn`에서 
생성기의 캐치 블록. 오류는 사용자에게 완전히 투명합니다. 
자동 제목은 보조 기능이며 UI에 포함되지 않습니다.

개발자는`[SESSION_TITLE]`디버그 로그의 태그 
(`~/.qwen/debug/<sessionId>.txt`;`latest.txt`현재에 대한 심볼릭 링크 
세션). 작동하는 종단 간 호출은 로그 출력을 생성하지 않습니다. 실패 
기본 오류 메시지와 함께 하나의 WARN 줄이 표시됩니다.

## 보안 강화

제목 값은 터미널(세션 선택기)에서 그대로 렌더링됩니다. 
AND는 사용자가 읽을 수 있는 JSONL 파일에 유지됩니다. 두 표면 모두 공격입니다. 
손상되거나 즉시 주입된 빠른 모델이 반환되는 경우 도달 가능 
적대적인 텍스트.

| 우려                              | 경비원                                                                                |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| ANSI/OSC-8/CSI 주입               | `stripTerminalControlSequences`JSONL 쓰기 및 선택기 렌더링 전에.                              |
| OSC-8을 통한 클릭 가능한 링크 밀수          | 동일 - ESC 바이트뿐만 아니라 전체 단위로 제거된 OSC 시퀀스입니다.                                          |
| 잘못된 UTF-16 서로게이트                | 문질러서`flattenToTail`(LLM 입력) 및`sanitizeTitle`(최대 길이 트림 후 LLM 출력)                    |
| 사용자 메시지 콘텐츠를 통한 하위 유형 라인 스푸핑    | `lineContains: '"subtype":"custom_title"'`— 리터럴 문구가 포함된 사용자 텍스트는 실제 기록을 숨길 수 없습니다. |
| 세션 읽기 시 Symlink 리디렉션            | `O_NOFOLLOW`(상수가 누락된 Windows에서는 작동하지 않습니다.)                                        |
| 잘린 후행 JSONL 레코드                 | `extractLastJsonStringFields`기록이 최신 경기 경주에서 승리하기 전에 종결 인용문이 필요합니다.                 |
| 선택기를 고정시키는 병리학적 파일 크기           | `MAX_FULL_SCAN_BYTES = 64 MB`2단계 전체 파일 검사에 제한이 적용됩니다.                              |
| 쌍을 이루는 CJK 브래킷 데코레이터(`【Draft】`) | 단일 닫힘 브래킷이 매달리지 않도록 하나의 단위로 벗겨졌습니다.                                                |

## 범위를 벗어남

| 목                          | 왜 안 돼                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| 제목이 오래되면 자동 재생성            | `/rename --auto`명시적인 사용자 트리거 경로입니다. 세션 중간에 제목을 자동으로 바꾸면 사용자가 선택기를 통해 뒤로 스크롤하는 데 혼란을 줄 수 있습니다. |
| WebUI/VSCode 스타일 없음 패리티    | 그 표면은 읽습니다`customTitle`이미 자동 제목이 수동처럼 표시됩니다. 후속 조치를 통해`titleSource`을 통해.                      |
| 자동 생성을 위한 설정 대화 상자 토글      | Env var는 단일 손잡이입니다. 전체 설정 UI는 사용자가 요구할 경우 나중에 쉽게 추가할 수 있습니다.                                  |
| 새 문자열에 대한 i18n 로케일 카탈로그 항목 | 기존과 일치`/rename`문자열은 영어로 넘어갑니다. 저장소 전체 i18n 패스가 범위를 벗어납니다.                                     |
| 레거시 기록을 재분류하기 위한 마이그레이션    | 설계상 역호환: 없음`titleSource`수동으로 처리됩니다. 오래된 레코드를 다시 작성하면 사용자 의도를 잃을 위험이 있습니다.                     |
| 비대화형 자동 제목 지정              | `qwen -p`/ CI 스크립트는 세션을 버립니다. 아무도 재개하지 않을 타이틀에 대한 빠른 모델 토큰은 순수한 낭비입니다.                        |
