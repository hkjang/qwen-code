# 계획 모드 종료 도구(`exit_plan_mode`)

이 문서에서는`exit_plan_mode`Qwen Code용 도구입니다.

## 설명

사용`exit_plan_mode`계획 모드에 있고 구현 계획 제시를 마쳤을 때. 이 도구는 사용자에게 계획을 승인하거나 거부하고 계획 모드에서 구현 모드로 전환하라는 메시지를 표시합니다.

이 도구는 코드를 작성하기 전에 구현 단계를 계획해야 하는 작업을 위해 특별히 설계되었습니다. 연구나 정보 수집 작업에 사용해서는 안 됩니다.

### 인수

`exit_plan_mode`하나의 인수를 사용합니다.

- `plan`(문자열, 필수): 승인을 위해 사용자에게 제시하려는 구현 계획입니다. 이는 구현 단계를 설명하는 간결하고 가격 인하 형식의 계획이어야 합니다.

## 사용방법`exit_plan_mode`퀀코드와 함께

계획 모드 종료 도구는 Qwen Code 계획 작업 흐름의 일부입니다. 계획 모드에 있을 때(일반적으로 코드베이스를 탐색하고 구현 접근 방식을 설계한 후) 이 도구를 사용하여 다음을 수행합니다.

1. 사용자에게 구현 계획 제시
2. 구현을 진행하려면 승인을 요청하세요.
3. 사용자 반응에 따라 계획 모드에서 구현 모드로 전환

이 도구는 사용자에게 계획을 알리고 다음 옵션을 제공합니다.

- **한 번만 진행**: 이번 세션에 대해서만 계획을 승인합니다.
- **항상 진행**: 계획을 승인하고 향후 편집 작업에 대한 자동 승인을 활성화합니다.
- **취소**: 계획을 거부하고 계획 모드를 유지합니다.

용법:

```
exit_plan_mode(plan="Your detailed implementation plan here...")
```

## 이 도구를 사용하는 경우

사용`exit_plan_mode`언제:

1. **구현과제**: 코딩 작업의 구현 단계를 계획하고 있습니다.
2. **계획완성**: 구현 접근 방식에 대한 탐색 및 설계를 마쳤습니다.
3. **사용자 승인 필요**: 코드 변경을 진행하기 전에 사용자 확인이 필요합니다.
4. **코드 작성 작업**: 작업에는 코드 작성, 수정 또는 리팩토링이 포함됩니다.

### 적절한 사용법의 예:

- "사용자 인증 구현 도움말" → 인증 시스템 구현 계획 후 사용
- "사용자 관리를 위한 새로운 API 엔드포인트 추가" → 엔드포인트 구조 설계 후 사용
- "TypeORM을 사용하도록 데이터베이스 레이어를 리팩토링" → 리팩토링 접근 방식을 계획한 후 사용

## 이 도구를 사용하지 말아야 할 경우

사용하지 마십시오`exit_plan_mode`을 위한:

1. **연구과제**: 기존 코드를 이해하거나 탐색하는 데 중점을 둔 작업
2. **정보수집**: 구현하지 않고 검색하거나 읽거나 분석하는 경우
3. **문서화 작업**: 코드 변경 없이 문서를 작성하는 경우
4. **분석 작업**: 구현하지 않고 설명이나 리뷰를 제공하는 경우

### 부적절한 사용의 예:

- "코드베이스에서 vim 모드 구현 검색 및 이해" → 사용하지 않음 (연구과제)
- "인증 시스템이 어떻게 작동하는지 설명" → 사용하지 않음 (분석 업무)
- "프로젝트 내 모든 TODO 댓글을 찾아보세요" → 사용하지 않음(정보수집)

## `exit_plan_mode`예

### 구현 계획 예시

```
exit_plan_mode(plan="## Implementation Plan for User Dashboard

### 1. Create Dashboard Components
- Create `UserDashboard.tsx` with main dashboard layout
- Add `DashboardStats.tsx` for displaying user statistics
- Implement `ActivityFeed.tsx` for recent user activities

### 2. Add API Integration
- Create `dashboardApi.ts` for dashboard data fetching
- Add endpoints for user stats and activity data
- Implement error handling and loading states

### 3. Update Routing
- Add dashboard route in `App.tsx`
- Update navigation component with dashboard link
- Add route protection for authenticated users

### 4. Testing and 문서
- Write unit tests for dashboard components
- Add integration tests for API calls
- Update user documentation with dashboard features

This implementation will take approximately 4-6 hours and requires changes to 8-10 files.")
```

### 리팩토링 계획 예시

```
exit_plan_mode(plan="## Database Layer Refactoring Plan

### Phase 1: Setup and 설정
- Install and configure TypeORM dependencies
- Create database connection configuration
- Set up entity definitions for existing models

### Phase 2: Migration
- Create migration scripts for existing data
- Implement new repository pattern using TypeORM
- Replace raw SQL queries with TypeORM query builder

### Phase 3: Testing and Validation
- Update all database tests to use TypeORM
- Validate data integrity after migration
- Performance testing to ensure no regressions

This refactoring will modernize our database layer while maintaining backward compatibility.")
```

## 사용자 응답 처리

전화 후`exit_plan_mode`, 사용자는 여러 가지 방법으로 응답할 수 있습니다.

- **한 번만 진행**: 기본 확인 설정으로 계획이 즉시 실행되도록 승인됩니다.
- **항상 진행**: 계획이 승인되고 후속 편집 작업에 대해 자동 승인이 활성화됩니다.
- **취소**: 계획이 거부되고 시스템은 추가 계획을 위해 계획 모드로 유지됩니다.

이 도구는 사용자의 선택에 따라 승인 모드를 자동으로 조정하여 사용자 기본 설정에 따라 구현 프로세스를 간소화합니다.

## 중요 사항

- **계획 모드만 해당**: 이 도구는 현재 계획 모드에 있을 때만 사용해야 합니다.
- **구현 초점**: 코드 작성 또는 수정과 관련된 작업에만 사용합니다.
- **간결한 계획**: 계획을 집중적이고 간결하게 유지하세요. 철저한 세부 사항보다는 명확성을 목표로 하세요.
- **마크다운 지원**: 계획은 가독성을 높이기 위해 마크다운 형식을 지원합니다.
- **일회용**: 이 도구는 진행할 준비가 되면 계획 세션당 한 번씩 사용해야 합니다.
- **사용자 제어**: 진행 여부에 대한 최종 결정은 항상 사용자에게 있습니다.

## 계획 워크플로우와 통합

계획 모드 종료 도구는 더 큰 계획 작업 흐름의 일부입니다.

1. **계획 모드 시작**: 사용자의 요청이나 시스템에서 계획이 필요하다고 판단하는 경우
2. **탐사 단계**: 코드베이스 분석, 요구 사항 이해, 옵션 탐색
3. **계획 설계**: 탐구를 바탕으로 실행전략 수립
4. **계획 발표**: 사용`exit_plan_mode`사용자에게 계획을 제시하기 위해
5. **구현 단계**: 승인 후 계획된 시행을 진행합니다.

이 워크플로는 사려 깊은 구현 접근 방식을 보장하고 사용자가 중요한 코드 변경 사항을 제어할 수 있도록 해줍니다.
