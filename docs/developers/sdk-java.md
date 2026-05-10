# Qwen 코드 Java SDK

Qwen Code Java SDK는 Qwen Code 기능에 프로그래밍 방식으로 액세스하기 위한 최소 실험용 SDK입니다. Qwen Code CLI와 상호 작용할 수 있는 Java 인터페이스를 제공하므로 개발자는 Qwen Code 기능을 Java 애플리케이션에 통합할 수 있습니다.

## 요구사항

- 자바 >= 1.8
- Maven >= 3.6.0(소스에서 빌드용)
- qwen-code >= 0.5.0

### 종속성

- **벌채 반출**: ch.qos.logback:로그백-클래식
- **유용**: org.apache.commons:commons-lang3
- **JSON 처리**: com.alibaba.fastjson2:fastjson2
- **테스트**: JUnit 5(org.junit.jupiter:junit-jupiter)

## 설치

Maven에 다음 종속성을 추가합니다.`pom.xml`:

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>qwencode-sdk</artifactId>
    <version>{$version}</version>
</dependency>
```

또는 Gradle을 사용하는 경우`build.gradle`:

```gradle
implementation 'com.alibaba:qwencode-sdk:{$version}'
```

## 빌드 및 실행

### 빌드 명령

```bash
# Compile the project
mvn compile

# Run tests
mvn test

# Package the JAR
mvn package

