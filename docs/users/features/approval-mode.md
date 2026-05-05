# 승인 모드

Qwen Code는 작업 복잡성 및 위험 수준에 따라 AI가 코드 및 시스템과 상호 작용하는 방식을 유연하게 제어할 수 있는 네 가지 고유한 권한 모드를 제공합니다.

## 권한 모드 비교

| 방법         | 파일 편집          | 쉘 명령       | 최고의 대상                                                   | 위험 수준 |
| ---------- | -------------- | ---------- | -------------------------------------------------------- | ----- |
| **계획**​    | ❌ 읽기 전용 분석만 가능 | ❌ 실행되지 않음  | • 코드 탐색<br>• Planning complex changes <br>• 안전한 코드 검토    | 최저    |
| **기본**​    | ✅ 수동 승인 필요     | ✅ 수동 승인 필요 | • 새롭거나 익숙하지 않은 코드베이스<br>• 중요 시스템<br>• 팀 협업<br>• 배우고 가르치기 | 낮은    |
| **자동 편집**​ | ✅ 자동 승인됨       | ❌ 직접 승인 필요 | • 일일 개발 업무<br>• 리팩토링 및 코드 개선<br>• 안전한 자동화                | 중간    |
| **욜로**​    | ✅ 자동 승인됨       | ✅ 자동 승인됨   | • 신뢰할 수 있는 개인 프로젝트<br>• 자동화된 스크립트/CI/CD<br>• 일괄 처리 작업    | 제일 높은 |

### 빠른 참조 가이드

* **계획 모드에서 시작**: 변경하기 전에 이해하는 데 좋습니다.
* **기본 모드로 작업**: 대부분의 개발 작업에 대한 균형 잡힌 선택
* **자동 편집으로 전환**: 안전한 코드 변경을 많이 하는 경우
* **YOLO를 아껴서 사용하세요**: 통제된 환경에서 신뢰할 수 있는 자동화에만 해당

> \[!팁]
>
> 다음을 사용하여 세션 중에 모드를 빠르게 순환할 수 있습니다.**Shift+Tab**(또는**꼬리표**Windows에서). 터미널 상태 표시줄에는 현재 모드가 표시되므로 Qwen Code에 어떤 권한이 있는지 항상 알 수 있습니다.

## 1. 안전한 코드 분석을 위해 계획 모드를 사용하세요

계획 모드는 Qwen Code에 코드베이스를 분석하여 계획을 생성하도록 지시합니다.**읽기 전용**코드베이스를 탐색하고, 복잡한 변경을 계획하고, 코드를 안전하게 검토하는 데 적합합니다.

### 계획 모드를 사용하는 경우

* **다단계 구현**: 기능을 사용하기 위해 많은 파일을 편집해야 하는 경우
* **코드 탐색**: 무엇인가를 변경하기 전에 코드베이스를 철저하게 조사하고 싶을 때
* **대화형 개발**: Qwen Code로 방향을 반복하고 싶을 때

### 계획 모드 사용 방법

**세션 중에 계획 모드 켜기**

다음을 사용하여 세션 중에 계획 모드로 전환할 수 있습니다.**Shift+Tab**(또는**꼬리표**Windows의 경우) 권한 모드를 순환합니다.

일반 모드인 경우,**Shift+Tab**(또는**꼬리표**Windows의 경우) 먼저 다음으로 전환합니다.`auto-edits`모드는 다음으로 표시됩니다.`⏵⏵ accept edits on`터미널 하단에 있습니다. 후속**Shift+Tab**(또는**꼬리표**Windows의 경우)는 다음과 같이 표시된 계획 모드로 전환됩니다.`⏸ plan mode`.

**사용`/plan`명령**

그만큼`/plan`명령은 계획 모드를 시작하고 종료하는 빠른 단축키를 제공합니다.

```bash
/plan                          # Enter plan mode
/plan refactor the auth module # Enter plan mode and start planning
/plan exit                     # Exit plan mode, restore previous mode
```

