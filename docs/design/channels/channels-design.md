# 채널 디자인 (Channels Design)

> Qwen Code를 위한 외부 메시징 연동 기능 — Telegram, WeChat 등의 플랫폼에서 에이전트와 상호 작용합니다.
>
> 사용자 문서:[채널 개요 (Channels 개요)](../../users/features/channels/overview.md).

## 개요 (개요)

\*\*채널(channel)\*\*은 외부 메시징 플랫폼을 Qwen Code 에이전트에 연결합니다.`settings.json`에서 설정하며,`qwen channel`하위 명령어로 관리하고 다중 사용자를 지원합니다 (각 사용자는 독립된 ACP 세션을 얻습니다).

## 아키텍처 (Architecture)

```
┌──────────┐                        ┌─────────────────────────────────────┐
│ Telegram │    Platform API        │        Channel Service              │
│ User A   │◄──────────────────────►│                                     │
├──────────┤  (WebSocket/polling)   │  ┌───────────┐    ┌──────────────┐  │
│ WeChat   │◄──────────────────────►│  │ Platform   │    │  ACP Bridge  │  │
│ User B   │                        │  │ Adapter    │    │  (shared)    │  │
└──────────┘                        │  │            │    │              │  │
                                    │  │ - connect  │    │  - spawns    │  │
                                    │  │ - receive  │    │    qwen-code │  │
                                    │  │ - send     │    │  - manages   │  │
                                    │  │            │    │    sessions  │  │
                                    │  └─────┬──────┘    └──────┬───────┘  │
                                    │        │                  │          │
                                    │        ▼                  ▼          │
                                    │  ┌─────────────────────────────────┐ │
                                    │  │  SenderGate · GroupGate         │ │
                                    │  │  SessionRouter · ChannelBase    │ │
                                    │  └─────────────────────────────────┘ │
                                    └─────────────────────────────────────┘
                                                     │
                                                     │ stdio (ACP ndjson)
                                                     ▼
                                    ┌─────────────────────────────────────┐
                                    │        qwen-code --acp              │
                                    │   Session A (user alice, id: "abc") │
                                    │   Session B (user bob,   id: "def") │
                                    └─────────────────────────────────────┘
```

**플랫폼 어댑터 (Platform Adapter)**— 외부 API에 연결하고, 메시지를 Envelope 형식으로 변환합니다.**ACP 브릿지 (ACP Bridge)**—`qwen-code --acp`를 실행하고, 세션을 관리하며,`textChunk`/`toolCall`/`disconnected`이벤트를 발생시킵니다.**세션 라우터 (Session Router)**— 발신자를 네임스페이스 키(`<channel>:<sender>`)를 통해 ACP 세션에 매핑합니다.**발신자 게이트 (Sender Gate) / 그룹 게이트 (Group Gate)**— 접근 제어 (allowlist / pairing / open) 및 멘션 기반 접근 관리를 담당합니다.**채널 베이스 (Channel Base)**— 템플릿 메서드 패턴이 적용된 추상 기본 클래스로, 플러그인들은`connect`,`sendMessage`,`disconnect`를 오버라이드합니다.**채널 레지스트리 (Channel Registry)**— 충돌 감지 기능이 있는`Map<string, ChannelPlugin>`입니다.

### 인벨로프 (Envelope)

모든 플랫폼이 변환되는 표준화된 메시지 형식입니다:

* **아이디(ID)**:`senderId`,`senderName`,`chatId`,`channelName`
* **내용 (Content)**:`text`, 선택적`imageBase64`/`imageMimeType`, 선택적`referencedText`
* **컨텍스트 (Context)**:`isGroup`,`isMentioned`,`isReplyToBot`, 선택적`threadId`

플러그인 책임:`senderId`는 안정적이고 고유해야 합니다;`chatId`는 DM과 그룹을 구별해야 합니다; 게이트 로직을 위해 불리언 플래그가 정확해야 합니다;`text`에서 @멘션은 제거되어야 합니다.

### 메시지 흐름 (Message Flow)

