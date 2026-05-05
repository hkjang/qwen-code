# Qwen 코드 명령 모듈 재구성 계획

## 1. 목표 정의

이 계획은 다음 원칙을 유일한 전제로 삼고 있습니다.

* **코드 구조는 클로드 코드를 복사할 필요가 없습니다.**
* **단, 지휘 시스템의 핵심 기능, 사용 경험, 상호 작용 경험은 클로드 코드와 95% 일치해야 합니다.**

여기서 "정렬"은 다음을 포함하여 사용자가 직접 인식할 수 있는 기능을 의미합니다.

1. 명령 소스 재정의
2. 명령 도움말 및 검색 가능성
3. 명령어 완성 및 중간입력 슬래시 명령어 체험
4. ACP/비대화형 가용성
5. 프롬프트 명령/스킬 호출 능력 모델

이 리팩토링은 몇 가지 필드를 채우는 것도 아니고 기존 필드를 변환하는 것도 아닙니다.`SlashCommand`사소한 수리이지만 명령 모듈을 "대화형 UI 보조 기능"에서 "대화형/ACP/비대화형/모델 전반에 걸친 통합 명령 플랫폼"으로 업그레이드합니다.

***

## 2. 재작성 후 결론

Qwen의 기존 명령 시스템의 문제점은 완전히 불가능하다는 것이 아니라 다음과 같습니다.

1. 대화형 기본 경로에서만 완료됩니다.
2. 유형 모델이 너무 얇아서 클로드 수준의 제품 표면을 운반할 수 없음
3. ACP/비대화형은 화이트리스트에 의존하며 확장성이 매우 낮습니다.
4. 명령 소스가 존재하더라도 사용자에게 보이는 통일된 정신을 형성하지는 않습니다.
5. 프롬프트 명령 및 모델 기술로 시스템 단편화 노출

따라서 새로운 솔루션은 다음 네 가지 사항을 동시에 해결해야 합니다.

1. **클로드 코드의 역량을 완성하세요**
2. **Qwen의 통합 결과 모델의 엔지니어링 이점 유지**
3. **통합 레지스트리/리졸버/실행기/어댑터 아키텍처 구축**
4. **도움말, 완료, ACP 사용 가능한 명령 및 문서가 동일한 메타데이터 세트를 공유하도록 합니다.**

***

## 3. 재건 원리

### 3.1 기능 정렬이 구현 정렬보다 우선합니다.

다른 허용:

* 내부 클래스 이름
* 모듈 분할 방식
* 실행자 구현
* 효과/결과 구조

차이점은 허용되지 않습니다.

* 명령 소스 범위가 크게 축소되었습니다.
* 명령 도움말 및 완료 경험이 크게 감소했습니다.
* ACP/비대화형 사용성이 크게 감소했습니다.
* 프롬프트 명령과 모델 기능의 통합이 크게 축소되었습니다.

상충관계가 발생하는 경우 우선순위는 다음과 같아야 합니다.

1. 사용자 경험 정렬
2. 명령 능력 무시 정렬
3. 스키마 일관성 정렬
4. 간단한 내부 구현

### 3.2 Qwen의 통합 결과 모델 보존

Claude의 구현을 기계적으로 복사하는 것은 권장되지 않습니다.

Qwen의 현재 통합 결과 모델은 다음에 적합하기 때문에 여전히 유지할 가치가 있습니다.

* UI가 대신함
* 승인/확인
* 도구 예약
* 프롬프트 제출
* 교차 모드 적응

그러나 UI 명령 프레임워크의 단순화된 버전으로 계속 존재하기보다는 Claude 수준 명령 기능을 수행할 수 있도록 업그레이드해야 합니다.

### 3.3 유형, 소스, 모드 및 가시성은 완전히 분리되어야 합니다.

새로운 명령 모델은 최소한 다음 차원을 분석해야 합니다.

