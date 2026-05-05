# PromptSuggestion 이행현황

> 모든 패키지에서 프롬프트 제안(NES) 기능의 구현 상태를 추적합니다.

## 핵심 모듈(`packages/core/src/followup/`)

| 요소                       | 상태   | 개요    | 설명                                                  |
| ------------------------ | ---- | ----- | --------------------------------------------------- |
| `followupState.ts`       | ✅ 완료 | \~230 | 타이머/디바운스를 갖춘 프레임워크에 구애받지 않는 컨트롤러                    |
| `suggestionGenerator.ts` | ✅ 완료 | \~260 | LLM 생성 + 12개 필터 규칙 + 분기 쿼리 지원                       |
| `forkedQuery.ts`         | ✅ 완료 | \~240 | CacheSafeParams + createForkedChat + runForkedQuery |
| `overlayFs.ts`           | ✅ 완료 | \~140 | 기록 중 복사 오버레이 파일 시스템                                 |
| `speculationToolGate.ts` | ✅ 완료 | \~150 | AST 쉘 파서를 사용한 Tool Boundary 적용                              |
| `speculation.ts`         | ✅ 완료 | \~540 | 파이프라인 제안 + 모델 재정의를 갖춘 추측 엔진                         |

## CLI 통합(`packages/cli/`)

| 요소                           | 상태   | 설명                                |
| ---------------------------- | ---- | --------------------------------- |
| `AppContainer.tsx`           | ✅ 완료 | 제안 생성, 추측 수명주기, UI 렌더링            |
| `InputPrompt.tsx`            | ✅ 완료 | Tab/Enter/오른쪽 화살표 수락, 닫기 + 중단     |
| `Composer.tsx`               | ✅ 완료 | Props 전달                            |
| `UIStateContext.tsx`         | ✅ 완료 | PromptSuggestion + DismissPromptSuggestion                 |
| `useFollowupSuggestions.tsx` | ✅ 완료 | 텔레메트리 + 키 입력 추적 기능을 갖춘 React Hook |
| `settingsSchema.ts`          | ✅ 완료 | 3가지 기능 플래그 + fastModel 설정         |
| `settings.schema.json`       | ✅ 완료 | VSCode 설정 스키마                     |

## WebUI 통합(`packages/webui/`)

| 요소                          | 상태   | 설명                             |
| --------------------------- | ---- | ------------------------------ |
| `InputForm.tsx`             | ✅ 완료 | Tab/Enter/오른쪽 화살표 + 명시적 텍스트 제출 |
| `useFollowupSuggestions.ts` | ✅ 완료 | onOutcome을 지원하는 React Hook     |
| `followup.ts`               | ✅ 완료 | 하위 경로 항목                       |
| `components.css`            | ✅ 완료 | 고스트 텍스트 스타일링                   |
| `vite.config.followup.ts`   | ✅ 완료 | 별도의 빌드 구성                      |

## 텔레메트리(`packages/core/src/telemetry/`)

| 요소                      | 상태   | 설명               |
| ----------------------- | ---- | ---------------- |
| `PromptSuggestionEvent` | ✅ 완료 | 10개 필드           |
| `SpeculationEvent`      | ✅ 완료 | 7개 필드            |
| `logPromptSuggestion()` | ✅ 완료 | OpenTelemetry 로거 |
| `logSpeculation()`      | ✅ 완료 | OpenTelemetry 로거 |

## 테스트 범위

| 테스트 파일                        | 테스트 | 설명                                          |
| ----------------------------- | --- | ------------------------------------------- |
| `followupState.test.ts`       | 14  | 컨트롤러 타이머, 디바운스, 콜백 수락, onOutcome, 지우기       |
| `suggestionGenerator.test.ts` | 16  | 12개 필터 규칙 모두 + 엣지 케이스 + 거짓 긍정               |
| `overlayFs.test.ts`           | 15  | COW 쓰기, 읽기 해결, 적용, 정리, 경로 탐색                |
| `speculationToolGate.test.ts` | 27  | 도구 카테고리, 승인 모드, 쉘 AST, 경로 재작성               |
| `forkedQuery.test.ts`         | 6   | 캐시 매개변수 저장/가져오기/지우기, 딥 클론, 버전 감지            |
| `speculation.test.ts`         | 7   | verifyToolResultPairing 엣지 케이스              |
| `smoke.test.ts`               | 21  | 크로스 모듈 E2E: 필터 + 오버레이 + toolGate + 캐시 + 페어링 |
| `InputPrompt.test.tsx`        | 4   | Tab, Enter+제출, 오른쪽 화살표, 완료 가드               |

## 감사 내역

| 라운드          | 발견된 문제     | 해결된 문제                          |
| ----------- | ---------- | ------------------------------- |
| R1-R4       | 10         | 10 (규칙 엔진 → LLM, 상태 단순화)        |
| R5-R6       | 2          | 2(키 바인딩 충돌 입력, 오른쪽 화살표 텔레메트리)   |
| R7-R8       | 3          | 3(WebUI 텔레메트리, 데드 유형, 테스트 커버리지) |
| R9          | 0          | — (수렴)                          |
| R10-R11     | 1          | 1(historyManager 하위)            |
| R12-R13     | 1          | 1(평가 정규식 단어 경계)                 |
| 1+2단계 R1-R4 | 20+        | 20+(권한 우회, 오버레이 안전, 경쟁 조건)      |
| **총**       | **37개 이상** | **37개 이상**                      |

## 클로드 코드 정렬

| 특징                      | 조정    | 메모                     |
| ----------------------- | ----- | ---------------------- |
| 프롬프트 텍스트                | 100%  | 동일(브랜드 이름만 해당)         |
| 12가지 필터 규칙              | 100%+ | \b 단어 경계 개선            |
| UI 상호 작용(Tab/Enter/오른쪽) | 100%  |                        |
| 가드 조건                   | 100%  | 체크 13개                 |
| 텔레메트리                   | 100%  | 10+7개 필드               |
| 캐시 공유                   | ✅     | DashScope 캐시\_제어       |
| 추측                      | ✅     | COW 오버레이 + 툴 게이팅       |
| 파이프라인 제안                | ✅     | 추측 완료 후 생성됨            |
| 상태 관리                   | 100%+ | 컨트롤러 패턴, Object.freeze |