```
수신: 사용자 메시지 → Adapter → GroupGate → SenderGate → 슬래시 명령어 → SessionRouter → AcpBridge → 에이전트
발신: 에이전트 응답 → AcpBridge → SessionRouter → Adapter → 사용자
```

슬래시 명령어(`/clear`,`/help`,`/status`)는 에이전트에 도달하기 전에 ChannelBase에서 처리됩니다.

### 세션 (Sessions)

하나의`qwen-code --acp`프로세스가 여러 ACP 세션을 관리합니다. 채널별 범위(Scope):**`user`**(기본값),**`thread`**, 또는**`single`**. 라우팅 키는`<channelName>:<key>`로 네임스페이스가 지정됩니다.

### 에러 처리 (Error Handling)

* **연결 실패 (Connection failures)**— 로그 기록됨; 하나 이상의 채널이 연결되면 서비스가 계속 실행됩니다.
* **브릿지 충돌 (Bridge crashes)**— 지수 백오프 (최대 3회 재시도), 모든 채널에서`setBridge()`호출, 세션 복구.
* **세션 직렬화 (Session serialization)**— 세션별 프라미스(promise) 체인을 통해 동시 프롬프트 충돌을 방지합니다.

## 플러그인 시스템 (Plugin System)

아키텍처는 확장 가능하도록 설계되었습니다 — 새로운 어댑터(서드파티 포함)를 코어 수정 없이 추가할 수 있습니다. 내장 채널들도 동일한 플러그인 인터페이스를 사용합니다 (개밥먹기, dogfooding).

### 플러그인 계약 (Plugin Contract)

`ChannelPlugin`은`channelType`,`displayName`,`requiredConfigFields`및`createChannel()`팩토리를 선언합니다. 플러그인은 세 가지 메서드를 구현합니다:

| 메서드                         | 책임                        |
| --------------------------- | ------------------------- |
| `connect()`                 | 플랫폼에 연결하고 메시지 핸들러를 등록합니다. |
| `sendMessage(chatId, text)` | 에이전트 응답을 포맷팅하고 전달합니다.     |
| `disconnect()`              | 종료 시 리소스를 정리합니다.          |

수신 메시지의 경우 플러그인은`Envelope`을 만들고`this.handleInbound(envelope)`를 호출합니다 — 기본 클래스가 나머지 작업인 접근 제어, 그룹 게이팅, 페어링, 세션 라우팅, 프롬프트 직렬화, 슬래시 명령어, 지시어 주입, 답장 컨텍스트 및 충돌 복구를 처리합니다.

### 확장 포인트 (Extension Points)

* `registerCommand()`를 통한 커스텀 슬래시 명령어.
* `handleInbound()`를 타이핑/반응 표시로 래핑하여 작업 중임을 표시(Working indicators).
* `onToolCall()`을 통한 도구 호출 훅(hooks).
* `handleInbound()`전에 Envelope에 미디어를 첨부하여 미디어 처리.

### 검색 및 로딩 (Discovery & Loading)

외부 플러그인은`ExtensionManager`가 관리하는 \*\*확장(extensions)\*\*이며,`qwen-extension.json`에 선언됩니다:

```json
{
  "name": "my-channel-extension",
  "version": "1.0.0",
  "channels": {
    "my-platform": {
      "entry": "dist/index.js",
      "displayName": "My Platform Channel"
    }
  }
}
```

`qwen channel start`시 로딩 순서: 설정 로드 → 내장 모듈 등록 → 확장 스캔 → 동적 임포트 + 검증 → 등록 (충돌 거부) → 설정 검증 →`createChannel()`→`connect()`.

플러그인은 샌드박스 없이(in-process) 실행되며 npm 의존성과 동일한 신뢰 모델을 갖습니다.

## 설정 (설정)

```jsonc
{
  "channels": {
    "my-telegram": {
      "type": "telegram",
      "token": "$TELEGRAM_BOT_TOKEN", // 환경 변수 참조
      "senderPolicy": "allowlist", // allowlist | pairing | open
      "allowedUsers": ["123456"],
      "sessionScope": "user", // user | thread | single
      "cwd": "/path/to/project",
      "model": "qwen3.5-plus",
      "instructions": "응답을 짧게 유지하세요.",
      "groupPolicy": "disabled", // disabled | allowlist | open
      "groups": { "*": { "requireMention": true } },
    },
  },
}
```