1. **유형**: 명령을 실행하는 방법
2. **원천**: 명령의 출처
3. **모델 능력**: 어떤 운영 환경에서 사용이 가능한가요?
4. **시계**: 사용자에게 표시되거나 모델에게 표시됩니다.

***

## 4. 클로드코드의 조화가 필요한 역량

### 4.1 명령 유형

Qwen은 세 가지 유형의 명령을 명시적으로 지원해야 합니다.

1. `prompt`
2. `local`
3. `local-jsx`

### 4.2 명령 소스

Qwen의 명령 스키마는 첫 번째 단계부터 다음 소스를 포함해야 합니다.

1. 내장 명령
2. 번들 스킬
3. 스킬디렉터리 명령어
4. 작업 흐름 명령
5. 플러그인 명령
6. 플러그인 기술
7. 역동적인 기술
8. mcp 프롬프트
9. mcp 기술

여기서는 더 이상 "기존 카테고리만 먼저 지원"으로 돌아갈 수 없습니다.

### 4.3 명령 메타데이터

최소한 다음 필드를 완료하십시오.

1. `argumentHint`
2. `whenToUse`
3. `examples`
4. `sourceLabel`
5. `userFacingName`
6. `alias`
7. `immediate`
8. `isSensitive`
9. `userInvocable`
10. `modelInvocable`
11. `supportedModes`
12. `requiresUi`

### 4.4 경험능력

최소한 다음 경험을 완료하십시오.

1. 별칭 적중 완료
2. 소스 배지
3. 매개변수 프롬프트
4. 최근에 사용한 정렬
5. 중간 입력 슬래시 명령 감지 및 완료
6. 명령 디렉토리 도움말
7. ACP 사용 가능한 명령의 완전한 표현

***

## 5. 새로운 명령 모델

## 5.1 핵심 구조

통일을 도입하는 것이 좋습니다`CommandDescriptor`, 모든 명령의 등록 형식입니다.

여기에는 최소한 네 부분이 포함됩니다.

1. `identity`
2. `metadata`
3. `capabilities`
4. `handler`

### `identity`

* `id`
* `name`
* `altNames`
* `canonicalPath`

### `metadata`

* `description`
* `argumentHint`
* `whenToUse`
* `examples`
* `group`
* `source`
* `sourceLabel`
* `userFacingName`
* `hidden`

### `capabilities`

* `type`:`prompt | local | local-jsx`
* `supportedModes`:`interactive | acp | non_interactive`
* `requiresUi`
* `supportsDialog`
* `supportsStreaming`
* `supportsToolInvocation`
* `supportsConfirmation`
* `remoteSafe`
* `readOnly`
* `immediate`
* `isSensitive`
* `userInvocable`
* `modelInvocable`

### `handler`

* `resolveArgs()`
* `execute()`
* `completion()`
* `fallback()`

***

## 5.2 세 가지 명령 유형의 역할

### `prompt`

용도:

* 기술
* 파일 명령
* 워크플로 프롬프트 명령
* 플러그인 기술
* mcp 프롬프트/스킬

특징:

* 프롬프트/기술 자산 생성
* 기본적으로 대화형/ACP/비대화형 지원
* 사용자 또는 모델이 호출할 수 있음

### `local`

용도:

* 쿼리 명령
* 구성 명령
* 헤드리스 실행 가능 상태 명령
* 대부분의 내장 명령에 대한 핵심 실행 진입점

특징:

* UI에 의존하지 않음
* ACP/비대화형의 기본 베어러 유형이어야 합니다.

### `local-jsx`

용도:

* 소매치기
* 패널
* 마법사
* 대화형 UI 셸

특징:

* 대화형 UI만 처리
* 더 이상 유일한 실행 항목으로 사용할 수 없습니다.
* 대체 또는 해당 로컬 하위 명령을 제공해야 합니다.

***

## 6. 명령 소스 모델

## 6.1 외부 소스 모델

이는 사용자를 위한 소스 모델이며 Claude Code의 생각과 최대한 일치해야 합니다.

