# 관리형 자동 메모리 (Managed Auto-Memory) 시스템

> 이 문서에서는 Qwen Code의 **관리형 자동 메모리** 메커니즘, 트리거 시점 및 구현 세부 사항을 소개합니다.

***

## 목차

1. [개요](#개요)
2. [저장 구조](#저장 구조)
3. [메모리 유형](#메모리 유형)
4. [메모리 항목 형식](#메모리 항목 형식)
5. [핵심 수명 주기](#핵심 수명 주기)
6. [추출 (Extract)](#추출-extract)
7. [통합 (Dream)](#통합-dream)
8. [회상 (Recall)](#회상-recall)
9. [망각 (Forget)](#망각-forget)
10. [인덱스 재구축](#인덱스-재구축)
11. [원격 측정 (Telemetry) 측정 지점](#원격-측정-telemetry-측정-지점)

***

## 개요

관리형 자동 메모리는 AI 세션 중에 사용할 수 있는 **자동** 영구 메모리 시스템으로, 사용자 관련 지식을 축적, 통합 및 검색합니다. 다음 네 가지 핵심 작업을 통해 메모리의 수명 주기를 유지합니다.

| 작업 | 영문명 | 트리거 방식 | 효과 |
| ---- | ---- | ------------------- | ------------------------------------- |
| 추출 | Extract | 자동 (매 대화 라운드 후) | 대화 기록에서 새로운 지식을 추출하여 메모리 파일에 기록 |
| 통합 | Dream | 자동 (주기적 백그라운드 작업) | 메모리 파일을 중복 제거하고 병합하여 깔끔하게 유지 |
| 회상 | Recall | 자동 (매 대화 라운드 전) | 현재 요청과 관련된 메모리를 검색하여 시스템 프롬프트에 삽입 |
| 망각 | Forget | 수동 (사용자 명령어 `/forget`) | 지정된 메모리 항목을 정확하게 삭제 |

***

## 저장 구조

### 디렉토리 레이아웃

```
~/.qwen/                                      ← 전역 기본 디렉토리 (기본값)
└── projects/
    └── <sanitized-git-root>/                 ← 프로젝트 식별자 (Git 루트 경로 기반)
        ├── meta.json                         ← 메타데이터 (추출/통합 타임스탬프, 상태)
        ├── extract-cursor.json               ← 추출 커서 (이미 처리된 대화 오프셋)
        ├── consolidation.lock                ← Dream 프로세스 뮤텍스 락
        └── memory/                           ← 메모리 메인 디렉토리
            ├── MEMORY.md                     ← 인덱스 파일 (자동 생성, 모든 항목 요약)
            ├── user.md                       ← 사용자 선호도 메모리 (예시)
            ├── feedback.md                   ← 피드백 규정 메모리 (예시)
            ├── project/
            │   └── milestone.md              ← 프로젝트 메모리 (하위 디렉토리 지원)
            └── reference/
                └── grafana.md                ← 외부 리소스 메모리
```

> **환경 변수 재정의**:
>
> * `QWEN_CODE_MEMORY_BASE_DIR`: 전역 기본 디렉토리 교체
> * `QWEN_CODE_MEMORY_LOCAL=1`: 프로젝트 내의 `.qwen/memory/` 경로를 대신 사용

### 주요 파일 설명

| 파일 | 설명 |
| --------------------- | --------------------------------------------------------- |
| `meta.json` | 마지막 추출/통합 시간, 세션 ID, 관련 메모리 유형, 실행 상태를 기록 |
| `extract-cursor.json` | 중복 추출을 방지하기 위해 현재 세션에서 처리된 대화 기록의 오프셋을 기록 |
| `consolidation.lock` | Dream이 실행 중일 때의 파일 락. 내용은 소유자의 PID이며 1시간 후 자동 만료 |
| `MEMORY.md` | 모든 주제 파일의 인덱스. 각 추출/통합 후 다시 작성되며 마크다운 목록 형식임 |

***

## 메모리 유형

시스템은 서로 다른 정보 차원에 대응하는 4가지 내장 메모리 유형을 지원합니다.

| 유형 | 내용 저장 | 언제 쓰는가? | 언제 읽는가? |
| ----------- | ------------------------------------------- | ---------------------------------- | ---------------------------- |
| `user` | 사용자의 역할, 기술 배경 및 작업 습관 | 사용자 역할/선호도/지식 배경을 파악했을 때 | 사용자의 배경에 맞춰 답변을 최적화해야 할 때 |
| `feedback` | AI 행동에 대한 사용자의 지침: 피해야 할 것과 계속해야 할 것 | 사용자가 AI를 교정하거나 명시적인 동작을 확인했을 때 | AI의 행동 방식에 영향을 주어야 할 때 |
| `project` | 프로젝트 진행 상황, 목표, 결정 사항, 마감일, 버그 추적 | 누가, 무엇을, 왜, 언제 수행하는지 파악했을 때 | AI가 작업 맥락과 동기를 이해하도록 도울 때 |
| `reference` | 외부 시스템 리소스 포인터 (대시보드, 티켓 시스템, Slack 채널 등) | 외부 리소스와 그 사용법을 알게 되었을 때 | 사용자가 외부 시스템이나 관련 정보를 언급했을 때 |

**메모리에 저장하지 말아야 할 것**: 코드 패턴/규칙, Git 기록, 디버깅 시나리오, 임시 작업 상태, QWEN.md/AGENTS.md에 이미 기록된 내용.

***

## 메모리 항목 형식

각 주제 파일은 **YAML 프론트매터 + 마크다운 본문** 형식을 따릅니다.

```markdown
---
name: 메모리 명칭
description: 한 줄 설명 (회상 관련성 판단에 사용됨, 구체적이어야 함)
type: user|feedback|project|reference
---

메모리 본문 내용 (요약 줄)

Why: 배경 이유 (AI가 규칙을 맹목적으로 따르지 않고 경계 상황을 이해하도록 함)
How to apply: 적용 시나리오 및 사용 방식
```

`feedback` 및 `project` 유형의 경우, 메모리가 경계 상황에서도 올바르게 적용될 수 있도록 `Why`와 `How to apply`를 작성하는 것이 강력히 권장됩니다.

***

## 핵심 수명 주기

```mermaid
flowchart TD
    A([사용자 요청 전송]) --> B

    subgraph "회상 Recall"
        B[모든 주제 파일 스캔] --> C{문서 수 및\n쿼리 내용이 유효한가?}
        C -- 아니오 --> D[빈 프롬프트 반환\nstrategy: none]
        C -- 예 --> E{Config가 설정되었는가?}
        E -- 예 --> F[모델 기반 선택\nside query]
        F --> G{관련 문서가 선택되었는가?}
        G -- 예 --> H[strategy: model]
        G -- 아니오 --> I[strategy: none]
        E -- 아니오 --> J[휴리스틱 키워드 점수 산출]
        F -- 실패 --> J
        J --> K{점수가 0보다 큰 문서가 있는가?}
        K -- 예 --> L[strategy: heuristic]
        K -- 아니오 --> I
        H --> M[관련 메모리 프롬프트 구축\n시스템 프롬프트에 주입]
        L --> M
        I --> N[메모리 주입 안 함]
    end

    M --> O([AI 요청 처리])
    N --> O
    D --> O

    O --> P([AI 응답 반환])

    subgraph "추출 Extract (백그라운드)"
        P --> Q{이번 라운드에 AI가\n직접 메모리 파일을 썼는가?}
        Q -- 예 --> R[건너뛰기\nmemory_tool]
        Q -- 아니오 --> S{추출 작업이\n실행 중인가?}
        S -- 예 --> T[큐에 넣거나 건너뛰기\nalready_running / queued]
        S -- 아니오 --> U[처리되지 않은 대화 슬라이스 로드\nextract cursor 기반]
        U --> V[추출 에이전트 호출\nrunAutoMemoryExtractionByAgent]
        V --> W[중복 제거 및 정규화 patches]
        W --> X{수정된 주제(topics)가 있는가?}
        X -- 예 --> Y[meta.json 업데이트\nMEMORY.md 인덱스 재구축]
        X -- 아니오 --> Z[extract cursor만 업데이트]
        Y --> Z
    end

    subgraph "통합 Dream (백그라운드, 주기적)"
        P --> AA{Dream 스케줄링 게이트 체크}
        AA --> AB{동일 세션인가?}
        AB -- 예 --> AC[건너뛰기\nsame_session]
        AB -- 아니오 --> AD{마지막 Dream 후\n24시간 이상 경과?}
        AD -- 아니오 --> AE[건너뛰기\nmin_hours]
        AD -- 예 --> AF{마지막 Dream 후\n새 세션 수 5개 이상?}
        AF -- 아니오 --> AG[건너뛰기\nmin_sessions]
        AF -- 예 --> AH{consolidation.lock\n파일이 존재하는가?}
        AH -- 예 --> AI[건너뛰기\nlocked]
        AH -- 아니오 --> AJ[락 획득\nPID 기록]
        AJ --> AK{Config가 설정되었는가?}
        AK -- 예 --> AL[에이전트 경로\nplanManagedAutoMemoryDreamByAgent]
        AL --> AM{에이전트가 파일을 수정했는가?}
        AM -- 예 --> AN[수정된 주제(topics) 기록]
        AM -- "아니오/실패" --> AO
        AK -- 아니오 --> AO[기계적 중복 제거 경로\n파싱+중복 제거+알파벳 정렬]
        AO --> AP[업데이트된 주제 파일 저장]
        AN --> AQ[MEMORY.md 인덱스 재구축\nmeta.json 업데이트]
        AP --> AQ
        AQ --> AR[락 해제]
    end
```

***

## 추출 (Extract)

### 트리거 시점

AI가 한 라운드의 응답을 완료할 때마다 `scheduleAutoMemoryExtract`가 자동으로 트리거됩니다 (백그라운드에서 실행되며 차단되지 않음).

### 스케줄링 로직 (`extractScheduler.ts`)

```mermaid
flowchart TD
    A[scheduleAutoMemoryExtract 호출됨] --> B{이번 라운드 기록에\n메모리 파일을 쓰는 도구 호출이 있는가?}
    B -- 예 --> C[skipped 작업 등록\n이유: memory_tool]
    B -- 아니오 --> D{isExtractRunning?}
    D -- 예 --> E{이미 queued 요청이 있는가?}
    E -- 예 --> F[queued 요청의\nhistory 파라미터 업데이트]
    E -- 아니오 --> G[pending 작업 등록\n큐에 삽입]
    D -- 아니오 --> H[running 작업 등록\nrun작업 호출]
    H --> I[markExtractRunning\nsetCurrent작업Id]
    I --> J[runAutoMemoryExtract]
    J --> K[작업 완료]
    K --> L[clearExtractRunning\n큐 확인 → startQueuedIfNeeded]
    F --> M[반환 skipped: queued]
    G --> M
    C --> N[반환 skipped: memory_tool]
```

**건너뛰기 이유**:

| 이유 | 의미 |
| ----------------- | ------------------------------------------------------ |
| `memory_tool` | 이번 라운드에서 AI가 직접 메모리를 작성했으므로 충돌 방지를 위해 자동 추출을 건너뜀 |
| `already_running` | 추출이 이미 실행 중이며 대기열에 추가할 수 없음 |
| `queued` | 추출이 이미 실행 중이며 이번 요청이 대기열에 추가됨 |

### 핵심 추출 프로세스 (`extract.ts`)

```mermaid
flowchart TD
    A[runAutoMemoryExtract] --> B[ensureAutoMemoryScaffold\n디렉토리 및 파일 초기화]
    B --> C[buildTranscriptMessages\nContent[]를 오프셋 포함 메시지 목록으로 변환]
    C --> D[readExtractCursor\n마지막으로 처리된 위치 읽기]
    D --> E[loadUnprocessedTranscriptSlice\n처리되지 않은 메시지 세그먼트 캡처]
    E --> F{slice가 비어 있는가?}
    F -- 예 --> G[패치 없음 결과 반환]
    F -- 아니오 --> H[runAutoMemoryExtractionByAgent\n포크된 에이전트를 호출하여 패치 추출]
    H --> I[dedupeExtractPatches\n중복 제거 및 정규화]
    I --> J{수정된 주제가 있는가?}
    J -- 예 --> K[bumpMetadata\nmeta.json 업데이트]
    K --> L[rebuildManagedAutoMemoryIndex\nMEMORY.md 재구축]
    L --> M[writeExtractCursor\n최신 오프셋 기록]
    J -- 아니오 --> M
    M --> N[AutoMemoryExtractResult 반환]
```

**추출 커서 (Cursor)**:

* 영속화: `{ sessionId, processedOffset, updatedAt }`
* 매 추출 후 `processedOffset`을 현재 대화 기록 길이로 업데이트
* 다음 추출 시 `offset >= processedOffset`인 메시지만 처리
* 세션 전체가 변경되면 (`sessionId` 변경) 오프셋 0부터 다시 시작

**패치 필터 규칙**:

* 요약 길이 < 12자 → 폐기
* `?`로 끝나는 추상적 질문 → 폐기
* 임시 키워드 포함 (오늘, 지금, 현재, 임시 등) → 폐기
* 동일한 `topic:summary` 조합 → 중복 제거

***

## 통합 (Dream)

### 트리거 시점

AI가 한 라운드의 응답을 완료할 때마다 `scheduleManagedAutoMemoryDream`이 자동으로 트리거됩니다. 하지만 여러 게이트 조건으로 보호되어 대부분의 경우 건너뜁니다.

### 스케줄링 게이트 (`dreamScheduler.ts`)

```mermaid
flowchart TD
    A[scheduleManagedAutoMemoryDream 호출됨] --> B{Dream 기능이 활성화되었는가?}
    B -- 아니오 --> C[건너뛰기: disabled]
    B -- 예 --> D[ensureAutoMemoryScaffold\nlastDreamSessionId 읽기]
    D --> E{현재 sessionId\n== lastDreamSessionId?}
    E -- 예 --> F[건너뛰기: same_session]
    E -- 아니오 --> G{24시간 이상 경과\n또는 한 번도 수행 안 함?}
    G -- 아니오 --> H[건너뛰기: min_hours]
    G -- 예 --> I{마지막 세션 스캔 후\n10분 미만 경과?}
    I -- 예 --> J[건너뛰기: min_sessions\n다음 스캔 창 대기]
    I -- 아니오 --> K[chats/*.jsonl mtime 스캔\n마지막 Dream 이후 새 세션 수 집계]
    K --> L{새 세션 수 ≥ 5?}
    L -- 아니오 --> M[건너뛰기: min_sessions]
    L -- 예 --> N{락 존재 여부 체크\nPID 체크 + 만료 체크}
    N -- 예 --> O[건너뛰기: locked]
    N -- 아니오 --> P{dedupeKey 기반\n동일 프로젝트 Dream 작업 중인가?}
    P -- 예 --> Q[건너뛰기: running\n기존 taskId 반환]
    P -- 아니오 --> R[백그라운드 작업 예약\nBg작업Scheduler]
    R --> S[acquireDreamLock\nconsolidation.lock에 PID 기록]
    S --> T[runManagedAutoMemoryDream]
    T --> U[meta.json 업데이트\n락 해제]
```

**게이트 파라미터**:

| 파라미터 | 기본값 | 설명 |
| -------------------------- | ---- | --------------------------- |
| `minHoursBetweenDreams` | 24시간 | 두 Dream 사이의 최소 시간 간격 |
| `minSessionsBetweenDreams` | 5회 | Dream을 트리거하기 위해 필요한 최소 새 세션 수 |
| `SESSION_SCAN_INTERVAL_MS` | 10분 | 세션 파일 검사 주기 조절 간격 |
| `DREAM_LOCK_STALE_MS` | 1시간 | 락 파일이 만료된 것으로 간주되는 시간 임계값 |

**락 메커니즘**:

* 락 파일 위치: `<project-state-dir>/consolidation.lock`
* 파일 내용: 소유 프로세스의 PID
* 체크 시: PID 프로세스가 더 이상 존재하지 않거나 (`kill(pid, 0)` 실패) 락 생성 후 1시간 이상 경과 시 → 만료된 것으로 간주하여 자동 해제

### 통합 실행 프로세스 (`dream.ts`)

```mermaid
flowchart TD
    A[runManagedAutoMemoryDream] --> B{Config가 설정되었는가?}
    B -- 예 --> C[에이전트 경로\nplanManagedAutoMemoryDreamByAgent]
    C --> D{에이전트가 파일을 수정했는가?}
    D -- 예 --> E[파일 경로에서 수정된 주제 추론]
    E --> F[bumpMetadata\nMEMORY.md 인덱스 재구축]
    F --> G[updateDreamMetadataResult]
    G --> H[원격 측정 이벤트 기록]
    H --> I[결과 반환]
    B -- 아니오 --> J[기계적 중복 제거 경로]
    C -- 예외 발생 --> J
    D -- 아니오 --> J

    J --> K[scanAutoMemoryTopicDocuments\n모든 주제 파일 읽기]
    K --> L[각 파일에 대해 buildDreamedBody 실행]
    L --> M[항목 파싱 → summary 기준 중복 제거\n알파벳 오름차순 정렬 → 재렌더링]
    M --> N{본문이 변경되었는가?}
    N -- 예 --> O[파일 저장]
    O --> P[수정된 주제 기록]
    N -- 아니오 --> Q[파일 간 중복 체크\ndedupeKey = type:summary]
    Q --> R{중복 파일 발견?}
    R -- 예 --> S[항목을 대표 파일로 병합\n중복 파일 삭제]
    S --> P
    R -- 아니오 --> T{수정된 주제가 있는가?}
    P --> T
    T -- 예 --> U[bumpMetadata\nMEMORY.md 인덱스 재구축]
    U --> V[updateDreamMetadataResult\n원격 측정 기록 → 결과 반환]
    T -- 아니오 --> V
```

**기계적 중복 제거 로직**:

1. 각 주제 파일 내부: `summary.toLowerCase()` 기준 중복 제거, `why`/`howToApply` 필드 병합
2. 요약을 알파벳순으로 정렬
3. 파일 간: 동일한 `type:summary` 항목을 먼저 발견된 파일로 병합하고 중복 파일 삭제

***

## 회상 (Recall)

### 트리거 시점

매 라운드마다 AI가 사용자 요청을 처리하기 전에 `resolveRelevantAutoMemoryPromptForQuery`가 자동으로 트리거되어 시스템 프롬프트에 관련 메모리를 주입합니다.

### 회상 프로세스 (`recall.ts`)

```mermaid
flowchart TD
    A[resolveRelevantAutoMemoryPromptForQuery] --> B[scanAutoMemoryTopicDocuments\n모든 주제 파일 스캔]
    B --> C[filterExcludedAutoMemoryDocuments\n이번 라운드에 작성된 파일 필터링]
    C --> D{쿼리 또는\n문서가 비었거나\nlimit <= 0?}
    D -- 예 --> E[빈 프롬프트 반환\nstrategy: none]
    D -- 아니오 --> F{Config가 설정되었는가?}
    F -- 예 --> G[selectRelevantAutoMemoryDocumentsByModel\n사이드 쿼리로 모델에게 선택 요청]
    G --> H{모델 결과 반환?}
    H -- 문서 있음 --> I[strategy: model]
    H -- 문서 없음 --> J[strategy: none\n빈 프롬프트 반환]
    G -- "실패/예외" --> K[휴리스틱 선택으로 폴백]
    F -- 아니오 --> K
    K --> L[쿼리 토큰화\n3글자 이상의 토큰 추출]
    L --> M[scoreDocument 점수 산출\n키워드 매칭 +2 / 유형 키워드 +1 / 내용 있음 +1]
    M --> N[점수 0 초과 문서 필터링\n점수 내림차순 정렬, Top 5 선택]
    N --> O{점수 있는 문서 존재?}
    O -- 예 --> P[strategy: heuristic]
    O -- 아니오 --> J
    I --> Q[buildRelevantAutoMemoryPrompt\nRelevant Memory 블록 구축]
    P --> Q
    Q --> R[시스템 프롬프트 조각 반환]
```

**점수 산출 규칙 (휴리스틱)**:

| 조건 | 가산점 |
| ------------------------- | -------- |
| 쿼리 토큰이 문서 내용에 나타남 | 토큰당 +2 |
| 쿼리 토큰이 해당 유형의 특징적 키워드임 | 토큰당 +1 |
| 문서 본문이 비어 있지 않음 | +1 |

**유형별 특징 키워드**:

* `user`: user, preference, background, role, concise
* `feedback`: feedback, rule, avoid, style, summary
* `project`: project, goal, event, deadline, release
* `reference`: reference, dashboard, ticket, doc, link

**프롬프트 구축 규칙**:

* 최대 5개 문서 주입 (`MAX_RELEVANT_DOCS`)
* 각 문서 본문은 최대 1,200자 (`MAX_DOC_BODY_CHARS`)
* 초과 시 잘림 알림 추가: "Note: Relevant memory truncated due to prompt budget."
* 문서 최신성 정보 포함 (파일 mtime 기준)

***

## 망각 (Forget)

### 트리거 시점

사용자가 수동으로 `/forget <query>` 명령어를 실행할 때 트리거됩니다.

### 망각 프로세스 (`forget.ts`)

```mermaid
flowchart TD
    A[forgetManagedAutoMemoryEntries\nquery + config] --> B[ensureAutoMemoryScaffold]
    B --> C[listIndexedForgetCandidates\n모든 파일의 모든 항목 스캔]
    C --> D[각 항목에 대해 고유 ID 생성\n단일 항목 파일: relativePath\n다중 항목 파일: relativePath:index]
    D --> E{Config가 설정되었는가?}
    E -- 예 --> F[selectByModel\n선택 프롬프트 구축\nside query (temperature=0)]
    F --> G{모델 선택 성공?}
    G -- 예 --> H[strategy: model]
    G -- 실패 --> I[selectByHeuristic\n키워드 매칭]
    E -- 아니오 --> I
    I --> J[strategy: heuristic]
    H --> K[선택된 후보들 순회]
    J --> K
    K --> L{entries.length == 1?}
    L -- 예 --> M[파일 전체 삭제\nfs.unlink]
    L -- 아니오 --> N[파일 내 항목 파싱\n대상 항목 제거\n재렌더링 후 저장]
    M --> O[removedEntries 기록]
    N --> O
    O --> P{수정된 주제가 있는가?}
    P -- 예 --> Q[bumpMetadata\nMEMORY.md 인덱스 재구축]
    P --> R[AutoMemoryForgetResult 반환]
    Q --> R
```

**항목 ID 설계**:

* 단일 항목 파일 (일반적인 경우): `relativePath` (예: `feedback/no-summary.md`)
* 다중 항목 파일: `relativePath:index` (예: `feedback/style.md:2`)
* 안정적인 ID를 사용함으로써 모델이 동일 파일 내의 다른 항목을 건드리지 않고 대상만 정확히 지울 수 있게 함

***

## 인덱스 재구축

`MEMORY.md`는 모든 주제 파일의 탐색 인덱스로, 각 추출 또는 통합 작업 후에 `rebuildManagedAutoMemoryIndex`에 의해 다시 작성됩니다.

```
- [사용자 선호도](user/preferences.md) — 사용자는 숙련된 Go 엔지니어이며 React를 처음 접함
- [피드백 규정](feedback/style.md) — 답변을 간결하게 유지하고 마지막에 요약하지 말 것
- [프로젝트 마일스톤](project/milestone.md) — 모바일 출시 브랜치 생성 전 병합 동결 기간
```

**인덱스 제한**:

* 한 줄 최대 150자 (초과 시 `…`로 잘림)
* 최대 200줄
* 총 크기 25,000바이트 이하

***

## 원격 측정 (Telemetry) 측정 지점

메모리 작업의 성능과 효과를 모니터링하기 위해 3가지 유형의 원격 측정 이벤트가 내장되어 있습니다.

### 추출 원격 측정

| 필드 | 유형 | 설명 |
| ---------------- | ------------------------- | --------------- |
| `trigger` | `'auto'` | 트리거 방식 (현재 자동만 지원) |
| `status` | `'completed'`\|`'failed'` | 실행 결과 |
| `patches_count` | number | 추출된 유효한 패치 수 |
| `touched_topics` | string[] | 기록된 메모리 유형 목록 |
| `duration_ms` | number | 총 소요 시간 (ms) |

### 통합(Dream) 원격 측정

| 필드 | 유형 | 설명 |
| ----------------- | --------------------------------- | --------------------- |
| `trigger` | `'auto'` | 트리거 방식 |
| `status` | `'updated'`\|`'noop'`\|`'failed'` | 실행 결과 |
| `deduped_entries` | number | 기계적 경로에서 중복 제거된 항목 수 |
| `touched_topics` | string[] | 수정된 메모리 유형 목록 |
| `duration_ms` | number | 총 소요 시간 (ms) |

### 회상 원격 측정

| 필드 | 유형 | 설명 |
| --------------- | ---------------------------------- | ------------ |
| `query_length` | number | 쿼리 문자열 길이 |
| `docs_scanned` | number | 스캔된 총 문서 수 |
| `docs_selected` | number | 최종 주입된 문서 수 |
| `strategy` | `'none'`\|`'heuristic'`\|`'model'` | 선택 전략 |
| `duration_ms` | number | 총 소요 시간 (ms) |

***

## 관련 소스 파일 인덱스

| 파일 | 책임 |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `packages/core/src/memory/types.ts` | 유형 정의: `AutoMemoryType`, `AutoMemoryMetadata`, `AutoMemoryExtractCursor` |
| `packages/core/src/memory/paths.ts` | 경로 계산: `getAutoMemoryRoot`, `isAutoMemPath`, 각종 경로 헬퍼 |
| `packages/core/src/memory/store.ts` | 스캐폴딩 초기화: `ensureAutoMemoryScaffold`, 인덱스/메타데이터 읽기 및 쓰기 |
| `packages/core/src/memory/scan.ts` | 주제 파일 스캔: `scanAutoMemoryTopicDocuments`, 프론트매터 파싱 |
| `packages/core/src/memory/entries.ts` | 항목 파싱 및 렌더링: `parseAutoMemoryEntries`, `renderAutoMemoryBody` |
| `packages/core/src/memory/extract.ts` | 핵심 추출 로직: `runAutoMemoryExtract`, 커서 관리, 패치 중복 제거 |
| `packages/core/src/memory/extractScheduler.ts` | 추출 스케줄러: `ManagedAutoMemoryExtractRuntime`, 큐/상태 머신 |
| `packages/core/src/memory/extractionAgentPlanner.ts` | 추출 에이전트: `runAutoMemoryExtractionByAgent` |
| `packages/core/src/memory/dream.ts` | 핵심 통합 로직: `runManagedAutoMemoryDream`, 에이전트 경로 + 기계적 중복 제거 |
| `packages/core/src/memory/dreamScheduler.ts` | 통합 스케줄러: `ManagedAutoMemoryDreamRuntime`, 게이트 체크, 락 관리 |
| `packages/core/src/memory/dreamAgentPlanner.ts` | 통합 에이전트: `planManagedAutoMemoryDreamByAgent` |
| `packages/core/src/memory/recall.ts` | 회상 로직: `resolveRelevantAutoMemoryPromptForQuery`, 휴리스틱 + 모델 듀얼 경로 |
| `packages/core/src/memory/forget.ts` | 망각 로직: `forgetManagedAutoMemoryEntries`, 후보 생성 + 정밀 삭제 |
| `packages/core/src/memory/indexer.ts` | 인덱스 재구축: `rebuildManagedAutoMemoryIndex`, `buildManagedAutoMemoryIndex` |
| `packages/core/src/memory/prompt.ts` | 시스템 프롬프트 템플릿: 메모리 유형 설명, 형식 예시, 사용 규정 |
| `packages/core/src/memory/governance.ts` | 거버넌스 제안 유형: `AutoMemoryGovernanceSuggestionType` |
| `packages/core/src/memory/state.ts` | 추출 실행 상태: `isExtractRunning`, `markExtractRunning`, `clearExtractRunning` |
| `packages/core/src/memory/memoryAge.ts` | 신선도 텍스트: `memoryAge`, `memoryFreshnessText` |