인증 방식은 플러그인에 따라 다릅니다: 정적 토큰(Telegram), 앱 자격 증명(DingTalk), QR 코드 로그인(WeChat), 프록시 토큰(TMCP).

## CLI 명령어 (CLI 명령s)

```bash
# 채널 관련
qwen channel start [name]                     # 전체 또는 특정 채널 시작
qwen channel stop                             # 실행 중인 서비스 중지
qwen channel status                           # 채널, 세션, 업타임 상태 표시
qwen channel pairing list <ch>                # 대기 중인 페어링 요청
qwen channel pairing approve <ch> <code>      # 요청 승인

# 확장 관련
qwen extensions install <path-or-package>     # 설치
qwen extensions link <local-path>             # 개발용 심볼릭 링크 생성
qwen extensions list                          # 설치된 확장 목록 표시
qwen extensions remove <name>                 # 삭제(제거)
```

## 패키지 구조 (Package Structure)

```
packages/channels/
├── base/                    # @qwen-code/channel-base
│   └── src/
│       ├── AcpBridge.ts     # ACP 프로세스 수명 주기, 세션 관리
│       ├── SessionRouter.ts # 발신자 ↔ 세션 매핑, 지속성
│       ├── SenderGate.ts    # allowlist / pairing / open
│       ├── GroupGate.ts     # 그룹 채팅 정책 + 멘션 게이팅
│       ├── PairingStore.ts  # 페어링 코드 생성 + 승인
│       ├── ChannelBase.ts   # 추상 기본 클래스: 라우팅, 슬래시 명령어
│       └── types.ts         # Envelope, ChannelConfig 등
├── telegram/                # @qwen-code/channel-telegram
├── weixin/                  # @qwen-code/channel-weixin
└── dingtalk/                # @qwen-code/channel-dingtalk
```

## 향후 작업 (Future Work)

### 안정성 및 그룹 채팅 (Safety & Group Chat)

* **그룹별 도구 제한 (Per-group tool restrictions)**— 그룹별`tools`/`toolsBySender`거부/허용 목록
* **그룹 컨텍스트 기록 (Group context history)**— 최근 건너뛴 메시지의 링 버퍼(ring buffer), @멘션 시 앞에 추가됨
* **정규식 멘션 패턴 (Regex mention patterns)**— 신뢰할 수 없는 @멘션 메타데이터를 위한 대체(fallback)`mentionPatterns`
* **그룹별 지시어 (Per-group instructions)**— 그룹별 페르소나를 위한`GroupConfig`의`instructions`필드
* **`/activation`명령어**— 런타임에 디스크에 저장되는`requireMention`토글

### 운영 도구 (Operational Tooling)

* **`qwen channel doctor`**— 설정 검증, 환경 변수, 봇 토큰, 네트워크 상태 점검
* **`qwen channel status --probe`**— 채널별 실제 연결 확인

### 플랫폼 확장 (Platform Expansion)

* **불화**— Bot API + Gateway, 서버/채널/DM/스레드 지원
* **느슨하게**— Bolt SDK, Socket Mode, 워크스페이스/채널/DM/스레드 지원

### 다중 에이전트 (Multi-Agent)

* **다중 에이전트 라우팅 (Multi-agent routing)**— 채널/그룹/사용자별로 바인딩이 있는 여러 에이전트 지원
* **브로드캐스트 그룹 (Broadcast groups)**— 동일한 메시지에 대해 여러 에이전트가 응답

### 플러그인 생태계 (Plugin Ecosystem)

* **커뮤니티 플러그인 템플릿 (Community plugin template)**—`create-qwen-channel`스캐폴딩 도구
* **플러그인 레지스트리/검색 (Plugin registry/discovery)**—`qwen extensions search`, 버전 호환성 확인