# Install to local repository
mvn install
```

## 빠른 시작

SDK를 사용하는 가장 간단한 방법은`QwenCodeCli.simpleQuery()`방법:

```java
public static void runSimpleExample() {
    List<String> result = QwenCodeCli.simpleQuery("hello world");
    result.forEach(logger::info);
}
```

사용자 정의 전송 옵션을 사용한 고급 사용법:

```java
public static void runTransportOptionsExample() {
    TransportOptions options = new TransportOptions()
            .setModel("qwen3-coder-flash")
            .setPermissionMode(PermissionMode.AUTO_EDIT)
            .setCwd("./")
            .setEnv(new HashMap<String, String>() {{put("CUSTOM_VAR", "value");}})
            .setIncludePartialMessages(true)
            .setTurnTimeout(new Timeout(120L, TimeUnit.SECONDS))
            .setMessageTimeout(new Timeout(90L, TimeUnit.SECONDS))
            .setAllowedTools(Arrays.asList("read_file", "write_file", "list_directory"));

    List<String> result = QwenCodeCli.simpleQuery("who are you, what are your capabilities?", options);
    result.forEach(logger::info);
}
```

사용자 정의 콘텐츠 소비자를 사용한 스트리밍 콘텐츠 처리의 경우:

```java
public static void runStreamingExample() {
    QwenCodeCli.simpleQuery("who are you, what are your capabilities?",
            new TransportOptions().setMessageTimeout(new Timeout(10L, TimeUnit.SECONDS)), new AssistantContentSimpleConsumers() {

                @Override
                public void onText(Session session, TextAssistantContent textAssistantContent) {
                    logger.info("Text content received: {}", textAssistantContent.getText());
                }

                @Override
                public void onThinking(Session session, ThinkingAssistantContent thinkingAssistantContent) {
                    logger.info("Thinking content received: {}", thinkingAssistantContent.getThinking());
                }

                @Override
                public void onToolUse(Session session, ToolUseAssistantContent toolUseContent) {
                    logger.info("Tool use content received: {} with arguments: {}",
                            toolUseContent, toolUseContent.getInput());
                }

                @Override
                public void onToolResult(Session session, ToolResultAssistantContent toolResultContent) {
                    logger.info("Tool result content received: {}", toolResultContent.getContent());
                }

                @Override
                public void onOtherContent(Session session, AssistantContent<?> other) {
                    logger.info("Other content received: {}", other);
                }

                @Override
                public void onUsage(Session session, AssistantUsage assistantUsage) {
                    logger.info("Usage information received: Input tokens: {}, Output tokens: {}",
                            assistantUsage.getUsage().getInputTokens(), assistantUsage.getUsage().getOutputTokens());
                }
            }.set기본값PermissionOperation(Operation.allow));
    logger.info("Streaming example completed.");
}
```

다른 예는 src/test/java/com/alibaba/qwen/code/cli/example을 참조하세요.

## 건축학

SDK는 계층화된 아키텍처를 따릅니다.

- **API 레이어**: 주요 진입점을 제공합니다.`QwenCodeCli`기본 사용법을 위한 간단한 정적 메서드가 포함된 클래스
- **세션 계층**: Qwen Code CLI와의 통신 세션을 관리합니다.`Session`수업
- **전송 계층**: SDK와 CLI 프로세스 간의 통신 메커니즘을 처리합니다(현재는 다음을 통한 프로세스 전송을 사용함).`ProcessTransport`)
- **프로토콜 계층**: CLI 프로토콜을 기반으로 통신을 위한 데이터 구조를 정의합니다.
- **유틸리티**: 동시 실행, 시간 초과 처리 및 오류 관리를 위한 공통 유틸리티

## 주요 특징

### 권한 모드

SDK는 도구 실행 제어를 위한 다양한 권한 모드를 지원합니다.

- **`default`**: 쓰기 도구는 다음을 통해 승인되지 않으면 거부됩니다.`canUseTool`콜백 또는`allowedTools`. 읽기 전용 도구는 확인 없이 실행됩니다.
- **`plan`**: 모든 쓰기 도구를 차단하고 AI가 먼저 계획을 제시하도록 지시합니다.
- **`auto-edit`**: 편집 도구(edit, write_file)는 자동 승인되지만 다른 도구는 확인이 필요합니다.
- **`yolo`**: 모든 도구는 확인 없이 자동으로 실행됩니다.

### 세션 이벤트 소비자 및 보조 콘텐츠 소비자

SDK는 CLI에서 이벤트와 콘텐츠를 처리하기 위한 두 가지 주요 인터페이스를 제공합니다.

#### SessionEventConsumers 인터페이스

그만큼`SessionEventConsumers`인터페이스는 세션 중에 다양한 유형의 메시지에 대한 콜백을 제공합니다.

- `onSystemMessage`: CLI의 시스템 메시지를 처리합니다(Session 및 SDKSystemMessage 수신).
- `onResultMessage`: CLI의 결과 메시지를 처리합니다. (Session 및 SDKResultMessage 수신)
- `onAssistantMessage`: 보조 메시지(AI 응답) 처리(Session 및 SDKAssistantMessage 수신)
- `onPartialAssistantMessage`: 스트리밍 중 부분 보조 메시지 처리(Session 및 SDKPartialAssistantMessage 수신)
- `onUserMessage`: 사용자 메시지 처리(Session 및 SDKUserMessage 수신)
- `onOtherMessage`: 다른 유형의 메시지를 처리합니다. (Session 및 String 메시지 수신)
- `onControlResponse`: 제어 응답을 처리합니다(Session 및 CLIControlResponse 수신).
- `onControlRequest`: 제어 요청 처리(Session 및 CLIControlRequest 수신, CLIControlResponse 반환)
- `onPermissionRequest`: 권한 요청 처리(Session 및 CLIControlRequest 수신)<CLIControlPermissionRequest>, 동작 반환)

#### AssistantContentConsumers 인터페이스

그만큼`AssistantContentConsumers`인터페이스는 보조 메시지 내의 다양한 유형의 콘텐츠를 처리합니다.

- `onText`: 텍스트 콘텐츠를 처리합니다(Session 및 TextAssistantContent 수신).
- `onThinking`: 사고 콘텐츠 처리(Session 및 ThinkingAssistantContent 수신)
- `onToolUse`: 도구 사용 내용을 처리합니다. (Session 및 ToolUseAssistantContent 수신)
- `onToolResult`: 도구 결과 콘텐츠를 처리합니다(Session 및 ToolResultAssistantContent 수신).
- `onOtherContent`: 다른 콘텐츠 유형을 처리합니다(Session 및 AssistantContent 수신).
- `onUsage`: 사용 정보 처리 (Session 및 AssistantUsage 수신)
- `onPermissionRequest`: 권한 요청 처리(Session 및 CLIControlPermissionRequest 수신, 동작 반환)
- `onOtherControlRequest`: 기타 제어 요청 처리(Session 및 ControlRequestPayload 수신, ControlResponsePayload 반환)

#### 인터페이스 간의 관계

**이벤트 계층 구조에 대한 중요 참고 사항:**

- `SessionEventConsumers`은**높은 수준의**다양한 메시지 유형(시스템, 보조자, 사용자 등)을 처리하는 이벤트 프로세서
- `AssistantContentConsumers`은**낮은 수준의**보조 메시지(텍스트, 도구, 사고 등) 내에서 다양한 유형의 콘텐츠를 처리하는 콘텐츠 프로세서

**프로세서 관계:**

- `SessionEventConsumers`→`AssistantContentConsumers`(SessionEventConsumers는 AssistantContentConsumers를 사용하여 보조 메시지 내의 콘텐츠를 처리합니다.)

**이벤트 파생 관계:**

- `onAssistantMessage`→`onText`,`onThinking`,`onToolUse`,`onToolResult`,`onOtherContent`,`onUsage`
- `onPartialAssistantMessage`→`onText`,`onThinking`,`onToolUse`,`onToolResult`,`onOtherContent`
- `onControlRequest`→`onPermissionRequest`,`onOtherControlRequest`

**이벤트 시간 초과 관계:**

각 이벤트 핸들러 메서드에는 해당 특정 이벤트에 대한 시간 초과 동작을 사용자 정의할 수 있는 해당 시간 초과 메서드가 있습니다.

- `onSystemMessage`←`onSystemMessageTimeout`
- `onResultMessage`←`onResultMessageTimeout`
- `onAssistantMessage`←`onAssistantMessageTimeout`
- `onPartialAssistantMessage`←`onPartialAssistantMessageTimeout`
- `onUserMessage`←`onUserMessageTimeout`
- `onOtherMessage`←`onOtherMessageTimeout`
- `onControlResponse`←`onControlResponseTimeout`
- `onControlRequest`←`onControlRequestTimeout`

AssistantContentConsumers 시간 초과 방법의 경우:

- `onText`←`onTextTimeout`
- `onThinking`←`onThinkingTimeout`
- `onToolUse`←`onToolUseTimeout`
- `onToolResult`←`onToolResultTimeout`
- `onOtherContent`←`onOtherContentTimeout`
- `onPermissionRequest`←`onPermissionRequestTimeout`
- `onOtherControlRequest`←`onOtherControlRequestTimeout`

**기본 시간 초과 값:**

- `SessionEventSimpleConsumers`기본 시간 초과: 180초(Timeout.TIMEOUT_180_SECONDS)
- `AssistantContentSimpleConsumers`기본 시간 초과: 60초(Timeout.TIMEOUT_60_SECONDS)

**시간 초과 계층 요구 사항:**

올바른 작동을 위해서는 다음과 같은 시간 초과 관계가 유지되어야 합니다.

- `onAssistantMessageTimeout`반환 값은 다음보다 커야 합니다.`onTextTimeout`,`onThinkingTimeout`,`onToolUseTimeout`,`onToolResultTimeout`, 그리고`onOtherContentTimeout`반환 값
- `onControlRequestTimeout`반환 값은 다음보다 커야 합니다.`onPermissionRequestTimeout`그리고`onOtherControlRequestTimeout`반환 값

### 운송 옵션

그만큼`TransportOptions`클래스를 사용하면 SDK가 Qwen Code CLI와 통신하는 방법을 구성할 수 있습니다.

- `pathToQwenExecutable`: Qwen Code CLI 실행 파일의 경로
- `cwd`: CLI 프로세스의 작업 디렉터리
- `model`: 세션에 사용할 AI 모델
- `permissionMode`: 도구 실행을 제어하는 ​​권한 모드
- `env`: CLI 프로세스에 전달할 환경 변수
- `maxSessionTurns`: 세션 내 대화 차례 수를 제한합니다.
- `coreTools`: AI가 사용할 수 있어야 하는 핵심 도구 목록
- `excludeTools`: AI가 사용할 수 없도록 제외할 도구 목록
- `allowedTools`: 추가 확인 없이 사전에 사용이 승인된 도구 목록
- `authType`: 세션에 사용할 인증 유형
- `includePartialMessages`: 스트리밍 응답 중 부분 메시지 수신을 활성화합니다.
- `turnTimeout`: 대화 전체 차례에 대한 시간 초과
- `messageTimeout`: 한 차례 내 개별 메시지의 시간 초과
- `resumeSessionId`: 재개할 이전 세션의 ID
- `otherOptions`: CLI에 전달할 추가 명령줄 옵션

### 세션 제어 기능

- **세션 생성**: 사용`QwenCodeCli.newSession()`사용자 정의 옵션으로 새 세션을 생성하려면
- **세션 관리**:`Session`클래스는 프롬프트를 보내고, 응답을 처리하고, 세션 상태를 관리하는 메서드를 제공합니다.
- **세션 정리**: 항상 다음을 사용하여 세션을 닫습니다.`session.close()`CLI 프로세스를 올바르게 종료하려면
- **세션 재개**: 사용`setResumeSessionId()`\~에`TransportOptions`이전 세션을 재개하려면
- **세션 중단**: 사용`session.interrupt()`현재 실행 중인 프롬프트를 중단하려면
- **동적 모델 전환**: 사용`session.setModel()`세션 중에 모델을 변경하려면
- **동적 권한 모드 전환**: 사용`session.setPermissionMode()`세션 중에 권한 모드를 변경하려면

### 스레드 풀 구성

The SDK uses a thread pool for managing concurrent operations with the following default configuration:

- **코어 풀 크기**: 30 threads
- **최대 풀 크기**: 스레드 100개
- **연결 유지 시간**: 60초
- **대기열 용량**: 300개 작업(LinkedBlockingQueue 사용)
- **스레드 이름 지정**: "qwen_code_cli-pool-{번호}"
- **데몬 스레드**: 거짓
- **거부된 실행 핸들러**: CallerRuns정책

## 오류 처리

SDK는 다양한 오류 시나리오에 대한 특정 예외 유형을 제공합니다.

- `SessionControlException`: 세션 제어(생성, 초기화 등)에 문제가 있는 경우 발생합니다.
- `SessionSendPromptException`: 메시지를 보내거나 응답을 받는 데 문제가 있는 경우 발생합니다.
- `SessionClosedException`: 닫힌 세션을 사용하려고 할 때 발생합니다.

## 자주 묻는 질문/문제 해결

### Q: Qwen CLI를 별도로 설치해야 합니까?

A: 예, Qwen CLI 0.5.5 이상이 필요합니다.

### Q: 어떤 Java 버전이 지원됩니까?

A: SDK에는 Java 1.8 이상이 필요합니다.

### Q: 장기 실행 요청을 어떻게 처리합니까?

A: SDK에는 시간 초과 유틸리티가 포함되어 있습니다. 다음을 사용하여 시간 초과를 구성할 수 있습니다.`Timeout`수업`TransportOptions`.

### Q: 일부 도구가 실행되지 않는 이유는 무엇입니까?

A: 이는 권한 모드 때문일 가능성이 높습니다. 권한 모드 설정을 확인하고 사용을 고려하세요.`allowedTools`특정 도구를 사전 승인합니다.

### Q: 이전 세션을 재개하려면 어떻게 해야 합니까?

답변:`setResumeSessionId()`방법`TransportOptions`이전 세션을 재개하려면

### Q: CLI 프로세스에 대한 환경을 사용자 지정할 수 있습니까?

A: 예, 다음을 사용하세요.`setEnv()`방법`TransportOptions`환경 변수를 CLI 프로세스에 전달합니다.

## 특허

Apache-2.0 - 참조[특허](./LICENSE)자세한 내용은.
