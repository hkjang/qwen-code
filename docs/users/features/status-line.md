# 상태 표시줄

> 쉘 명령을 사용하여 바닥글에 사용자 정의 정보를 표시합니다.

상태 줄을 사용하면 바닥글의 왼쪽 섹션에 출력이 표시되는 셸 명령을 실행할 수 있습니다. 이 명령은 stdin을 통해 구조화된 JSON 컨텍스트를 수신하므로 현재 모델, 토큰 사용, git 분기 또는 스크립트할 수 있는 모든 것과 같은 세션 인식 정보를 표시할 수 있습니다.

```
Single-line status (default approval mode — 1 row):
┌─────────────────────────────────────────────────────────────────┐
│  user@host ~/project (main) ctx:34%   🔒 docker | Debug | 67%  │  ← status line
└─────────────────────────────────────────────────────────────────┘

Multi-line status (up to 2 lines — 2 rows):
┌─────────────────────────────────────────────────────────────────┐
│  user@host ~/project (main) ctx:34%   🔒 docker | Debug | 67%  │  ← status line 1
│  ████████░░░░░░░░░░ 34% context                                │  ← status line 2
└─────────────────────────────────────────────────────────────────┘

Multi-line status + non-default mode (3 rows max):
┌─────────────────────────────────────────────────────────────────┐
│  user@host ~/project (main) ctx:34%   🔒 docker | Debug | 67%  │  ← status line 1
│  ████████░░░░░░░░░░ 34% context                                │  ← status line 2
│  auto-accept edits (shift + tab to cycle)                       │  ← mode indicator
└─────────────────────────────────────────────────────────────────┘
```

구성되면 상태 표시줄은 기본 "바로가기용?" 힌트를 대체합니다. 우선 순위가 높은 메시지(Ctrl+C/D 종료 프롬프트, Esc, vim INSERT 모드)는 일시적으로 상태 표시줄을 재정의합니다. 상태 표시줄 텍스트는 사용 가능한 너비에 맞게 잘립니다.

## 전제조건