* `builtin-command`
* `bundled-skill`
* `skill-dir-command`
* `workflow-command`
* `plugin-command`
* `plugin-skill`
* `dynamic-skill`
* `builtin-plugin-skill`
* `mcp-prompt`
* `mcp-skill`

이 필드 세트는 다음 용도로 직접 사용됩니다.

* 도움말 그룹
* 완료 소스 배지
* ACP 사용 가능 명령
* 문서 내보내기

## 6.2 내부 정규화 모델

외부 이름 지정에 얽매이지 않기 위해 구현 필드의 추가 계층이 내부적으로 추가됩니다.

* `providerType`
* `artifactType`
* `activationMode`
* `builtinProvided`
* `originPath`
* `namespace`

이렇게 하면 다음과 같이 됩니다:

* Claude가 조정한 외부 경험
* 내부 구현은 Qwen을 유지 관리할 수 있도록 유지됩니다.

## 6.3 갈등 전략

안정된 프레스`id`관리, 표시 이름 및 입력 이름 분리:

1. `id`: 안정적인 고유 식별자
2. `name`: 본명을 입력하세요.
3. `userFacingName`: 도움말/전체 표시 이름

충돌하는 우선순위 제안:

1. 내장
2. 번들/스킬-디렉터리/워크플로
3. 플러그인 / 내장 플러그인
4. 동적
5. mcp 독립 네임스페이스

***

## 7. 통합 실행 아키텍처

## 7.1 `CommandRegistry`

책임:

1. 모든 로더/공급자를 집계합니다.
2. 다차원 인덱스 생성
3. 출력 도움말, 완성, ACP, 문서 보기
4. 사용자에게 표시되는 명령과 모델에 표시되는 명령에 대한 별도의 보기 제공

지원해야 하는 공급자:

1. `BuiltinCommandLoader`
2. `BundledSkillLoader`
3. `FileCommandLoader`
4. `McpPromptLoader`
5. `WorkflowCommandLoader`
6. `PluginCommandLoader`
7. `PluginSkillLoader`
8. `DynamicSkillProvider`
9. `BuiltinPluginSkillLoader`

일부 공급자가 첫 번째 단계에서 완전히 구현되지 않더라도 먼저 스키마와 API가 지원되어야 합니다.

## 7.2 `CommandResolver`

책임:

1. 슬래시 명령 구문 분석
2. 별칭 구문 분석
3. Parse 하위 명령 경로
4. 중간 입력 슬래시 토큰 식별
5. 정식 해결 명령 출력

## 7.3 `CommandExecutor`

책임:

1. 능력 점검을 하라
2. 구현하다`prompt | local | local-jsx`
3. 통합 출력 결과
4. 대체 처리/지원되지 않음

## 7.4 `ModeAdapter`

세 개의 어댑터를 제거해야 합니다.

1. `InteractiveModeAdapter`
2. `AcpModeAdapter`
3. `NonInteractiveModeAdapter`

이러한 방식으로 세 가지 모드는 별도로 하드 코딩되는 대신 동일한 명령 레지스트리와 실행기를 공유할 수 있습니다.

***

## 8. UI 명령 재구성 원리: 핵심 명령과 대화형 셸의 분리

이것이 ACP와 비대화형을 실제로 사용할 수 있게 만드는 핵심입니다.

현재 본질적으로 "대화 상자 열기"인 모든 명령은 다음으로 변환되어야 합니다.

1. 대화형 쉘
2. 로컬 하위 명령 세트

### 분할되어야 하는 명령의 첫 번째 배치

1. `/model`
2. `/permissions`
3. `/mcp`
4. `/resume`
5. `/hooks`
6. `/extensions`
7. `/agents`
8. `/approval-mode`

### 대상 모양 예

#### `/model`

* `/model`
* `/model show`
* `/model list`
* `/model set <id>`

#### `/permissions`

