# 채널

채널을 사용하면 터미널 대신 Telegram, WeChat 또는 DingTalk와 같은 메시징 플랫폼에서 Qwen Code 에이전트와 상호 작용할 수 있습니다. 전화나 데스크톱 채팅 앱에서 메시지를 보내면 에이전트가 CLI에서와 마찬가지로 응답합니다.

## 작동 방식

당신이 달릴 때`qwen channel start`, Qwen 코드:

1. 귀하의 채널 구성을 읽습니다.`settings.json`
2. 다음을 사용하여 단일 에이전트 프로세스를 생성합니다.[ACP(에이전트 클라이언트 프로토콜)](../../developers/architecture)
3. 각 메시징 플랫폼에 연결하고 메시지 수신을 시작합니다.
4. 수신 메시지를 에이전트에게 라우팅하고 응답을 올바른 채팅으로 다시 보냅니다.

모든 채널은 사용자당 격리된 세션으로 하나의 에이전트 프로세스를 공유합니다. 각 채널에는 자체 작업 디렉터리, 모델 및 지침이 있을 수 있습니다.

## 빠른 시작

1. 메시징 플랫폼에 봇을 설정하세요(채널별 가이드 참조:[전보](./telegram),[위챗](./weixin),[딩톡](./dingtalk))
2. 채널 구성을 추가하세요.`~/.qwen/settings.json`
3. 달리다`qwen channel start`모든 채널을 시작하려면, 또는`qwen channel start <name>`단일 채널의 경우

내장되지 않은 플랫폼을 연결하고 싶으십니까? 보다[플러그인](./plugins)사용자 정의 어댑터를 확장으로 추가합니다.

## 구성

채널은 다음에서 구성됩니다.`channels`키 입력`settings.json`. 각 채널에는 이름과 옵션 세트가 있습니다.

```json
{
  "channels": {
    "my-channel": {
      "type": "telegram",
      "token": "$MY_BOT_TOKEN",
      "senderPolicy": "allowlist",
      "allowedUsers": ["123456789"],
      "sessionScope": "user",
      "cwd": "/path/to/working/directory",
      "instructions": "선택 system instructions for the agent.",
      "groupPolicy": "disabled",
      "groups": {
        "*": { "requireMention": true }
      }
    }
  }
}
```

### 옵션

