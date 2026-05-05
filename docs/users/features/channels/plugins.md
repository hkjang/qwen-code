# 맞춤 채널 플러그인

다음과 같이 패키지된 사용자 정의 플랫폼 어댑터를 사용하여 채널 시스템을 확장할 수 있습니다.[확장](../../extension/introduction). 이를 통해 Qwen Code를 모든 메시징 플랫폼, 웹훅 또는 사용자 정의 전송에 연결할 수 있습니다.

## 작동 방식

채널 플러그인은 시작 시 활성 확장에서 로드됩니다. 언제`qwen channel start`실행하면 다음과 같습니다.

1. 활성화된 모든 확장 프로그램을 검사합니다.`channels`그들의 항목`qwen-extension.json`
2. 각 채널의 진입점을 동적으로 가져옵니다.
3. 참조할 수 있도록 채널 유형을 등록합니다.`settings.json`
4. 플러그인의 팩토리 기능을 사용하여 채널 인스턴스를 생성합니다.

사용자 정의 채널은 발신자 게이팅, 그룹 정책, 세션 라우팅, 슬래시 명령, 충돌 복구, 에이전트에 대한 ACP 브리지 등 전체 공유 파이프라인을 무료로 제공합니다.

## 맞춤 채널 설치

채널 플러그인을 제공하는 확장 프로그램을 설치합니다.

```bash
# From a local path (for development or private plugins)
qwen extensions install /path/to/my-channel-extension

# Or link it for development (changes are reflected immediately)
qwen extensions link /path/to/my-channel-extension
```

## 맞춤 채널 구성

채널 항목 추가`~/.qwen/settings.json`확장에서 제공하는 사용자 정의 유형을 사용합니다.

```json
{
  "channels": {
    "my-bot": {
      "type": "my-platform",
      "apiKey": "$MY_PLATFORM_API_KEY",
      "senderPolicy": "open",
      "cwd": "/path/to/project"
    }
  }
}
```

그만큼`type`설치된 확장 프로그램에 등록된 채널 유형과 일치해야 합니다. 플러그인별 필드가 필요한 확장 프로그램 문서를 확인하세요(예:`apiKey`,`webhookUrl`).

모든 표준 채널 옵션은 맞춤 채널에서 작동합니다.

| 옵션             | 설명                               |
| -------------- | -------------------------------- |
| `senderPolicy` | `allowlist`,`pairing`, 또는`open`  |
| `allowedUsers` | 발신자 ID의 정적 허용 목록                 |
| `sessionScope` | `user`,`thread`, 또는`single`      |
| `cwd`          | 에이전트의 작업 디렉터리                    |
| `instructions` | 각 세션의 첫 번째 메시지 앞에 추가됨            |
| `model`        | 채널에 대한 모델 재정의                    |
| `groupPolicy`  | `disabled`,`allowlist`, 또는`open` |
| `groups`       | 그룹별 설정                           |

보다[개요](./overview)각 옵션에 대한 자세한 내용은

## 채널 시작

```bash
# Start all channels including custom ones
qwen channel start

# Start just your custom channel
qwen channel start my-bot
```

## 무료로 얻을 수 있는 것

사용자 정의 채널은 기본 제공 채널이 수행하는 모든 기능을 자동으로 지원합니다.

* **발신자 정책**—`allowlist`,`pairing`, 그리고`open`접근 제어
* **그룹 정책**— 선택적 @mention 게이팅을 사용한 그룹별 설정
* **세션 라우팅**— 사용자별, 스레드별 또는 단일 공유 세션
* **DM 페어링**— 알 수 없는 사용자를 위한 전체 페어링 코드 흐름
* **슬래시 명령**—`/help`,`/clear`,`/status`즉시 작업
* **맞춤 지침**— 각 세션의 첫 번째 메시지 앞에 추가됩니다.
* **충돌 복구**— 세션 보존을 통한 자동 재시작
* **세션별 ​​직렬화**— 경합 상태를 방지하기 위해 메시지가 대기열에 추가됩니다.

## 나만의 채널 플러그인 구축

새로운 플랫폼을 위한 채널 플러그인을 구축하고 싶으십니까? 참조[채널 플러그인 개발자 가이드](/developers/channel-plugins)에 대한`ChannelPlugin`인터페이스,`Envelope`형식 및 확장 지점.