* `/permissions`
* `/permissions show`
* `/permissions set <mode>`
* `/permissions allow <tool>`
* `/permissions deny <tool>`

#### `/mcp`

* `/mcp`
* `/mcp list`
* `/mcp show <server>`
* `/mcp enable <server>`
* `/mcp disable <server>`

***

## 9. 신속한 명령/스킬 일체형 디자인

이는 백업 능력이 아닌 재구성에서의 P0입니다.

## 9.1 목표

통일을 이루다**모델 호출 가능 프롬프트 명령 레지스트리**, 다음 자산을 모델 호출 가능 보기로 결합합니다.

1. 번들 스킬
2. 파일 명령
3. 워크플로 프롬프트 명령
4. 플러그인 기술
5. mcp 프롬프트/mcp 기술

## 9.2 주요 필드

추가해야 할 사항:

1. `userInvocable`
2. `modelInvocable`
3. `allowedTools`
4. `whenToUse`
5. `argSchema`또는 최소 매개변수 설명
6. `contextMode: inline | fork`
7. `agent`
8. `effort`

## 9.3 및`SkillTool`관계

리팩토링 후에는 더 이상`SkillTool`좁은 스킬만 소모합니다.

다음과 같이 변경되어야 합니다:

1. `CommandRegistry.getModelInvocablePromptCommands()`통합된 뷰 생성
2. `SkillTool`또는 나중에 이 보기를 사용하려면 통합 명령 도구를 사용하세요.
3. 사용자 슬래시 명령과 모델 기술 호출은 동일한 프롬프트 명령 자산 풀을 공유합니다.

이런 식으로 Qwen은 경험 측면에서 Claude와 가까워질 수 있습니다.`/review`、`/commit`、`/openspec-apply`그러한 기능을 처리하는 방법.

***

## 10. 도움말 / 완료 / 검색 가능성

## 10.1 완료

완료 내용은 최소한 다음과 같이 표시되어야 합니다.

1. `label`
2. `description`
3. `argumentHint`
4. `sourceBadge`
5. `modeBadges`
6. `aliasHit`
7. `recentlyUsedScore`

정렬에는 최소한 다음이 고려됩니다.

1. 정확한 타격
2. 별칭 히트
3. 최근에 사용됨
4. 접두어 히트
5. 퍼지 히트

## 10.2 중간입력 슬래시 명령어

완료해야 합니다:

1. 光标附近 slash token 检测
2. 유령 텍스트 프롬프트
3. 탭 완료
4. 유효한 명령 토큰이 강조 표시됨

첫 번째 단계에서는 입력 경험이 조정됩니다. 더 강력한 "내장형 명령 실행 의미론"을 도입할지 여부는 나중에 반복될 수 있습니다.

## 10.3 도움말

도움말은 더 이상 타일 목록이 아니라 전체 명령 디렉터리입니다.

최소한 그룹은 다음과 같습니다.

1. 내장 명령
2. 번들 스킬
3. 스킬 디렉토리 명령
4. 워크플로 명령
5. 플러그인 명령
6. 플러그인 스킬
7. 다이나믹 스킬
8. 내장 플러그인 스킬
9. MCP 명령/MCP 기술

각 명령은 최소한 다음을 표시합니다.

1. 이름
2. 매개변수 프롬프트
3. 설명하다
4. 원천
5. 지원 모드
6. 모델이 호출 가능한지 여부
7. 하위 명령 요약

***

## 11. ACP / 비대화형 리팩토링

## 11.1 화이트리스트 아이디어를 완전히 포기

기존 구성표:

* 내장된 허용 목록
* FILE/SKILL 특별판정
* 지원되지 않는 다른 결과 유형

새로운 솔루션:

* 각 명령은 자체 기능을 선언합니다.
* 레지스트리는 필터링을 담당합니다.
* 어댑터는 실행 및 대체를 담당합니다.

## 11.2 결과 지원 목표

### 대화형