다음으로 계획 모드를 종료하면`/plan exit`, 이전 승인 모드가 자동으로 복원됩니다(예: 계획 모드로 들어가기 전에 자동 편집 중이었다면 자동 편집으로 돌아갑니다).

**계획 모드에서 새 세션 시작**

계획 모드에서 새 세션을 시작하려면`/approval-mode`그런 다음 선택`plan`

```bash
/approval-mode
```

**계획 모드에서 "헤드리스" 쿼리 실행**

다음을 사용하여 계획 모드에서 직접 쿼리를 실행할 수도 있습니다.`-p`또는`prompt`:

```bash
qwen --prompt "What is machine learning?"
```

### 예: 복잡한 리팩터링 계획

```bash
/plan I need to refactor our authentication system to use OAuth2. Create a detailed migration plan.
```

Qwen Code는 계획 모드에 진입하고 현재 구현을 분석하여 포괄적인 계획을 만듭니다. 후속 조치로 개선:

```
What about backward compatibility?
How should we handle database migration?
```

### 계획 모드를 기본값으로 구성

```json
// .qwen/settings.json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

## 2. 제어된 상호작용을 위해 기본 모드 사용

기본 모드는 Qwen Code를 사용하는 표준 방법입니다. 이 모드에서는 잠재적으로 위험한 모든 작업에 대한 모든 권한을 유지합니다. Qwen Code는 파일을 변경하거나 셸 명령을 실행하기 전에 승인을 요청합니다.

### 기본 모드를 사용하는 경우

* **코드베이스의 새로운 기능**: 익숙하지 않은 프로젝트를 탐색하면서 더욱 주의를 기울이고 싶을 때
* **중요 시스템**: 프로덕션 코드, 인프라 또는 민감한 데이터 작업 시
* **학습 및 교육**: Qwen Code가 진행하는 각 단계를 이해하고 싶을 때
* **팀 협업**: 여러 사람이 동일한 코드베이스에서 작업하는 경우
* **복잡한 운영**: 변경 사항에 여러 파일이나 복잡한 논리가 관련된 경우

### 기본 모드 사용 방법

**세션 중에 기본 모드 켜기**

다음을 사용하여 세션 중에 기본 모드로 전환할 수 있습니다.**Shift+Tab**​ (또는**꼬리표**Windows의 경우) 권한 모드를 순환합니다. 다른 모드에 있는 경우**Shift+Tab**(또는**꼬리표**Windows의 경우) 결국에는 터미널 하단에 모드 표시기가 없는 것으로 표시되는 기본 모드로 다시 순환됩니다.

**기본 모드에서 새 세션 시작**

기본 모드는 Qwen Code를 시작할 때의 초기 모드입니다. 모드를 변경하고 기본 모드로 돌아가려면 다음을 사용하세요.

```
/approval-mode default
```

**기본 모드에서 "헤드리스" 쿼리 실행**

헤드리스 명령을 실행할 때 기본 모드는 기본 동작입니다. 다음을 사용하여 명시적으로 지정할 수 있습니다.

```
qwen --prompt "Analyze this code for potential bugs"
```

### 예: 기능을 안전하게 구현

```
/approval-mode default
```

```
I need to add user profile pictures to our application. The pictures should be stored in an S3 bucket and the URLs saved in the database.
```

Qwen Code는 귀하의 코드베이스를 분석하고 계획을 제안합니다. 그런 다음 다음 전에 승인을 요청합니다.

1. 새 파일 생성(컨트롤러, 모델, 마이그레이션)
2. 기존 파일 수정(새 열 추가, API 업데이트)
3. 셸 명령 실행(데이터베이스 마이그레이션, 종속성 설치)

제안된 각 변경 사항을 검토하고 개별적으로 승인하거나 거부할 수 있습니다.

### 기본 모드를 기본값으로 구성

```bash
// .qwen/settings.json
{
  "permissions": {
"defaultMode": "default"
  }
}
```

## 3. 자동 편집 모드

자동 편집 모드는 Qwen Code가 파일 편집을 자동으로 승인하도록 지시하는 동시에 쉘 명령에 대한 수동 승인을 요구하므로 시스템 안전을 유지하면서 개발 워크플로를 가속화하는 데 이상적입니다.

### 자동 수락 편집 모드를 사용하는 경우

* **일일 개발**: 대부분의 코딩 작업에 이상적
* **안전한 자동화**: AI가 코드를 수정하면서 위험한 명령이 실수로 실행되는 것을 방지할 수 있습니다.
* **팀 협업**: 다른 사람에게 의도하지 않은 영향을 피하기 위해 공유 프로젝트에서 사용합니다.

### 이 모드로 전환하는 방법

```
# Switch via command
/approval-mode auto-edit

