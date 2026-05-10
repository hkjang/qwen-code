# 위챗(웨이신)

이 가이드에서는 공식 iLink Bot API를 통해 WeChat에서 Qwen Code 채널을 설정하는 방법을 다룹니다.

## 전제조건

- QR 코드를 스캔할 수 있는 WeChat 계정(모바일 앱)
- iLink Bot 플랫폼(WeChat의 공식 봇 API)에 액세스

## 설정

### 1. QR코드로 로그인

WeChat은 정적 봇 토큰 대신 QR 코드 인증을 사용합니다. 로그인 명령을 실행하십시오.

```bash
qwen channel configure-weixin
```

그러면 QR 코드 URL이 표시됩니다. WeChat 모바일 앱으로 스캔하여 인증하세요. 귀하의 자격 증명은 다음 위치에 저장됩니다.`~/.qwen/channels/weixin/account.json`.

### 2. 채널 구성

채널을 추가하세요.`~/.qwen/settings.json`:

```json
{
  "channels": {
    "my-weixin": {
      "type": "weixin",
      "senderPolicy": "pairing",
      "allowedUsers": [],
      "sessionScope": "user",
      "cwd": "/path/to/your/project",
      "model": "qwen3.5-plus",
      "instructions": "You are a concise coding assistant responding via WeChat. Keep responses under 500 characters. Use plain text only."
    }
  }
}
```

참고: WeChat 채널은`token`필드 — 자격 증명은 QR 로그인 단계에서 제공됩니다.

### 3. 채널을 시작하세요

```bash
# Start only the WeChat channel
qwen channel start my-weixin

# Or start all configured channels together
qwen channel start
```

WeChat을 열고 봇에 메시지를 보냅니다. 에이전트가 처리하는 동안 입력 표시기("...")가 표시된 후 응답이 표시됩니다.

## 이미지 및 파일

텍스트뿐만 아니라 사진과 문서를 봇에 보낼 수 있습니다.

**사진:**이미지(스크린샷, 사진 등)를 보내면 에이전트가 비전 기능을 사용하여 이를 분석합니다. 이를 위해서는 다중 모드 모델이 필요합니다. — 추가`"model": "qwen3.5-plus"`(또는 다른 비전 지원 모델)을 채널 구성에 추가하세요. 이미지가 다운로드되고 처리되는 동안 입력 표시기가 표시됩니다.

**파일:**PDF, 코드 파일 또는 모든 문서를 보냅니다. 봇은 WeChat의 CDN에서 이를 다운로드 및 해독하고 로컬에 저장하며 에이전트는 파일 도구를 사용하여 이를 읽습니다. 이는 모든 모델에서 작동합니다.

## 구성 옵션

WeChat 채널은 모든 표준 채널 옵션을 지원합니다(참조:[채널 개요](./overview#options)), 게다가:

| 옵션      | 설명                                                                          |
| --------- | ----------------------------------------------------------------------------- |
| `baseUrl` | iLink Bot API 기본 URL을 재정의합니다(기본값:`https://ilinkai.weixin.qq.com`) |

## 텔레그램과의 주요 차이점

- **입증:**정적 봇 토큰 대신 QR 코드 로그인. 세션은 만료될 수 있습니다. 이 경우 채널이 일시 중지되고 메시지가 기록됩니다.
- **서식:**WeChat은 일반 텍스트만 지원합니다. 상담원 응답의 마크다운은 자동으로 제거됩니다.
- **입력 표시기:**WeChat에는 "작업 중..." 문자 메시지 대신 기본 "..." 입력 표시기가 있습니다.
- **여러 떼:**WeChat iLink Bot은 DM 전용입니다. 그룹 채팅은 지원되지 않습니다.
- **미디어 암호화:**이미지와 파일은 WeChat의 CDN에서 AES-128-ECB로 암호화됩니다. 채널은 복호화를 투명하게 처리합니다.

## 팁

- **일반 텍스트 지침 사용**— WeChat은 모든 마크다운을 제거하므로 상담원이 지저분해 보이는 서식 있는 응답을 생성하지 않도록 "일반 텍스트만 사용"과 같은 지침을 추가하세요.
- **응답을 짧게 유지하세요**— WeChat 메시지 풍선은 간결한 텍스트에서 가장 잘 작동합니다. 지침에 글자 수 제한을 추가하면 도움이 됩니다(예: "응답을 500자 미만으로 유지").
- **세션 만료**— 로그에 "세션 만료됨(errcode -14)"이 표시되면 WeChat 로그인이 만료된 것입니다. 채널을 중지하고 다시 실행하세요.`qwen channel configure-weixin`다시 로그인하세요.
- **접근 제한**- 사용`senderPolicy: "pairing"`또는`"allowlist"`봇과 대화할 수 있는 사람을 제어합니다. 보다[DM 페어링](./overview#dm-pairing)자세한 내용은.

## 문제 해결

### "WeChat 계정이 구성되지 않았습니다"

달리다`qwen channel configure-weixin`먼저 QR코드로 로그인하세요.

### "세션이 만료되었습니다(errcode -14)"

귀하의 WeChat 로그인 세션이 만료되었습니다. 채널을 중지하고 실행하세요.`qwen channel configure-weixin`다시.

### 봇이 응답하지 않습니다

- 터미널 출력에 오류가 있는지 확인하세요.
- 채널이 실행 중인지 확인합니다(`qwen channel start my-weixin`)
- 사용하는 경우`senderPolicy: "allowlist"`, 귀하의 WeChat 사용자 ID가 다음과 같은지 확인하세요.`allowedUsers`

### 이미지가 작동하지 않음

- 채널 구성에`model`시력을 지원하는 것(예:`qwen3.5-plus`)
- 터미널에서 CDN 다운로드 오류를 확인하세요. 이는 네트워크 문제를 나타낼 수 있습니다.
