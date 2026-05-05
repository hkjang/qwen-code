# 채널 플러그인 개발자 가이드

채널 플러그인은 Qwen Code를 메시징 플랫폼에 연결합니다. 으로 포장되어 있어요[확대](../users/extension/introduction)시작 시 로드됩니다. 플러그인 설치 및 구성에 대한 사용자용 문서는 다음을 참조하세요.[플러그인](../users/features/channels/plugins).

## 서로 어울리는 방법

플러그인은 플랫폼 어댑터 계층에 있습니다. 플랫폼별 문제(연결, 메시지 수신, 응답 전송)를 처리합니다.`ChannelBase`다른 모든 것(액세스 제어, 세션 라우팅, 프롬프트 대기열, 슬래시 명령, 충돌 복구)을 처리합니다.

```
Your Plugin  →  builds Envelope  →  handleInbound()
ChannelBase  →  gates → commands → routing → AcpBridge.prompt()
ChannelBase  →  calls your sendMessage() with the agent's response
```

## 플러그인 객체

확장 진입점은`plugin`에 부합하는`ChannelPlugin`:

```typescript
import type { ChannelPlugin } from '@qwen-code/channel-base';
import { MyChannel } from './MyChannel.js';

export const plugin: ChannelPlugin = {
  channelType: 'my-platform', // Unique ID, used in settings.json "type" field
  displayName: 'My Platform', // Shown in CLI output
  requiredConfigFields: ['apiKey'], // Validated at startup (beyond standard ChannelConfig)
  createChannel: (name, config, bridge, options) =>
    new MyChannel(name, config, bridge, options),
};
```

## 채널 어댑터

연장하다`ChannelBase`세 가지 방법을 구현합니다.

```typescript
import { ChannelBase } from '@qwen-code/channel-base';
import type { Envelope } from '@qwen-code/channel-base';

export class MyChannel extends ChannelBase {
  async connect(): Promise<void> {
    // Connect to your platform, register message handlers
    // When a message arrives:
    const envelope: Envelope = {
      channelName: this.name,
      senderId: '...', // Stable, unique platform user ID
      senderName: '...', // Display name
      chatId: '...', // Chat/conversation ID (distinct for DMs vs groups)
      text: '...', // Message text (strip @mentions)
      isGroup: false, // Accurate — used by GroupGate
      isMentioned: false, // Accurate — used by GroupGate
      isReplyToBot: false, // Accurate — used by GroupGate
    };
    this.handleInbound(envelope);
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    // Format markdown → platform format, chunk if needed, deliver
  }

  disconnect(): void {
    // Clean up connections
  }
}
```

## 봉투

플랫폼 데이터에서 빌드한 정규화된 메시지 개체입니다. 부울 플래그는 게이트 로직을 구동하므로 정확해야 합니다.

| 필드               | 유형    | 필수의 | 메모                                         |
| ---------------- | ----- | --- | ------------------------------------------ |
| `channelName`    | 끈     | 예   | 사용`this.name`                              |
| `senderId`       | 끈     | 예   | 메시지 전체에서 안정적이어야 합니다(세션 라우팅 + 액세스 제어에 사용됨). |
| `senderName`     | 끈     | 예   | 표시 이름                                      |
| `chatId`         | 끈     | 예   | DM과 그룹을 구분해야 합니다.                          |
| `text`           | 끈     | 예   | 스트립 봇 @멘션                                  |
| `threadId`       | 끈     | 아니요 | 을 위한`sessionScope: "thread"`               |
| `messageId`      | 끈     | 아니요 | 플랫폼 메시지 ID - 응답 상관 관계에 유용합니다.              |
| `isGroup`        | 부울    | 예   | GroupGate는 이에 의존합니다.                       |
| `isMentioned`    | 부울    | 예   | GroupGate는 이에 의존합니다.                       |
| `isReplyToBot`   | 부울    | 예   | GroupGate는 이에 의존합니다.                       |
| `referencedText` | 끈     | 아니요 | 인용된 메시지 - 컨텍스트로 추가됨                        |
| `imageBase64`    | 끈     | 아니요 | Base64로 인코딩된 이미지(레거시 — 선호`attachments`)    |
| `imageMimeType`  | 끈     | 아니요 | 예를 들어,`image/jpeg`(레거시 — 선호`attachments`)  |
| `attachments`    | 부착\[] | 아니요 | 구조화된 미디어 첨부 파일(아래 참조)                      |