# Or use keyboard shortcut
Shift+Tab (or Tab on Windows) # Switch from other modes
```

### 워크플로 예

1. Qwen Code에 함수 리팩터링을 요청합니다.
2. AI가 코드를 분석하고 변경 사항을 제안합니다.
3. **자동으로**​ 확인 없이 모든 파일 변경 사항을 적용합니다.
4. 테스트를 실행해야 하는 경우**승인 요청**​ 실행하다`npm test`

## 4. YOLO 모드 - 완전 자동화

YOLO 모드는 Qwen Code에 가장 높은 권한을 부여하여 파일 편집 및 쉘 명령을 포함한 모든 도구 호출을 자동으로 승인합니다.

### YOLO 모드를 사용하는 경우

* **자동화된 스크립트**: 사전 정의된 자동화된 작업 실행
* **CI/CD 파이프라인**: 통제된 환경에서 자동 실행
* **개인 프로젝트**: 완전히 신뢰할 수 있는 환경에서 신속한 반복
* **일괄 처리**: 다단계 명령 체인이 필요한 작업

> \[!경고]
>
> **YOLO 모드를 주의해서 사용하세요**: AI는 터미널 권한으로 모든 명령을 실행할 수 있습니다. 보장하다:
>
> 1. 현재 코드베이스를 신뢰합니다
> 2. AI가 수행하는 모든 작업을 이해합니다.
> 3. 중요한 파일은 백업되거나 버전 관리에 커밋됩니다.

### YOLO 모드를 활성화하는 방법

```
# Temporarily enable (current session only)
/approval-mode yolo

# Set as project default
/approval-mode yolo --project

# Set as user global default
/approval-mode yolo --user
```

### 구성 예

```bash
// .qwen/settings.json
{
  "permissions": {
"defaultMode": "yolo",
"confirmShellCommands": false,
"confirmFileEdits": false
  }
}
```

### 자동화된 워크플로우 예

```bash
# Fully automated refactoring task
qwen --prompt "Run the test suite, fix all failing tests, then commit changes"

# Without human intervention, AI will:
# 1. Run test commands (auto-approved)
# 2. Fix failed test cases (auto-edit files)
# 3. Execute git commit (auto-approved)
```

## 모드 전환 및 구성

### 키보드 단축키 전환

Qwen Code 세션 중에 다음을 사용하십시오.**Shift+Tab**​ (또는**꼬리표**Windows의 경우) 다음 네 가지 모드를 빠르게 순환합니다.

```
Default Mode → Auto-Edit Mode → YOLO Mode → Plan Mode → Default Mode
```

### 영구 구성

```
// Project-level: ./.qwen/settings.json
// User-level: ~/.qwen/settings.json
{
  "permissions": {
"defaultMode": "auto-edit",  // or "plan" or "yolo"
"confirmShellCommands": true,
"confirmFileEdits": true
  }
}
```

### 모드 사용 권장 사항

1. **코드베이스의 새로운 기능**: 시작하다**계획 모드**​ 안전한 탐사를 위해
2. **일일 개발 작업**: 사용**편집 내용 자동 수락**​ (기본 모드), 효율적이고 안전함
3. **자동화된 스크립트**: 사용**욜로 모드**​ 완전 자동화를 위한 통제된 환경에서
4. **복잡한 리팩토링**: 사용**계획 모드**​ 먼저 세부적인 계획을 세운 다음 실행을 위해 적절한 모드로 전환합니다.