| 옵션                     | 필수의 | 설명                                                                                                                    |
| ------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `type`                   | 예     | 채널 유형:`telegram`,`weixin`,`dingtalk`, 또는 확장의 사용자 정의 유형(참조[플러그인](./plugins))                       |
| `token`                  | 전보   | 봇 토큰. 지원`$ENV_VAR`환경 변수에서 읽는 구문입니다. WeChat 또는 DingTalk에는 필요하지 않습니다.                       |
| `clientId`               | 딩톡   | 딩톡 앱키. 지원`$ENV_VAR`통사론                                                                                         |
| `clientSecret`           | 딩톡   | 딩톡 앱시크릿. 지원`$ENV_VAR`통사론                                                                                     |
| `model`                  | 아니요 | 이 채널에 사용할 모델(예:`qwen3.5-plus`). 기본 모델을 재정의합니다. 이미지 입력을 지원하는 다중 모드 모델에 유용합니다. |
| `senderPolicy`           | 아니요 | 봇과 대화할 수 있는 사람:`allowlist`(기본),`open`, 또는`pairing`                                                        |
| `allowedUsers`           | 아니요 | 봇 사용이 허용된 사용자 ID 목록(다음에서 사용)`allowlist`그리고`pairing`정책)                                           |
| `sessionScope`           | 아니요 | 세션 범위 지정 방법:`user`(기본),`thread`, 또는`single`                                                                 |
| `cwd`                    | 아니요 | 에이전트의 작업 디렉터리입니다. 기본값은 현재 디렉터리입니다.                                                           |
| `instructions`           | 아니요 | 각 세션의 첫 번째 메시지 앞에 맞춤 지침이 추가됩니다.                                                                   |
| `groupPolicy`            | 아니요 | 그룹 채팅 액세스:`disabled`(기본),`allowlist`, 또는`open`. 보다[그룹 채팅](#group-chats)                                |
| `groups`                 | 아니요 | 그룹별 설정. 키는 그룹 채팅 ID 또는`"*"`기본값의 경우. 보다[그룹 채팅](#group-chats)                                    |
| `dispatchMode`           | 아니요 | 봇이 바쁜 동안 메시지를 보내면 어떻게 되나요?`steer`(기본),`collect`, 또는`followup`. 보다[파견 모드](#dispatch-modes)  |
| `blockStreaming`         | 아니요 | 점진적인 응답 전달:`on`또는`off`(기본). 보다[스트리밍 차단](#block-streaming)                                           |
| `blockStreamingChunk`    | 아니요 | 청크 크기 한계:`{ "minChars": 400, "maxChars": 1000 }`. 보다[스트리밍 차단](#block-streaming)                           |
| `blockStreamingCoalesce` | 아니요 | 유휴 플러시:`{ "idleMs": 1500 }`. 보다[스트리밍 차단](#block-streaming)                                                 |

### 발신자 정책

봇과 상호 작용할 수 있는 사람을 제어합니다.

- **`allowlist`**(기본값) - 다음에 나열된 사용자만`allowedUsers`메시지를 보낼 수 있습니다. 다른 것들은 조용히 무시됩니다.
- **`pairing`**— 알 수 없는 발신자가 페어링 코드를 수신합니다. 봇 운영자는 CLI를 통해 이를 승인하고 영구 허용 목록에 추가됩니다. 사용자`allowedUsers`페어링을 완전히 건너뜁니다. 보다[DM 페어링](#dm-pairing)아래에.
- **`open`**— 누구나 메시지를 보낼 수 있습니다. 주의해서 사용하세요.

### 세션 범위

대화 세션이 관리되는 방식을 제어합니다.

- **`user`**(기본값) — 사용자당 하나의 세션입니다. 동일한 사용자가 보낸 모든 메시지는 대화를 공유합니다.
- **`thread`**— 스레드/주제당 하나의 세션입니다. 스레드가 있는 그룹 채팅에 유용합니다.
- **`single`**— 모든 사용자를 위한 하나의 공유 세션입니다. 모두가 같은 대화를 나눕니다.

### 토큰 보안

봇 토큰은 직접 저장되어서는 안 됩니다.`settings.json`. 대신 환경 변수 참조를 사용하세요.

```json
{
  "token": "$TELEGRAM_BOT_TOKEN"
}
```

쉘 환경이나`.env`채널을 실행하기 전에 로드되는 파일입니다.

## DM 페어링

언제`senderPolicy`로 설정되어 있습니다`"pairing"`, 알 수 없는 발신자는 승인 절차를 거칩니다.

1. 알 수 없는 사용자가 봇에 메시지를 보냅니다.
2. 봇은 8자리 페어링 코드(예:`VEQDDWXJ`)
3. 사용자가 귀하(봇 운영자)와 코드를 공유합니다.
4. CLI를 통해 승인합니다.

```bash
qwen channel pairing approve my-channel VEQDDWXJ
```

승인되면 사용자 ID가 다음 위치에 저장됩니다.`~/.qwen/channels/<name>-allowlist.json`앞으로의 모든 메시지는 정상적으로 전달됩니다.

### CLI 명령 페어링

```bash
# List pending pairing requests
qwen channel pairing list my-channel

# Approve a request by code
qwen channel pairing approve my-channel <CODE>
```

### 페어링 규칙

- 코드는 명확한 알파벳을 사용하는 대문자 8자입니다(없음).`0`/`O`/`1`/`I`)
- 코드는 1시간 후에 만료됩니다.
- 한 번에 채널당 최대 3개의 요청이 보류 중입니다. 추가 요청은 만료되거나 승인될 때까지 무시됩니다.
- 다음에 나열된 사용자`allowedUsers`\~에`settings.json`항상 페어링 건너뛰기
- 승인된 사용자는 다음 위치에 저장됩니다.`~/.qwen/channels/<name>-allowlist.json`— 이 파일을 민감한 파일로 취급합니다.

## 그룹 채팅

기본적으로 봇은 직접 메시지에서만 작동합니다. 그룹 채팅 지원을 활성화하려면 다음을 설정하세요.`groupPolicy`에게`"allowlist"`또는`"open"`.

### 그룹 정책

봇이 그룹 채팅에 참여하는지 여부를 제어합니다.

- **`disabled`**(기본값) — 봇은 모든 그룹 메시지를 무시합니다. 가장 안전한 옵션.
- **`allowlist`**— 봇은 명시적으로 나열된 그룹에만 응답합니다.`groups`채팅 ID로 그만큼`"*"`키는 기본 설정을 제공하지만**\~ 아니다**와일드카드 허용 역할을 합니다.
- **`open`**— 봇은 자신이 추가된 모든 그룹에서 응답합니다. 주의해서 사용하세요.

### 게이팅 언급

그룹에서는 봇에 다음이 필요합니다.`@mention`또는 기본적으로 메시지 중 하나에 대한 응답입니다. 이렇게 하면 봇이 그룹 채팅의 모든 메시지에 응답하지 못하게 됩니다.

다음을 사용하여 그룹별 구성`groups`환경:

```json
{
  "groups": {
    "*": { "requireMention": true },
    "-100123456": { "requireMention": false }
  }
}
```

- **`"*"`**— 모든 그룹에 대한 기본 설정입니다. 허용 목록 항목이 아닌 구성 기본값만 설정합니다.
- **그룹 채팅 ID**— 특정 그룹에 대한 설정을 재정의합니다. 재정의`"*"`기본값.
- **`requireMention`**(기본:`true`) - 언제`true`, 봇은 자신을 @멘션하거나 해당 메시지 중 하나에 회신하는 메시지에만 응답합니다. 언제`false`, 봇은 모든 메시지에 응답합니다(전용 작업 그룹에 유용함).

### 그룹 메시지 평가 방법

```
1. groupPolicy — is this group allowed?           (no → ignore)
2. requireMention — was the bot mentioned/replied to? (no → ignore)
3. senderPolicy — is this sender approved?         (no → pairing flow)
4. Route to session
```

### 그룹을 위한 텔레그램 설정

1. 그룹에 봇 추가
2. **개인 정보 보호 모드 비활성화**BotFather에서(`/mybots`→ 봇 설정 → 그룹 개인정보 보호 → 끄기) - 그렇지 않으면 봇에 명령이 아닌 메시지가 표시되지 않습니다.
3. **봇 제거 및 다시 추가**개인정보 보호 모드 변경 후 그룹에 (텔레그램은 이 설정을 캐시합니다)

### 그룹 채팅 ID 찾기

그룹의 채팅 ID를 찾으려면`groups`허용 목록:

1. 봇이 실행 중이면 중지하세요.
2. 그룹의 봇을 언급하는 메시지 보내기
3. Telegram Bot API를 사용하여 대기 중인 업데이트를 확인하세요.

```bash
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates" | python3 -m json.tool
```

찾아보세요`message.chat.id`응답에서 — 그룹 ID는 음수입니다(예:`-5170296765`).

## 미디어 지원

채널은 텍스트뿐만 아니라 이미지와 파일을 에이전트에 보내는 것을 지원합니다.

### 이미지

봇에 사진을 보내면 에이전트가 이를 볼 수 있습니다. 스크린샷, 오류 메시지 또는 다이어그램을 공유하는 데 유용합니다. 이미지는 비전 입력으로 모델에 직접 전송됩니다.

이미지 지원을 사용하려면 채널에 대한 다중 모드 모델을 구성하십시오.

```json
{
  "channels": {
    "my-channel": {
      "type": "telegram",
      "model": "qwen3.5-plus",
      ...
    }
  }
}
```

### 파일

문서(PDF, 코드 파일, 텍스트 파일 등)를 봇에 보냅니다. 파일이 다운로드되어 임시 디렉터리에 저장되고 에이전트는 파일 읽기 도구를 사용하여 내용을 읽을 수 있도록 파일 경로를 알려줍니다.

파일은 모든 모델에서 작동하며 다중 모드 지원이 필요하지 않습니다.

### 플랫폼 차이

| 특징   | 전보                                    | 위챗                                | 딩톡                                                                   |
| ------ | --------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| 이미지 | Bot API를 통해 직접 다운로드            | AES 암호 해독을 사용한 CDN 다운로드 | downloadCode API(2단계)                                                |
| 파일   | Bot API를 통해 직접 다운로드(20MB 제한) | AES 암호 해독을 사용한 CDN 다운로드 | downloadCode API(2단계)                                                |
| 캡션   | 메시지 텍스트로 포함된 사진/파일 캡션   | 해당 없음                           | 서식 있는 텍스트: 하나의 메시지에 텍스트와 이미지가 혼합되어 있습니다. |

## 파견 모드

봇이 이전 메시지를 처리하는 동안 새 메시지를 보낼 때 발생하는 상황을 제어합니다.

- **`steer`**(기본값) — 봇이 현재 요청을 취소하고 새 메시지 작업을 시작합니다. 후속 조치는 일반적으로 봇을 수정하거나 리디렉션하려는 것을 의미하는 일반 채팅에 가장 적합합니다.
- **`collect`**— 새 메시지가 버퍼링되었습니다. 현재 요청이 완료되면 버퍼링된 모든 메시지가 단일 후속 프롬프트로 결합됩니다. 생각을 대기열에 추가하려는 비동기 워크플로에 적합합니다.
- **`followup`**— 각 메시지는 순서대로 별도의 순서로 대기열에 추가되어 처리됩니다. 각 메시지가 독립적인 일괄 작업 흐름에 유용합니다.

```json
{
  "channels": {
    "my-channel": {
      "type": "telegram",
      "dispatchMode": "steer",
      ...
    }
  }
}
```

채널 기본값을 재정의하여 그룹별로 디스패치 모드를 설정할 수도 있습니다.

```json
{
  "groups": {
    "*": { "requireMention": true, "dispatchMode": "steer" },
    "-100123456": { "dispatchMode": "collect" }
  }
}
```

## 스트리밍 차단

기본적으로 에이전트는 잠시 동안 작업한 후 하나의 큰 응답을 보냅니다. 블록 스트리밍이 활성화되면 에이전트가 계속 작동하는 동안 응답은 여러 개의 짧은 메시지로 도착합니다. 이는 ChatGPT 또는 Claude가 점진적인 출력을 표시하는 방식과 유사합니다.

```json
{
  "channels": {
    "my-channel": {
      "type": "telegram",
      "blockStreaming": "on",
      "blockStreamingChunk": { "minChars": 400, "maxChars": 1000 },
      "blockStreamingCoalesce": { "idleMs": 1500 },
      ...
    }
  }
}
```

### 작동 원리

- 상담원의 응답은 단락 경계에서 블록으로 분할되어 별도의 메시지로 전송됩니다.
- `minChars`(기본값 400) — 작은 메시지 스팸을 피하기 위해 최소한 이 정도 길이가 될 때까지 블록을 보내지 마십시오.
- `maxChars`(기본값 1000) — 블록이 자연스러운 중단 없이 이만큼 길어지면 어쨌든 보냅니다.
- `idleMs`(기본값 1500) — 에이전트가 일시 중지되면(예: 도구 실행) 지금까지 버퍼링된 내용을 보냅니다.
- 에이전트가 완료되면 남은 텍스트가 즉시 전송됩니다.

오직`blockStreaming`필요합니다. 청크 및 병합 설정은 선택 사항이며 합리적인 기본값을 갖습니다.

## 슬래시 명령

채널은 슬래시 명령을 지원합니다. 이는 로컬로 처리됩니다(에이전트 왕복 없음).

- `/help`— 사용 가능한 명령 나열
- `/clear`— 세션을 지우고 새로 시작하세요(별칭:`/reset`,`/new`)
- `/status`— 세션 정보 및 액세스 정책 표시

기타 모든 슬래시 명령(예:`/compress`,`/summary`)가 상담원에게 전달됩니다.

이 명령은 모든 채널 유형(Telegram, WeChat, DingTalk)에서 작동합니다.

## 달리기

```bash
# Start all configured channels (shared agent process)
qwen channel start

# Start a single channel
qwen channel start my-channel

# Check if the service is running
qwen channel status

# Stop the running service
qwen channel stop
```

봇은 포그라운드에서 실행됩니다. 누르다`Ctrl+C`중지하거나 사용하려면`qwen channel stop`다른 터미널에서.

### 다중 채널 모드

당신이 달릴 때`qwen channel start`이름이 없으면 다음에 정의된 모든 채널`settings.json`단일 에이전트 프로세스를 공유하면서 함께 시작하세요. 각 채널은 자체 세션을 유지합니다. Telegram 사용자와 WeChat 사용자는 동일한 에이전트를 공유하더라도 별도의 대화를 받습니다.

각 채널은 자신의 채널을 사용합니다.`cwd`서로 다른 채널이 서로 다른 프로젝트에서 동시에 작업할 수 있습니다.

### 서비스 관리

채널 서비스는 PID 파일(`~/.qwen/channels/service.pid`) 실행 중인 인스턴스를 추적하려면 다음을 수행합니다.

- **중복방지**: 달리기`qwen channel start`서비스가 이미 실행 중인 동안에는 두 번째 인스턴스를 시작하는 대신 오류가 표시됩니다.
- **`qwen channel stop`**: 다른 단말에서 실행 중인 서비스를 정상적으로 중지합니다.
- **`qwen channel status`**: 서비스 실행 여부, 가동 시간, 채널별 세션 수를 표시합니다.

### 충돌 복구

에이전트 프로세스가 예기치 않게 충돌하는 경우 채널 서비스는 자동으로 이를 다시 시작하고 모든 활성 세션을 복원하려고 시도합니다. 사용자는 처음부터 다시 시작하지 않고도 대화를 계속할 수 있습니다.

- 세션이 지속됩니다.`~/.qwen/channels/sessions.json`서비스가 실행되는 동안
- 충돌 시: 에이전트가 3초 이내에 다시 시작되고 저장된 세션을 다시 로드합니다.
- 3번 연속 충돌 후 서비스가 오류와 함께 종료됩니다.
- 완전 종료 시(Ctrl+C 또는`qwen channel stop`): 세션 데이터가 지워집니다. — 다음 시작은 항상 새로워집니다.