### 첨부파일

사용`attachments`이미지, 파일, 오디오, 비디오용 배열입니다.`handleInbound()`자동으로 해결: base64를 사용한 이미지`data`비전 입력으로 모델에 전송되며,`filePath`에이전트가 읽을 수 있도록 경로를 프롬프트에 추가하세요.

```typescript
interface Attachment {
  type: 'image' | 'file' | 'audio' | 'video';
  data?: string; // base64-encoded data (images, small files)
  filePath?: string; // absolute path to local file (large files saved to disk)
  mimeType: string; // e.g. 'application/pdf', 'image/jpeg'
  fileName?: string; // original file name from the platform
}
```

예 — 어댑터에서 파일 업로드 처리:

```typescript
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const buf = await downloadFromPlatform(fileId);
const dir = join(tmpdir(), 'channel-files');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
const filePath = join(dir, fileName);
writeFileSync(filePath, buf);

envelope.attachments = [
  {
    type: 'file',
    filePath,
    mimeType: 'application/pdf',
    fileName,
  },
];
```

유산`imageBase64`/`imageMimeType`필드는 여전히 이전 버전과의 호환성을 위해 작동하지만`attachments`새로운 코드에 선호됩니다.

## 확장 매니페스트

당신의`qwen-extension.json`채널 유형을 선언합니다. 키가 일치해야 합니다.`channelType`플러그인 개체에서:

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

## 선택적 확장 지점

**사용자 정의 슬래시 명령**— 생성자에 등록하십시오.

```typescript
this.registerCommand('mycommand', async (envelope, args) => {
  await this.sendMessage(envelope.chatId, 'Response');
  return true; // handled, don't forward to agent
});
```

**작업 표시기**— 재정의`onPromptStart()`그리고`onPromptEnd()`플랫폼별 입력 표시기를 표시합니다. 이러한 후크는 프롬프트가 실제로 처리를 시작할 때만 실행되며 버퍼링된 메시지(수집 모드) 또는 제한/차단된 메시지에는 실행되지 않습니다.

```typescript
protected override onPromptStart(chatId: string, sessionId: string, messageId?: string): void {
  this.platformClient.sendTyping(chatId); // your platform API
}

protected override onPromptEnd(chatId: string, sessionId: string, messageId?: string): void {
  this.platformClient.stopTyping(chatId);
}
```

**도구 호출 후크**— 재정의`onToolCall()`에이전트 활동을 표시합니다(예: "셸 명령 실행 중...").

**스트리밍 후크**— 재정의`onResponseChunk(chatId, chunk, sessionId)`청크별 점진적 표시(예: 메시지를 내부에서 편집) 보수`onResponseComplete(chatId, fullText, sessionId)`최종 배송을 맞춤화합니다.

**스트리밍 차단**- 세트`blockStreaming: "on"`채널 구성에서 기본 클래스는 자동으로 단락 경계에서 응답을 여러 메시지로 분할합니다. 플러그인 코드가 필요하지 않습니다. 함께 작동합니다.`onResponseChunk`.

**메디아**— 채우기`envelope.attachments`이미지/파일로. 보다[첨부파일](#attachments)위에.

## 참조 구현

* **플러그인 예시**(`packages/channels/plugin-example/`) — 최소한의 WebSocket 기반 어댑터, 좋은 시작점
* **전보**(`packages/channels/telegram/`) — 모든 기능을 갖추고 있습니다: 이미지, 파일, 서식, 입력 표시기
* **딩톡**(`packages/channels/dingtalk/`) — 서식 있는 텍스트를 처리하는 스트림 기반
