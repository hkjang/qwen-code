# 도구 사용 요약

Qwen Code는 각 도구 배치가 완료된 후 짧은 git-commit-subject 스타일 라벨을 생성하여 배치가 수행한 작업을 요약할 수 있습니다. 레이블은 성적표에 인라인으로 표시되며 일반 레이블을 대체합니다.`Tool × N`컴팩트 모드의 헤더.

이는 병렬 도구 호출을 위한 UX 지원입니다. 모델이 여러 개로 팬아웃될 때`Read`+`Grep`+`Bash`한 번에 호출하면 도구 목록을 훑어볼 필요 없이 요약을 통해 한눈에 의도를 알 수 있습니다.

이 기능은 기본적으로 활성화되어 있으며 백그라운드에서 자동으로 실행됩니다. 구성된 것이 필요합니다[빠른 모델](./followup-suggestions#fast-model).

## 당신이 보는 것

### 전체 모드(기본값)

요약은 도구 그룹 바로 아래에 희미한 배지 선으로 표시됩니다.

```
╭──────────────────────────────────────────────╮
│ ✓  ReadFile a.txt                            │
│ ✓  ReadFile b.txt                            │
│ ✓  ReadFile c.txt                            │
│ ✓  ReadFile d.txt                            │
╰──────────────────────────────────────────────╯

 ● Read 4 text files
```

### 컴팩트 모드(`Ctrl+O`또는`ui.compactMode: true`)

라벨은 일반 라벨을 대체합니다.`Tool × N`간결한 단일 라이너의 헤더:

```
╭──────────────────────────────────────────────╮
│✓  Read txt files  · 4 tools                  │
│Press Ctrl+O to show full tool output         │
╰──────────────────────────────────────────────╯
```

개별 도구 호출은 여전히 ​​키 입력 거리에 있습니다(`Ctrl+O`전체 모드로 전환하려면).

## 작동 방식

도구 배치가 완료된 후 Qwen Code는 다음을 사용하여 구성된 빠른 모델에 대해 실행 후 잊어버리기 호출을 실행합니다.

* 도구 이름, 잘린 인수, 잘린 결과(각각 최대 300자)
* 인텐트 접두사로서 어시스턴트의 가장 최근 텍스트 출력(처음 200자)입니다.
* git-commit-subject 스타일로 과거형 30자 라벨을 반환하도록 모델에 지시하는 시스템 프롬프트입니다.

호출은 다음 차례의 API 스트리밍과 병렬로 실행되므로 \~1초의 레이턴시이 기본 모델의 응답 뒤에 숨겨져 있습니다. 레이블이 확인되면 성적표에 다음과 같이 추가됩니다.`tool_use_summary`기입.

라벨 예시:`Searched in auth/`,`Fixed NPE in UserService`,`Created signup endpoint`,`Read config.json`,`Ran failing tests`.

## 나타날 때

요약은 다음과 같은 경우에 생성됩니다.**모두**다음 중 하나가 참입니다:

* `experimental.emitToolUseSummaries`\~이다`true`(기본).
* 에이`fastModel`구성되어 있습니다(설정을 통해 또는`/model --fast`).
* 배치에서 하나 이상의 도구가 완료되었습니다.
* 공구가 완료되기 전에 회전이 중단되지 않았습니다.
* 빠른 모델은 비어 있지 않고 오류가 없는 응답을 반환했습니다.

하위 에이전트 도구 호출은 요약 생성을 트리거하지 않으며 기본 세션의 도구 배치만 트리거합니다.

## 나타나지 않을 때

다음과 같은 경우 요약이 자동으로 건너뜁니다(오류 없음, UI 변경 없음).

* 빠른 모델이 구성되지 않았습니다.
* 빠른 모델 호출이 실패하거나 시간 초과되거나 비어 있는 상태로 반환됩니다.
* 모델이 명백한 오류 메시지 같은 문자열을 반환했습니다(예:`Error: ...`,`I cannot ...`) - UI에 오해의 소지가 있는 라벨이 표시되지 않도록 클라이언트에서 필터링합니다.
* 턴이 중단되었습니다(`Ctrl+C`) 모델이 완성되기 전.

이러한 모든 경우에 도구 그룹은 항상 그랬듯이 렌더링합니다.

## 빠른 모델

라벨은 다음을 사용하여 생성됩니다.[빠른 모델](./followup-suggestions#fast-model)— 프롬프트 제안 및 추측 실행을 위해 구성한 것과 동일한 모델입니다. 다음을 통해 구성하세요.

### 명령을 통해

```
/model --fast qwen3-coder-flash
```

### 을 통해`settings.json`

```json
{
  "fastModel": "qwen3-coder-flash"
}
```

빠른 모델이 구성되지 않은 경우 요약 생성이 완전히 건너뛰어집니다. 즉, 기능을 설정할 때까지 기능이 적용되지 않습니다.

## 구성

이러한 설정은 다음에서 구성할 수 있습니다.`settings.json`:

| 환경                                  | 유형 | 기본     | 설명                                                    |
| ----------------------------------- | -- | ------ | ----------------------------------------------------- |
| `experimental.emitToolUseSummaries` | 부울 | `true` | 요약 생성을 위한 마스터 스위치입니다. 초고속 모델 호출을 비활성화하려면 끄십시오.        |
| `fastModel`                         | 끈  | `""`   | 요약 생성에 사용되는 빠른 모델(프롬프트 제안과 공유) 필수의; 비어 있으면 작동하지 않습니다. |

### 환경 재정의

`QWEN_CODE_EMIT_TOOL_USE_SUMMARIES`재정의`experimental.emitToolUseSummaries`현재 세션에 대한 설정:

* `QWEN_CODE_EMIT_TOOL_USE_SUMMARIES=0`또는`=false`— 강제 종료.
* `QWEN_CODE_EMIT_TOOL_USE_SUMMARIES=1`또는`=true`— 강제로 켜십시오.
* 설정되지 않음 — 사용`experimental.emitToolUseSummaries`환경.

### 예

```json
{
  "fastModel": "qwen3-coder-flash",
  "experimental": {
    "emitToolUseSummaries": true
  }
}
```

## 범위 및 수명주기

이 기능을 처음 읽을 때 문제가 되는 세 가지 사항은 다음과 같습니다.

1. **배치당 하나의 생성이 두 디스플레이 모드에서 공유됩니다.**빠른 모델 호출은 정확히 한 번 발생합니다.`handleCompletedTools`도구 배치가 완료될 때. 토글`Ctrl+O`나중에는**\~ 아니다**새 호출을 트리거합니다. 두 모드 모두 동일한 항목에서 읽습니다.`tool_use_summary`처음으로 캡처된 기록 항목입니다. 추가 비용 없이 컴팩트 모드를 자유롭게 켜고 끌 수 있습니다.
2. **전환 또는 세션 재개 시 백필이 없습니다.**에이`tool_group`기능이 활성화되기 전(또는 설정을 켜기 전 또는 재개된 세션에서)이 완료된 것입니다.`ChatRecordingService`요약 항목을 유지하지 않음) 레이블을 얻지 못합니다. "기존 기록 정리" 패스는 없습니다. 세션 중에 이 설정을 켜면*미래*배치에는 라벨이 표시됩니다. 이전 그룹은 레이블이 누락되었다는 표시 없이 기본 렌더링을 유지합니다.
3. **주 에이전트 배치만 해당됩니다.**트리거는 기본 세션의 턴 루프(`useGeminiStream`), 그래서:

   * ✅ 셸, MCP, 파일 작업 및`작업`/하위 에이전트 도구*스스로를 부르다*(메인 배치에 나타나는 대로)이 요약됩니다.
   * ❌ 서브에이전트의**내부**도구 배치(실행`packages/core/src/agents/runtime/`)은 요약되지 않았습니다.

   외부 배치는*포함*에이`작업`도구에는 여전히 레이블이 지정되지만 빠른 모델에서는 하위 에이전트 내부의 개별 도구 호출이 아닌 하위 에이전트 도구 호출과 집계된 출력만 볼 수 있습니다. 다음과 같은 라벨을 기대하세요.`Ran research-agent`또는`Delegated file search`오히려`Searched 14 files`. 이는 의도적인 것입니다. 하위 에이전트 내부를 요약하면 기본 UI에 절대 표시되지 않는 빠른 모델 비용과 표면 노이즈가 배가됩니다.

## 권장 페어링: 컴팩트 모드 활성화

3개 이상의 병렬 도구 호출 일괄 처리의 경우 이 기능을 다음과 페어링합니다.`ui.compactMode: true`가장 깨끗한 성적표를 생성합니다. 컴팩트 보기는 전체 배치를 레이블이 지정된 단일 행으로 접습니다(`✓  Read txt files  · 4 tools`) 모든 도구 라인과 후행 요약을 표시하는 대신. 자세한 내용은 다음을 통해 한 번의 키 입력으로 유지됩니다.`Ctrl+O`.

```json
{
  "fastModel": "qwen3-coder-flash",
  "ui": {
    "compactMode": true
  },
  "experimental": {
    "emitToolUseSummaries": true
  }
}
```

전체 모드(기본값)에서는 요약이 후행으로 렌더링됩니다.`● <label>`도구 그룹 아래 줄 — 대규모 또는 이질적인 배치에 유용하지만 작은 동일한 유형의 배치(예:`Read × 3`) 라벨은 눈에 보이는 도구 라인을 다시 설명한 것으로 읽을 수 있습니다. 일반적인 작업 흐름과 일치하는 경우 위와 같이 압축 모드를 켜거나 다음을 통해 요약을 완전히 끄세요.`experimental.emitToolUseSummaries: false`.

## 모니터링

요약 모델 사용법은 다음에 나타납니다.`/stats`빠른 모델 토큰 합계에 따라 출력됩니다.`prompt_id` `tool_use_summary_generation`프롬프트 제안 및 기타 백그라운드 작업과 구별될 수 있습니다.

## 데이터 흐름 및 개인정보 보호

요약 호출은 성공한 각 도구의 이름을 잘려서 보냅니다.`args`, 잘린 결과(각 필드는 최대 300자)를**fast model**, 어시스턴트의 가장 최근 텍스트 중 처음 200자를 인텐트 접두사로 추가합니다.

빠른 모델이 기본 세션 모델과 동일한 공급자/인증에 대해 구성된 경우 데이터는 기본 세션이 이미 사용하는 것과 동일한 경계를 따라 흐르므로 신뢰 범위는 변경되지 않습니다. 빠른 모델을 구성한 경우**다른 공급자**, 도구 입력 및 출력(잠재적으로 다음에서 읽은 파일 내용 포함)`read_file`, 셸 호출의 명령 출력 또는 MCP 도구를 통해 표시되는 값)은 요약 프롬프트의 일부로 다른 공급자에게 전송됩니다. 이는 기본 세션보다 훨씬 더 큰 데이터 공유 범위입니다.