* `submit_prompt`
* `message`
* `stream_messages`
* `tool`
* `dialog`
* `load_history`
* `confirm_action`
* `confirm_shell_commands`

### acp

* `submit_prompt`
* `message`
* `stream_messages`
* `tool`
* `confirm_action`
* `confirm_shell_commands`
* `dialog fallback`

### 비대화형

* `submit_prompt`
* `message`
* `stream_messages`
* `tool`
* `confirm_action`
* `confirm_shell_commands`
* `dialog fallback / structured failure`

## 11.3 ACP 사용 가능 명령 출력

최소한 다음을 포함해야 합니다:

1. `name`
2. `description`
3. `argumentHint`
4. `source`
5. `examples`
6. `supportedModes`
7. `interactiveOnly`
8. `subcommands`
9. `modelInvocable`

***

## 12. 문서, 도움말 및 완성은 동일한 메타데이터를 공유합니다.

리팩토링 후에는 동일한 레지스트리 보기로 다음을 내보내야 합니다.

1. 돕다
2. 완성
3. ACP 사용 가능 명령
4. 문서 내보내기

이는 "구현, 도움말 및 문서의 세 가지 명령 평면 세트 간의 불일치"라는 현재 문제를 해결하기 위한 것입니다.

***

## 13. 스테이징 구현

## 1단계: 기지 재건

배달하다:

1. 새로운`CommandDescriptor`
2. 전체 소스 스키마
3. 능력 모델
4. `userInvocable / modelInvocable`
5. `CommandRegistry`
6. `CommandResolver`
7. `CommandExecutor`
8. 세 종류`ModeAdapter`
9. `getModelInvocablePromptCommands()`

## 2단계: 핵심 명령 마이그레이션

배달하다:

1. `/model`
2. `/permissions`
3. `/mcp`
4. `/resume`
5. `/hooks`
6. `/extensions`
7. `/agents`
8. `/approval-mode`

이러한 명령은 "대화형 쉘 + 로컬 하위 명령" 재구성을 완료해야 합니다.

## 3단계: 모델 기능 개방

배달하다:

1. `SkillTool`통합 레지스트리 보기에 액세스
2. 파일 명령/번들 기술/mcp 프롬프트/플러그인 기술을 통합 모델 호출 가능 컬렉션으로 변환
3. 프롬프트 명령과 기술 자산이 완전히 통합되었습니다.

## 4단계: 레이어 정렬 경험 Claude

배달하다:

1. 최근에 사용한 정렬
2. 소스 배지
3. 인수 힌트
4. 모드 배지
5. 전체 도움말 디렉토리
6. 중간 입력 슬래시 명령 경험
7. 문서 자동 내보내기 또는 확인

***

## 14. 합격 기준

완료되면 최소한:

1. 도움말, 완성, ACP 및 문서는 모두 완전한 소스 모델을 표현할 수 있습니다.
2. 순수 UI 셸 명령 외에도 대부분의 내장 명령은 ACP/비대화형에서 사용할 수 있습니다.
3. 프롬프트 명령과 모델 스킬 호출은 동일한 자산 풀을 사용합니다.
4. 명령 경험은 도움말, 완성, 소스 표현, 매개변수 프롬프트, 중간 입력 경험 측면에서 클로드 코드 수준의 95%에 도달합니다.
5. ACP/비대화형 명령 기능을 유지하기 위해 더 이상 내장된 허용 목록에 의존하지 않습니다.

***

## 15. 최종 판결

이 리팩토링의 핵심은 "기존 SlashCommand에 몇 가지 필드를 추가하는 것"이 ​​아니라 다음을 수행하는 것입니다.

* **Qwen의 내부 아키텍처 스타일을 사용하여 외부 경험 측면에서 Claude Code와 95% 일치하는 명령 플랫폼을 제공합니다.**

하나를 선택해야 한다면:

* 내부 구현은 Claude와 비슷합니다.
* 외부 경험은 Claude와 비슷합니다.

이 계획은 분명히 후자를 선택합니다.
