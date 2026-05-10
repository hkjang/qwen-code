# 통합 테스트

이 문서는 이 프로젝트에 사용된 통합 테스트 프레임워크에 대한 정보를 제공합니다.

## 개요

통합 테스트는 Qwen Code의 엔드투엔드 기능을 검증하도록 설계되었습니다. 통제된 환경에서 빌드된 바이너리를 실행하고 파일 시스템과 상호 작용할 때 예상대로 작동하는지 확인합니다.

이 테스트는 다음 위치에 있습니다.`integration-tests`디렉토리에 있으며 사용자 정의 테스트 실행기를 사용하여 실행됩니다.

## 테스트 실행

통합 테스트는 기본값의 일부로 실행되지 않습니다.`npm run test`명령. 이는 다음을 사용하여 명시적으로 실행되어야 합니다.`npm run test:integration:all`스크립트.

다음 단축키를 사용하여 통합 테스트를 실행할 수도 있습니다.

```bash
npm run test:e2e
```

## 특정 테스트 세트 실행

테스트 파일의 하위 집합을 실행하려면 다음을 사용할 수 있습니다.`npm run <integration test command> <file_name1> ....`여기서 <통합 테스트 명령>은 다음 중 하나입니다.`test:e2e`또는`test:integration*`그리고`<file_name>`다음 중 하나입니다`.test.js`에 있는 파일`integration-tests/`예배 규칙서. 예를 들어 다음 명령이 실행됩니다.`list_directory.test.js`그리고`write_file.test.js`:

```bash
npm run test:e2e list_directory write_file
```

### 이름으로 단일 테스트 실행

이름으로 단일 테스트를 실행하려면`--test-name-pattern`깃발:

```bash
npm run test:e2e -- --test-name-pattern "reads a file"
```

### 모든 테스트 실행

전체 통합 테스트 모음을 실행하려면 다음 명령을 사용하십시오.

```bash
npm run test:integration:all
```

### 샌드박스 매트릭스

그만큼`all`명령은 다음에 대한 테스트를 실행합니다.`no sandboxing`,`docker`그리고`podman`.
다음 명령을 사용하여 각 개별 유형을 실행할 수 있습니다.

```bash
npm run test:integration:sandbox:none
```

```bash
npm run test:integration:sandbox:docker
```

```bash
npm run test:integration:sandbox:podman
```

## 진단

통합 테스트 실행기는 테스트 실패를 추적하는 데 도움이 되는 여러 가지 진단 옵션을 제공합니다.

### 테스트 출력 유지

검사를 위해 테스트 실행 중에 생성된 임시 파일을 보존할 수 있습니다. 이는 파일 시스템 작업과 관련된 문제를 디버깅하는 데 유용합니다.

테스트 출력 설정을 유지하려면`KEEP_OUTPUT`환경 변수`true`.

```bash
KEEP_OUTPUT=true npm run test:integration:sandbox:none
```

출력이 유지되면 테스트 실행기는 테스트 실행을 위한 고유 디렉터리 경로를 인쇄합니다.

### 자세한 출력

더 자세한 디버깅을 위해서는 다음을 설정하세요.`VERBOSE`환경 변수`true`.

```bash
VERBOSE=true npm run test:integration:sandbox:none
```

사용시`VERBOSE=true`그리고`KEEP_OUTPUT=true`동일한 명령에서 출력은 콘솔로 스트리밍되고 테스트 임시 디렉터리 내의 로그 파일에도 저장됩니다.

자세한 출력은 로그 소스를 명확하게 식별할 수 있도록 형식이 지정됩니다.

```
--- TEST: <log dir>:<test-name> ---
... output from the qwen command ...
--- END TEST: <log dir>:<test-name> ---
```

## 린팅 및 서식 지정

코드 품질과 일관성을 보장하기 위해 통합 테스트 파일은 기본 빌드 프로세스의 일부로 린트됩니다. Linter와 Auto-Fixer를 수동으로 실행할 수도 있습니다.

### 린터 실행

Linting 오류를 확인하려면 다음 명령을 실행하십시오.

```bash
npm run lint
```

다음을 포함할 수 있습니다.`:fix`수정 가능한 Linting 오류를 자동으로 수정하려면 명령에 플래그를 지정하세요.

```bash
npm run lint:fix
```

## 디렉토리 구조

통합 테스트는 각 테스트 실행에 대해 고유한 디렉터리를 생성합니다.`.integration-tests`예배 규칙서. 이 디렉터리 내에 각 테스트 파일에 대한 하위 디렉터리가 생성되고, 그 안에 각 개별 테스트 사례에 대한 하위 디렉터리가 생성됩니다.

이 구조를 사용하면 특정 테스트 실행, 파일 또는 사례에 대한 아티팩트를 쉽게 찾을 수 있습니다.

```
.integration-tests/
└── <run-id>/
    └── <test-file-name>.test.js/
        └── <test-case-name>/
            ├── output.log
            └── ...other test artifacts...
```

## 지속적인 통합

통합 테스트가 항상 실행되도록 하기 위해 GitHub Actions 워크플로가 다음 위치에 정의되어 있습니다.`.github/workflows/e2e.yml`. 이 워크플로는 풀 요청에 대한 통합 테스트를 자동으로 실행합니다.`main`분기 또는 풀 요청이 병합 대기열에 추가될 때.

워크플로는 다양한 샌드박싱 환경에서 테스트를 실행하여 Qwen Code가 각각에서 테스트되는지 확인합니다.

- `sandbox:none`: 샌드박싱 없이 테스트를 실행합니다.
- `sandbox:docker`: Docker 컨테이너에서 테스트를 실행합니다.
- `sandbox:podman`: Podman 컨테이너에서 테스트를 실행합니다.
