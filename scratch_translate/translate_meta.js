import fs from 'fs';
import path from 'path';

const translations = {
  'Architecture': '아키텍처',
  'Roadmap': '로드맵',
  'Contributing Guide': '기여 가이드',
  'Typescript SDK': 'Typescript SDK',
  'Python SDK (alpha)': 'Python SDK (알파)',
  'Java SDK (alpha)': 'Java SDK (알파)',
  'Channel Plugin Guide': '채널 플러그인 가이드',
  'Tools': '도구',
  'Overview': '개요',
  'QuickStart': '빠른 시작',
  'Command Workflows': '명령 워크플로우',
  'Features': '기능',
  'Configuration': '설정',
  'Extension': '확장',
  'Reference': '참조',
  'Support': '지원',
  'Visual Studio Code': 'Visual Studio Code',
  'Zed IDE': 'Zed IDE',
  'JetBrains IDEs': 'JetBrains IDE',
  'Github Actions': 'Github Actions',
  'Development': '개발',
  'Deployment': '배포',
  'Integration Tests': '통합 테스트',
  'Issue and PR Automation': 'Issue 및 PR 자동화',
  'Telemetry': '원격 측정',
  'npm': 'npm',
  'Authentication': '인증',
  'Model Providers': '모델 제공업체',
  'qwen-ignore': 'qwen-ignore',
  'Settings': '설정',
  'Themes': '테마',
  'Trusted Folders': '신뢰할 수 있는 폴더',
  'Extension Releasing': '확장 프로그램 릴리스',
  'Getting Started': '시작하기',
  'Introduction': '소개',
  'Approval Mode': '승인 모드',
  'Arena': '아레나',
  'Checkpointing': '체크포인트',
  'Code Review': '코드 리뷰',
  'Commands': '명령',
  'Dual Output': '듀얼 출력',
  'Followup Suggestions': '후속 제안',
  'Headless': '헤드리스',
  'Hooks': '훅',
  'LSP': 'LSP',
  'MCP': 'MCP',
  'Memory': '메모리',
  'Sandbox': '샌드박스',
  'Scheduled Tasks': '예약된 작업',
  'Skills': '스킬',
  'Status Line': '상태 줄',
  'Sub-agents': '서브 에이전트',
  'Tips': '팁',
  'Token Caching': '토큰 캐싱',
  'Tool Use Summaries': '도구 사용 요약',
  'Channels': '채널',
  'DingTalk': 'DingTalk',
  'Telegram': 'Telegram',
  'WeChat': 'WeChat',
  'Plugins': '플러그인',
  'IDE Integration': 'IDE 통합',
  'Keyboard Shortcuts': '키보드 단축키',
  'Terms of Service & Privacy': '서비스 약관 및 개인정보 보호',
  'Troubleshooting': '문제 해결',
  'Uninstall': '제거',
  'Command Line Interface': '명령줄 인터페이스',
  'Exit Plan Mode': '계획 모드 종료',
  'File System': '파일 시스템',
  'MCP Server': 'MCP 서버',
  'Multi-file': '다중 파일',
  'Shell': '셸',
  'Task': '작업',
  'Web Fetch': '웹 가져오기',
  'Web Search': '웹 검색',
  'Proxy Script': '프록시 스크립트'
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
      if (file.endsWith('_meta.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

function translateContent(content) {
  let newContent = content;
  for (const [en, ko] of Object.entries(translations)) {
    // Match ': "English"' or ': 'English'' or ': English' (if it's a key value)
    const regex = new RegExp(`:\\s*(['"])${en}(['"])`, 'g');
    newContent = newContent.replace(regex, `: $1${ko}$2`);
  }
  return newContent;
}

async function main() {
  const files = getFiles('docs');
  for (const file of files) {
    console.log(`Processing ${file}...`);
    const content = fs.readFileSync(file, 'utf-8');
    const translated = translateContent(content);
    if (content !== translated) {
      fs.writeFileSync(file, translated, 'utf-8');
      console.log(`Updated ${file}`);
    }
  }
}

main();