이것이 작업 흐름에 중요한 경우 다음 두 가지 정리 옵션이 있습니다.

* 구성`fastModel`기본 세션과 동일한 공급자 아래의 모델에 연결하므로 요약 호출이 새로운 인증/데이터 경계를 넘지 않습니다.
* 다음을 사용하여 기능을 완전히 비활성화하십시오.`experimental.emitToolUseSummaries: false`(또는`QWEN_CODE_EMIT_TOOL_USE_SUMMARIES=0`).

필드당 300자 제한은 노출을 제한하지만 이를 제거하지는 않습니다. 제한 기간 동안 도구 출력에서 ​​발견된 비밀은 계속 전송될 수 있습니다. 빠른 모델의 데이터 경계를 기본 모델의 데이터 경계와 동일한 방식으로 처리합니다.

## 비용

One fast-model call per qualifying tool batch. Input is a small fixed system prompt plus the truncated tool inputs/outputs (each capped at 300 characters per field). Output is a single short line (capped at 100 characters, typically 20 tokens or fewer). On a typical fast model this is roughly $0.001 per batch.

추가 비용을 원하지 않으면 다음을 통해 기능을 끄십시오.`experimental.emitToolUseSummaries: false`또는`QWEN_CODE_EMIT_TOOL_USE_SUMMARIES=0`.

## 관련된

* [컴팩트 모드](../configuration/settings#ui.compactMode)—로 전환`Ctrl+O`; 압축 모드가 켜져 있으면 요약이 일반 도구 그룹 헤더를 대체합니다.
* [후속 제안](./followup-suggestions)— 동일한 기능을 공유하는 또 다른 빠른 모델 기반 UX 향상`fastModel`환경.