* [`jq`](https://jqlang.github.io/jq/)JSON 입력을 구문 분석하는 데 권장됩니다(다음을 통해 설치).`brew install jq`,`apt install jq`, 등.)
* JSON 데이터가 필요하지 않은 간단한 명령(예:`git branch --show-current`) 없이 일하다`jq`

## 빠른 설정

상태 표시줄을 구성하는 가장 쉬운 방법은 다음과 같습니다.`/statusline`명령. 쉘 PS1 구성을 읽고 일치하는 상태 줄을 생성하는 설정 에이전트를 시작합니다.

```
/statusline
```

구체적인 지침을 제공할 수도 있습니다.

```
/statusline show model name and context usage percentage
```

## 수동 구성

추가`statusLine`아래의 개체`ui`키 입력`~/.qwen/settings.json`:

```json
{
  "ui": {
    "statusLine": {
      "type": "command",
      "command": "input=$(cat); model=$(echo \"$input\" | jq -r '.model.display_name'); pct=$(echo \"$input\" | jq -r '.context_window.used_percentage'); echo \"$model  ctx:${pct}%\""
    }
  }
}
```

| 필드                | 유형          | 필수의 | 설명                                                                       |
| ----------------- | ----------- | --- | ------------------------------------------------------------------------ |
| `type`            | `"command"` | 예   | 반드시`"command"`                                                           |
| `command`         | 끈           | 예   | 실행할 쉘 명령입니다. stdin을 통해 JSON을 수신하면 stdout이 표시됩니다(최대 2줄).                  |
| `refreshInterval` | 숫자          | 아니요 | N초(최소 1)마다 명령을 다시 실행합니다. 에이전트 상태 이벤트(시계, 할당량, 가동 시간) 없이 변경되는 데이터에 유용합니다. |

## JSON 입력

이 명령은 stdin을 통해 다음 필드가 포함된 JSON 개체를 받습니다.

```json
{
  "session_id": "abc-123",
  "version": "0.14.1",
  "model": {
    "display_name": "qwen-3-235b"
  },
  "context_window": {
    "context_window_size": 131072,
    "used_percentage": 34.3,
    "remaining_percentage": 65.7,
    "current_usage": 45000,
    "total_input_tokens": 30000,
    "total_output_tokens": 5000
  },
  "workspace": {
    "current_dir": "/home/user/project"
  },
  "git": {
    "branch": "main"
  },
  "metrics": {
    "models": {
      "qwen-3-235b": {
        "api": {
          "total_requests": 10,
          "total_errors": 0,
          "total_latency_ms": 5000
        },
        "tokens": {
          "prompt": 30000,
          "completion": 5000,
          "total": 35000,
          "cached": 10000,
          "thoughts": 2000
        }
      }
    },
    "files": {
      "total_lines_added": 120,
      "total_lines_removed": 30
    }
  },
  "vim": {
    "mode": "INSERT"
  }
}
```

| 필드                                    | 유형        | 설명                                                            |
| ------------------------------------- | --------- | ------------------------------------------------------------- |
| `session_id`                          | 끈         | 고유 세션 식별자                                                     |
| `version`                             | 끈         | Qwen 코드 버전                                                    |
| `model.display_name`                  | 끈         | 현재 모델명                                                        |
| `context_window.context_window_size`  | 숫자        | 토큰의 총 컨텍스트 창 크기                                               |
| `context_window.used_percentage`      | 숫자        | 컨텍스트 창 사용량(%)(0\~100)                                         |
| `context_window.remaining_percentage` | 숫자        | 백분율로 남아 있는 컨텍스트 창(0\~100)                                     |
| `context_window.current_usage`        | 숫자        | 마지막 API 호출의 토큰 수(현재 컨텍스트 크기)                                  |
| `context_window.total_input_tokens`   | 숫자        | 이 세션에서 사용한 총 입력 토큰                                            |
| `context_window.total_output_tokens`  | 숫자        | 이 세션에서 소비된 총 출력 토큰                                            |
| `workspace.current_dir`               | 끈         | 현재 작업 디렉토리                                                    |
| `git`                                 | 개체 \| 결석한 | git 저장소 내부에만 존재합니다.                                           |
| `git.branch`                          | 끈         | 현재 지점 이름                                                      |
| `metrics.models.<id>.api`             | 물체        | 모델별 API 통계:`total_requests`,`total_errors`,`total_latency_ms` |
| `metrics.models.<id>.tokens`          | 물체        | 모델별 토큰 사용량:`prompt`,`completion`,`total`,`cached`,`thoughts`  |
| `metrics.files`                       | 물체        | 파일 변경 통계:`total_lines_added`,`total_lines_removed`            |
| `vim`                                 | 개체 \| 결석한 | vim 모드가 활성화된 경우에만 표시됩니다. 포함`mode`(`"INSERT"`또는`"NORMAL"`).    |

> **중요한:**stdin은 한 번만 읽을 수 있습니다. 항상 먼저 변수에 저장하십시오.`input=$(cat)`.

## 예

### 모델 및 토큰 사용

```json
{
  "ui": {
    "statusLine": {
      "type": "command",
      "command": "input=$(cat); model=$(echo \"$input\" | jq -r '.model.display_name'); pct=$(echo \"$input\" | jq -r '.context_window.used_percentage'); echo \"$model  ctx:${pct}%\""
    }
  }
}
```

산출:`qwen-3-235b  ctx:34%`

### Git 브랜치 + 디렉토리

```json
{
  "ui": {
    "statusLine": {
      "type": "command",
      "command": "input=$(cat); branch=$(echo \"$input\" | jq -r '.git.branch // empty'); dir=$(basename \"$(echo \"$input\" | jq -r '.workspace.current_dir')\"); echo \"$dir${branch:+ ($branch)}\""
    }
  }
}
```

산출:`my-project (main)`

> 참고:`git.branch`필드는 JSON 입력에 직접 제공됩니다.`git`.

### 파일 변경 통계

```json
{
  "ui": {
    "statusLine": {
      "type": "command",
      "command": "input=$(cat); added=$(echo \"$input\" | jq -r '.metrics.files.total_lines_added'); removed=$(echo \"$input\" | jq -r '.metrics.files.total_lines_removed'); echo \"+$added/-$removed lines\""
    }
  }
}
```

산출:`+120/-30 lines`

### 라이브 시계 및 Git 브랜치

사용`refreshInterval`상태 표시줄에 에이전트 이벤트 없이 변경되는 데이터(예: 시계, 가동 시간 또는 속도 제한 카운터)가 표시되는 경우:

```json
{
  "ui": {
    "statusLine": {
      "type": "command",
      "command": "input=$(cat); branch=$(echo \"$input\" | jq -r '.git.branch // \"no-git\"'); echo \"$(date +%H:%M:%S)  ($branch)\"",
      "refreshInterval": 1
    }
  }
}
```

출력(1초마다 새로 고침):`14:32:07  (main)`

### 복잡한 명령을 위한 스크립트 파일

더 긴 명령의 경우 다음 위치에 스크립트 파일을 저장하세요.`~/.qwen/statusline-command.sh`:

```bash
#!/bin/bash
input=$(cat)
model=$(echo "$input" | jq -r '.model.display_name')
pct=$(echo "$input" | jq -r '.context_window.used_percentage')
branch=$(echo "$input" | jq -r '.git.branch // empty')
added=$(echo "$input" | jq -r '.metrics.files.total_lines_added')
removed=$(echo "$input" | jq -r '.metrics.files.total_lines_removed')

parts=()
[ -n "$model" ] && parts+=("$model")
[ -n "$branch" ] && parts+=("($branch)")
[ "$pct" != "0" ] 2>/dev/null && parts+=("ctx:${pct}%")
([ "$added" -gt 0 ] || [ "$removed" -gt 0 ]) 2>/dev/null && parts+=("+${added}/-${removed}")

echo "${parts[*]}"
```

그런 다음 설정에서 이를 참조하세요.

```json
{
  "ui": {
    "statusLine": {
      "type": "command",
      "command": "bash ~/.qwen/statusline-command.sh"
    }
  }
}
```

## 행동

* **업데이트 트리거**: 모델 변경, 새 메시지 전송(토큰 수 변경), vim 모드 전환, git 분기 변경, 도구 호출 완료 또는 파일 변경 발생 시 상태 줄이 업데이트됩니다. 업데이트가 디바운스됩니다(300ms). 세트`refreshInterval`(초) 타이머에 따라 명령을 추가로 다시 실행합니다. 에이전트 이벤트(시계, 속도 제한, 빌드 상태) 없이 변경되는 데이터에 유용합니다.
* **시간 초과**: 5초 이상 걸리는 명령은 종료됩니다. 실패하면 상태 줄이 지워집니다.
* **산출**: 멀티 라인 출력을 지원합니다(최대 2라인, 추가 라인은 폐기). 각 줄은 바닥글의 왼쪽 섹션에 흐린 색상을 사용하여 별도의 행으로 렌더링됩니다. 사용 가능한 너비를 초과하는 줄은 잘립니다.
* **핫 리로드**: 변경 사항`ui.statusLine`설정은 즉시 적용되며 다시 시작할 필요가 없습니다.
* **껍데기**: 명령은 다음을 통해 실행됩니다.`/bin/sh`macOS/Linux에서. 윈도우에서는,`cmd.exe`기본적으로 사용됩니다 — POSIX 명령을 다음으로 래핑합니다.`bash -c "..."` or point to a bash script (e.g. `bash ~/.qwen/statusline-command.sh`).
* **제거**: 삭제`ui.statusLine`설정에서 키를 비활성화하세요. "바로가기용?" 힌트가 반환됩니다.

## 문제 해결

| 문제              | 원인               | 고치다                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 상태 표시줄이 표시되지 않음 | 잘못된 경로의 구성       | 미만이어야 합니다.`ui.statusLine`, 루트 수준이 아님`statusLine`                                                                                                                                                                                                                                                                                                                                                 |
| 빈 출력            | 명령이 자동으로 실패함     | 수동으로 테스트:`echo '{"session_id":"test","version":"0.14.1","model":{"display_name":"test"},"context_window":{"context_window_size":0,"used_percentage":0,"remaining_percentage":100,"current_usage":0,"total_input_tokens":0,"total_output_tokens":0},"workspace":{"current_dir":"/tmp"},"metrics":{"models":{},"files":{"total_lines_added":0,"total_lines_removed":0}}}' \| sh -c 'your_command'` |
| 오래된 데이터         | 트리거가 실행되지 않았습니다. | 업데이트를 트리거하려면 메시지를 보내거나 모델을 전환하세요.`refreshInterval`타이머에서 명령을 다시 실행하려면                                                                                                                                                                                                                                                                                                                             |
| 명령이 너무 느림       | 복잡한 스크립트         | 스크립트를 최적화하거나 무거운 작업을 백그라운드 캐시로 옮기세요                                                                                                                                                                                                                                                                                                                                                              |
