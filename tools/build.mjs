// Gộp các ES module trong js/ thành 1 file script thường: js/app.bundle.js
// → nhấp đúp index.html (file://) vẫn chạy, vì trình duyệt chặn <script type="module"> khi mở từ file.
// Chạy lại sau mỗi lần sửa code JS:   node tools/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const JS = join(dirname(fileURLToPath(import.meta.url)), '..', 'js');
const ENTRY = 'app';
const modules = new Map();   // name → { code, deps, exports }

function load(name) {
  if (modules.has(name)) return;
  let src = readFileSync(join(JS, `${name}.js`), 'utf8');
  const deps = [];
  const exportsList = [];

  // import * as X from './a.js'
  src = src.replace(/^import\s+\*\s+as\s+([\w$]+)\s+from\s+'\.\/([\w-]+)\.js';?/gm, (_, id, dep) => {
    deps.push(dep);
    return `const ${id} = __m['${dep}'];`;
  });
  // import { a, b as c } from './a.js'
  src = src.replace(/^import\s+\{([^}]*)\}\s+from\s+'\.\/([\w-]+)\.js';?/gm, (_, list, dep) => {
    deps.push(dep);
    const names = list.split(',').map((s) => s.trim()).filter(Boolean)
      .map((s) => s.replace(/^([\w$]+)\s+as\s+([\w$]+)$/, '$1: $2'));
    return `const { ${names.join(', ')} } = __m['${dep}'];`;
  });
  if (/^\s*import\b/m.test(src)) throw new Error(`${name}.js: câu import không hỗ trợ`);

  // export function / async function / const
  src = src.replace(/^export\s+(async\s+function|function)\s+([\w$]+)/gm, (_, kw, id) => {
    exportsList.push(id);
    return `${kw} ${id}`;
  });
  src = src.replace(/^export\s+const\s+([\w$]+)/gm, (_, id) => {
    exportsList.push(id);
    return `const ${id}`;
  });
  if (/^\s*export\b/m.test(src)) throw new Error(`${name}.js: câu export không hỗ trợ (chỉ dùng export function/const)`);

  modules.set(name, { code: src, deps, exports: exportsList });
  deps.forEach(load);
}

// Sắp thứ tự: module phụ thuộc được chạy trước
function order() {
  const out = [], seen = new Set(), stack = new Set();
  const visit = (n) => {
    if (seen.has(n)) return;
    if (stack.has(n)) throw new Error(`Vòng lặp import ở ${n}.js`);
    stack.add(n);
    modules.get(n).deps.forEach(visit);
    stack.delete(n);
    seen.add(n);
    out.push(n);
  };
  visit(ENTRY);
  return out;
}

// Mã Google Apps Script (tools/google-apps-script/Code.gs) → js/gas-code.js
// để nút "Chép mã cho Google" trong Cài đặt luôn chép đúng bản mới nhất.
const gas = readFileSync(join(JS, '..', 'tools', 'google-apps-script', 'Code.gs'), 'utf8');
writeFileSync(join(JS, 'gas-code.js'),
  `// TỰ ĐỘNG TẠO từ tools/google-apps-script/Code.gs bởi tools/build.mjs — đừng sửa trực tiếp.\nexport const GAS_CODE = ${JSON.stringify(gas)};\n`);

load(ENTRY);
const parts = order().map((n) => {
  const m = modules.get(n);
  return `// ===== js/${n}.js =====\n__m['${n}'] = (() => {\n${m.code.trimEnd()}\nreturn { ${m.exports.join(', ')} };\n})();`;
});

const out = `// TỰ ĐỘNG TẠO bởi tools/build.mjs — đừng sửa trực tiếp file này.\n// Sửa các file trong js/ rồi chạy:  node tools/build.mjs\n(() => {\n'use strict';\nconst __m = {};\n${parts.join('\n\n')}\n})();\n`;
writeFileSync(join(JS, 'app.bundle.js'), out);
console.log(`Đã gộp ${parts.length} file → js/app.bundle.js (${(out.length / 1024).toFixed(0)} KB)`);
