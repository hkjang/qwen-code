# 딩톡(딩톡)

이 가이드에서는 DingTalk (딩톡)에서 Qwen Code 채널을 설정하는 방법을 다룹니다.

## 전제조건

- DingTalk 조직 계정
- AppKey 및 AppSecret이 포함된 DingTalk 봇 애플리케이션(아래 참조)

## 봇 만들기

1. 로 이동[DingTalk 개발자 포털](https://open-dev.dingtalk.com)
2. 새 애플리케이션 만들기(또는 기존 애플리케이션 사용)
3. 응용 프로그램에서 다음을 활성화하십시오.**기계 인간**능력
4. 로봇 설정에서 활성화**스트림 모드**(로봇 프로토콜 → 스트림 모드)
5. 참고하세요**앱키**(클라이언트 ID) 및**앱비밀**(클라이언트 비밀번호) 애플리케이션 자격 증명 페이지에서

### 스트림 모드

DingTalk 스트림 모드는 아웃바운드 WebSocket 연결을 사용하므로 공개 URL이나 서버가 필요하지 않습니다. 봇은 WebSocket을 통해 메시지를 푸시하는 DingTalk 서버에 연결됩니다. 이는 가장 간단한 배포 모델입니다.

## 구성

채널을 추가하세요.`~/.qwen/settings.json`:

```json
{
  "channels": {
    "my-dingtalk": {
      "type": "dingtalk",
      "clientId": "$DINGTALK_CLIENT_ID",
      "clientSecret": "$DINGTALK_CLIENT_SECRET",
      "senderPolicy": "open",
      "sessionScope": "user",
      "cwd": "/path/to/your/project",
      "instructions": "You are a concise coding assistant responding via DingTalk.",
      "groupPolicy": "open",
      "groups": {
        "*": { "requireMention": true }
      }
    }
  }
}
```

자격 증명을 환경 변수로 설정합니다.

```bash
export DINGTALK_CLIENT_ID=<your-app-key>
export DINGTALK_CLIENT_SECRET=<your-app-secret>
```

또는`env`섹션`settings.json`:

```json
{
  "env": {
    "DINGTALK_CLIENT_ID": "your-app-key",
    "DINGTALK_CLIENT_SECRET": "your-app-secret"
  }
}
```

## 달리기

```bash
# Start only the DingTalk channel
qwen channel start my-dingtalk

# Or start all configured channels together
qwen channel start
```

DingTalk를 열고 봇에 메시지를 보냅니다. 에이전트가 처리하는 동안 🙌 이모티콘 반응이 나타난 후 응답이 표시됩니다.

## 그룹 채팅

DingTalk 봇은 DM 및 그룹 대화 모두에서 작동합니다. 그룹 지원을 활성화하려면:

1. 세트`groupPolicy`에게`"allowlist"`또는`"open"`채널 구성에서
2. DingTalk 그룹에 봇 추가
3. 응답을 트리거하려면 그룹의 봇을 @멘션하세요.

기본적으로 봇은 그룹 채팅에서 @mention을 요구합니다(`requireMention: true`). 세트`"requireMention": false`특정 그룹이 모든 메시지에 응답하도록 합니다. 보다[그룹 채팅](./overview#group-chats)자세한 내용은

### 그룹의 대화 ID 찾기

딩톡은`conversationId`그룹을 식별합니다. 누군가가 그룹에 메시지를 보낼 때 채널 서비스 로그에서 찾을 수 있습니다.`conversationId`로그 출력의 필드입니다.

## 이미지 및 파일

텍스트뿐만 아니라 사진과 문서를 봇에 보낼 수 있습니다.

**사진:**이미지(스크린샷, 다이어그램 등)를 보내면 에이전트가 비전 기능을 사용하여 이를 분석합니다. 이를 위해서는 다중 모드 모델이 필요합니다. — 추가`"model": "qwen3.5-plus"`(또는 다른 비전 지원 모델)을 채널 구성에 추가하세요. DingTalk는 이미지를 직접 전송하거나 서식 있는 텍스트 메시지(텍스트 + 이미지 혼합)의 일부로 전송하는 것을 지원합니다.

**파일:**PDF, 코드 파일 또는 모든 문서를 보냅니다. 봇은 DingTalk 서버에서 이를 다운로드하고 에이전트가 파일 도구를 사용하여 읽을 수 있도록 로컬에 저장합니다. 오디오 및 비디오 파일도 지원됩니다. 이는 모든 모델에서 작동합니다.

## 텔레그램과의 주요 차이점

- **입증:**정적 봇 토큰 대신 AppKey + AppSecret. SDK는 액세스 토큰 새로 고침을 자동으로 관리합니다.
- **연결:**폴링 대신 WebSocket 스트림 - 공용 IP 또는 웹훅 URL이 필요하지 않습니다.
- **서식:**응답은 DingTalk의 마크다운 방언(제한된 하위 집합)을 사용합니다. DingTalk는 테이블을 렌더링하지 않으므로 테이블은 자동으로 일반 텍스트로 변환됩니다. 긴 메시지는 최대 3,800자의 청크로 분할됩니다.
- **작동 표시기:**A 🙌 이모티콘 반응은 처리하는 동안 사용자의 메시지에 추가되었다가 응답이 전송되면 제거됩니다.
- **미디어 다운로드:**2단계 프로세스 —`downloadCode`메시지의 내용은 DingTalk API를 통해 임시 다운로드 URL로 교환됩니다.
- **여러 떼:**딩톡은`isInAtList`메시지 엔터티를 구문 분석하는 대신 @mention 감지를 위해.

## 팁

- **DingTalk 마크다운 인식 지침 사용**— DingTalk는 제한된 마크다운 하위 집합(헤더, 굵게, 링크, 코드 블록, 표는 제외)을 지원합니다. "DingTalk 마크다운을 사용하세요. 테이블은 피하세요."와 같은 지침을 추가합니다. 상담사가 응답 형식을 올바르게 지정하는 데 도움이 됩니다.
- **접근 제한**— 조직의 맥락에서,`senderPolicy: "open"`받아들일 수 있습니다. 더 엄격하게 제어하려면 다음을 사용하세요.`"allowlist"`또는`"pairing"`. 보다[DM 페어링](./overview#dm-pairing)자세한 내용은.
- **참조된 메시지**— 사용자 메시지를 인용(답장)하면 인용된 텍스트가 에이전트에 대한 컨텍스트로 포함됩니다. 봇 응답 인용은 아직 지원되지 않습니다.

## 문제 해결

### 봇이 연결되지 않음

- AppKey와 AppSecret이 올바른지 확인하세요.
- 실행하기 전에 환경 변수가 설정되어 있는지 확인하십시오.`qwen channel start`
- 확실하게 하다**스트림 모드**DingTalk 개발자 포털의 봇 설정에서 활성화되어 있습니다.
- 연결 오류가 있는지 터미널 출력을 확인하세요.

### 봇이 그룹으로 응답하지 않습니다.

- 확인해보세요`groupPolicy`로 설정되어 있습니다`"allowlist"`또는`"open"`(기본값은`"disabled"`)
- 그룹 메시지에서 봇을 @멘션했는지 확인하세요.
- 봇이 그룹에 추가되었는지 확인

### "메시지에 세션 웹훅이 없습니다."

이는 DingTalk가 메시지 콜백에 응답 엔드포인트를 포함하지 않았음을 의미합니다. 봇의 권한이 잘못 구성된 경우 이런 일이 발생할 수 있습니다. 개발자 포털에서 봇의 설정을 확인하세요.

### "죄송합니다. 메시지를 처리하는 중에 문제가 발생했습니다."

이는 일반적으로 에이전트에 오류가 발생했음을 의미합니다. 자세한 내용은 터미널 출력을 확인하세요.
