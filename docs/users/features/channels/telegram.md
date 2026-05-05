# 전보

이 가이드에서는 텔레그램에서 Qwen Code 채널을 설정하는 방법을 다룹니다.

## 전제조건

* 텔레그램 계정
* 텔레그램 봇 토큰(아래 참조)

## 봇 만들기

1. 텔레그램을 열고 다음을 검색하세요.[@BotFather](https://t.me/BotFather)
2. 보내다`/newbot`프롬프트에 따라 이름과 사용자 이름을 선택하세요.
3. BotFather가 봇 토큰을 제공합니다 — 안전하게 저장하세요

## 사용자 ID 찾기

사용하려면`senderPolicy: "allowlist"`또는`"pairing"`, 텔레그램 사용자 ID(사용자 이름이 아닌 숫자 ID)가 필요합니다.

그것을 찾는 가장 쉬운 방법:

1. 검색[@userinfobot](https://t.me/userinfobot)텔레그램에서
2. 메시지를 보내면 사용자 ID로 응답합니다.

## 구성

채널을 추가하세요.`~/.qwen/settings.json`:

```json
{
  "channels": {
    "my-telegram": {
      "type": "telegram",
      "token": "$TELEGRAM_BOT_TOKEN",
      "senderPolicy": "allowlist",
      "allowedUsers": ["YOUR_USER_ID"],
      "sessionScope": "user",
      "cwd": "/path/to/your/project",
      "instructions": "You are a concise coding assistant responding via Telegram. Keep responses short.",
      "groupPolicy": "disabled",
      "groups": {
        "*": { "requireMention": true }
      }
    }
  }
}
```

봇 토큰을 환경 변수로 설정합니다.

```bash
export TELEGRAM_BOT_TOKEN=<your-token-from-botfather>
```

아니면`.env`실행하기 전에 소스를 가져오는 파일입니다.

## 달리기

```bash
# Start only the Telegram channel
qwen channel start my-telegram

# Or start all configured channels together
qwen channel start
```

그런 다음 Telegram에서 봇을 열고 메시지를 보내세요. "작업 중..."이 즉시 나타난 다음 상담원의 응답이 표시되어야 합니다.

## 그룹 채팅

텔레그램 그룹에서 봇을 사용하려면:

1. 세트`groupPolicy`에게`"allowlist"`또는`"open"`채널 구성에서
2. **개인 정보 보호 모드 비활성화**BotFather에서:`/mybots`→ 봇 선택 → 봇 설정 → 그룹 개인정보 보호 → 끄기
3. 그룹에 봇을 추가합니다. 이미 그룹에 속해 있었다면,**제거하고 다시 추가하세요**(텔레그램은 봇이 합류한 시점부터 개인 정보 보호 설정을 캐시합니다)
4. 사용하는 경우`groupPolicy: "allowlist"`, 그룹의 채팅 ID를 다음에 추가하세요.`groups`귀하의 구성에서

기본적으로 봇이 그룹으로 응답하려면 @mention 또는 회신이 필요합니다. 세트`"requireMention": false`특정 그룹이 모든 메시지에 응답하도록 합니다(전용 작업 그룹에 유용함). 보다[그룹 채팅](./overview#group-chats)자세한 내용은

## 이미지 및 파일

텍스트뿐만 아니라 사진과 문서를 봇에 보낼 수 있습니다.

**사진:**사진을 보내면 에이전트가 비전 기능을 사용하여 사진을 분석합니다. 이를 위해서는 다중 모드 모델이 필요합니다. — 추가`"model": "qwen3.5-plus"`(또는 다른 비전 지원 모델)을 채널 구성에 추가하세요. 사진 캡션이 메시지 텍스트로 전달됩니다.

**서류:**PDF, 코드 파일 또는 모든 문서를 보냅니다. 봇은 이를 다운로드하고 로컬에 저장하므로 에이전트가 파일 도구를 사용하여 읽을 수 있습니다. 이는 모든 모델에서 작동합니다. 텔레그램의 파일 크기 제한은 20MB입니다.

## 팁

* **지침을 간결하게 유지하세요.**— 텔레그램에는 4096자 메시지 제한이 있습니다. "응답을 짧게 유지"와 같은 지침을 추가하면 에이전트가 경계 내에 머무르는 데 도움이 됩니다.
* **사용`sessionScope: "user"`**— 이는 각 사용자에게 자신만의 대화를 제공합니다. 사용`/clear`새롭게 시작하려고.
* **접근 제한**- 사용`senderPolicy: "allowlist"`고정된 사용자 집합에 대해 또는`"pairing"`CLI를 통해 승인한 코드를 사용하여 새로운 사용자가 액세스를 요청할 수 있도록 합니다. 보다[DM 페어링](./overview#dm-pairing)자세한 내용은.

## 메시지 형식

에이전트의 마크다운 응답은 텔레그램 호환 HTML로 자동 변환됩니다. 코드 블록, 굵게, 기울임꼴, 링크 및 목록이 모두 지원됩니다.

## 문제 해결

### 봇이 응답하지 않습니다

* 봇 토큰이 올바른지, 환경 변수가 설정되었는지 확인하세요.
* 사용자 ID가 다음과 같은지 확인하세요.`allowedUsers`사용하는 경우`senderPolicy: "allowlist"`, 또는 다음을 사용하는 경우 승인되었음을 나타냅니다.`"pairing"`
* 터미널 출력에 오류가 있는지 확인하세요.

### 봇이 그룹으로 응답하지 않습니다.

* 확인해보세요`groupPolicy`로 설정되어 있습니다`"allowlist"`또는`"open"`(기본값은`"disabled"`)
* 사용하는 경우`"allowlist"`, 그룹의 채팅 ID가`groups`구성
* 확실하게 하다**그룹 개인 정보 보호가 꺼져 있습니다**BotFather — 이것이 없으면 봇은 그룹에서 명령이 아닌 메시지를 볼 수 없습니다.
* 봇을 그룹에 추가한 후 개인정보 보호 모드를 변경한 경우,**봇 제거 후 다시 추가**그룹에
* 기본적으로 봇에는 @mention 또는 응답이 필요합니다. 보내다`@yourbotname hello`테스트하다

### "죄송합니다. 메시지를 처리하는 중에 문제가 발생했습니다."

이는 일반적으로 에이전트에 오류가 발생했음을 의미합니다. 자세한 내용은 터미널 출력을 확인하세요.

### 봇이 응답하는 데 시간이 오래 걸림

에이전트가 여러 도구 호출(파일 읽기, 검색 등)을 실행 중일 수 있습니다. 에이전트가 처리하는 동안 "작업 중..." 표시가 표시됩니다. 복잡한 작업은 1분 이상 걸릴 수 있습니다.
