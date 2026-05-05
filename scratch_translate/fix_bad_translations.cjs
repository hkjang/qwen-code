const fs = require('fs');
const path = require('path');

const mappings = [
  { from: /둥근/g, to: '라운드' },
  { from: /37세 이상/g, to: '37개 이상' },
  { from: /신속한 건설/g, to: '프롬프트 생성' },
  { from: /윤곽/g, to: '개요' },
  { from: /소품/g, to: '속성' },
  { from: /분야/g, to: '필드' },
  { from: /비행 전 검사/g, to: '프리플라이트 체크' },
  { from: /비행 전/g, to: '프리플라이트' },
  { from: /갈래 쿼리/g, to: '포크된 쿼리' },
  { from: /유령 텍스트/g, to: '고스트 텍스트' },
  { from: /변경log/g, to: '변경 이력' },
  { from: /회상/g, to: '리콜' },
  { from: /망각/g, to: '삭제' },
  { from: /측정 지점/g, to: '지표' },
  { from: /원격 측정/g, to: '텔레메트리' },
  { from: /신속한 구축/g, to: '프롬프트 구축' },
  { from: /이력관리/g, to: '이력 관리' },
  { from: /자원/g, to: '리소스' },
];

function processFile(fullPath) {
  let content = fs.readFileSync(fullPath, 'utf8');
  // DO NOT apply these fixes INSIDE mermaid blocks
  const parts = content.split('```mermaid');
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Outside mermaid
      for (const mapping of mappings) {
        parts[i] = parts[i].replace(mapping.from, mapping.to);
      }
    }
  }
  const newContent = parts.join('```mermaid');
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent);
    console.log(`Fixed: ${fullPath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.md')) {
      processFile(fullPath);
    }
  }
}

walk('docs');
['README.md', 'CONTRIBUTING.md', 'SECURITY.md'].forEach(file => {
  if (fs.existsSync(file)) processFile(file);
});
