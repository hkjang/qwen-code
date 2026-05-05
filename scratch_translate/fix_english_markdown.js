import fs from 'fs';
import path from 'path';

const translations = {
  'Typical Use Case': '일반적인 사용 사례',
  'Overview': '개요',
  'QuickStart': '빠른 시작',
  'Command Workflows': '명령 워크플로우',
  'Code analysis tool': '코드 분석 도구',
  'Ask a quick side question': '간단한 부가 질문 하기',
  'Composer still active': '작성기가 여전히 활성화됨',
  'Save a durable memory': '지속적인 메모리 저장',
  'ZhipuAI(智谱AI)': 'ZhipuAI (지푸AI)',
  'DingTalk(钉钉)': 'DingTalk (딩톡)',
  'DingTalk(딩톡)': 'DingTalk (딩톡)',
  'The path is typically': '경로는 일반적으로 다음과 같습니다',
  'The following versions are affected': '다음 버전이 영향을 받습니다',
  'What to do': '조치 사항',
  'Removed': '제거됨',
  'Previous (DashScope via built-in tool)': '이전 (내장 도구를 통한 DashScope)',
  'After (Alibaba Cloud Bailian WebSearch via MCP)': '이후 (MCP를 통한 Alibaba Cloud Bailian WebSearch)',
  'Old (Tavily via built-in tool)': '이전 (내장 도구를 통한 Tavily)',
  'New (Tavily via MCP)': '이후 (MCP를 통한 Tavily)',
  'Available Tools': '사용 가능한 도구',
  'Configuration': '설정',
  'Best for': '추천 대상',
  'Cost': '비용',
  'Documentation': '문서',
  'Repo': '저장소',
  'Alibaba Cloud Bailian WebSearch (Recommended)': 'Alibaba Cloud Bailian 웹 검색 (권장)',
  'GLM WebSearch Prime (ZhipuAI)': 'GLM 웹 검색 프라임 (ZhipuAI)',
  'Tavily WebSearch': 'Tavily 웹 검색',
  'CLI Command': 'CLI 명령',
  'Remote MCP': '원격 MCP',
  'Local NPX': '로컬 NPX',
  'Replace with your actual API key': '실제 API 키로 교체하세요',
  'Default': '기본값',
  'Description': '설명',
  'Prompt Body': '프롬프트 본문',
  'Required': '필수',
  'Optional': '선택',
  'Usage Example': '사용 예시',
  'Actual Effect': '실제 효과',
  'In shell command': '셸 명령 내에서',
  'Raw injection': '원시 주입',
  'Call Method': '호출 방법',
  'TOML Configuration': 'TOML 설정',
  'Scenario': '시나리오',
  'Dynamic content injection': '동적 콘텐츠 주입',
  'Static reference file': '정적 참조 파일',
  'Dynamic execution result': '동적 실행 결과',
  'User parameter injection': '사용자 매개변수 주입',
  'Security Mechanism': '보안 메커니즘',
  'Protection Effect': '보호 효과',
  'User Action': '사용자 작업',
  'Practice Point': '실습 포인트',
  'Recommended Approach': '권장 방법',
  'Avoid': '피해야 할 사항',
  'Namespace': '네임스페이스',
  'Global Commands': '전역 명령',
  'Project Commands': '프로젝트 명령',
  'File Path to Command Name Mapping Table': '파일 경로와 명령 이름 매핑 테이블',
  'Generated Command': '생성된 명령',
  'Example Call': '호출 예시',
  'Markdown File Format Specification (Recommended)': '마크다운 파일 형식 사양 (권장)',
  'TOML File Format (Deprecated)': 'TOML 파일 형식 (지원 중단)',
  'Parameter Processing Mechanism': '매개변수 처리 메커니즘',
  'Context-aware Injection': '컨텍스트 인식 주입',
  'Default Parameter Handling': '기본 매개변수 처리',
  'Shell Command Injection': '셸 명령 주입',
  'Dynamic Content Injection': '동적 콘텐츠 주입',
  'File Content Injection': '파일 콘텐츠 주입',
  'Actual Creation Example': '실제 생성 사례',
  'Step Table for Creating "Pure Function Refactoring" Command': '"순수 함수 리팩토링" 명령 생성 단계 표',
  'Task': '작업',
  'Command/Code': '명령/코드',
  'Custom Command Best Practices Summary': '사용자 정의 명령 모범 사례 요약',
  'Command Design Recommendations Table': '명령 설계 권장 사항 표',
  'Security Feature Reminder Table': '보안 기능 알림 표',
  'The command': '이 명령은',
  'This command': '이 명령은',
  'The following versions are affected': '다음 버전이 영향을 받습니다',
  'Affected versions': '영향을 받는 버전',
  'Influence': '영향',
  'Decision': '결정',
  'Change': '변경',
  'Design Decision': '설계 결정',
  ' طراحی 결정': '설계 결정', // In case of weird translation artifacts
};

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

function translateContent(content) {
  let newContent = content;
  // Sort keys by length descending to match longer phrases first
  const keys = Object.keys(translations).sort((a, b) => b.length - a.length);
  
  for (const en of keys) {
    const ko = translations[en];
    // Simple global replace for these common terms
    // We escape special characters for regex
    const escapedEn = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedEn, 'g');
    newContent = newContent.replace(regex, ko);
  }
  
  // Fix "그만큼" which is a common bad translation of "The"
  newContent = newContent.replace(/그만큼\s*\/([a-z]+)\s*명령/g, '/$1 명령');
  
  return newContent;
}

async function main() {
  const files = getFiles('docs');
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const translated = translateContent(content);
    if (content !== translated) {
      fs.writeFileSync(file, translated, 'utf-8');
      console.log(`Fixed English terms in ${file}`);
    }
  }
}

main();
