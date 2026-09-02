const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'REPO_MAP.md');

const EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.cache',
  '__pycache__',
  '.next',
  '.turbo',
  '.vite',
  '.parcel-cache'
]);

const SOURCE_FILE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

const REPO_ROOTS = [
  'backend/src/config',
  'backend/src/constants',
  'backend/src/controllers',
  'backend/src/database',
  'backend/src/helpers',
  'backend/src/middlewares',
  'backend/src/models',
  'backend/src/routes',
  'backend/src/services',
  'backend/src/sockets',
  'backend/src/utils',
  'backend/src/validators',
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/redux',
  'frontend/src/routes',
  'frontend/src/services',
  'frontend/src/styles'
];

const isSourceFile = (fileName) => SOURCE_FILE_EXTENSIONS.has(path.extname(fileName).toLowerCase());

const walkDirectory = (directory, depth = 0, maxDepth = 3) => {
  if (!fs.existsSync(directory)) return [];

  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => {
      if (EXCLUDED_DIRS.has(entry.name)) return false;
      if (entry.name.startsWith('.')) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const lines = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (depth < maxDepth) {
        lines.push(`${'  '.repeat(depth)}- ${entry.name}/`);
        lines.push(...walkDirectory(absolutePath, depth + 1, maxDepth));
      } else {
        lines.push(`${'  '.repeat(depth)}- ${entry.name}/`);
      }
      continue;
    }

    if (entry.isFile() && isSourceFile(entry.name)) {
      lines.push(`${'  '.repeat(depth)}- ${entry.name}`);
    }
  }

  return lines;
};

const renderRootSection = (title, rootPath) => {
  const relativeRoot = path.relative(root, rootPath);
  const lines = [`## ${title}`];

  if (fs.existsSync(rootPath)) {
    lines.push(`### ${relativeRoot}`);
    lines.push(...walkDirectory(rootPath, 1, 3));
  } else {
    lines.push(`### ${relativeRoot}`);
    lines.push('- Not present in repository');
  }

  return lines.join('\n');
};

const header = [
  '# Repository Map',
  '',
  '> AUTO-GENERATED — DO NOT EDIT MANUALLY',
  '> Run `npm run update:agent-context` to regenerate.',
  ''
].join('\n');

const keyFiles = [
  'backend/src/server.js',
  'backend/src/app.js',
  'backend/src/routes/auth.routes.js',
  'backend/src/routes/order.routes.js',
  'backend/src/routes/payment.routes.js',
  'backend/src/routes/subscription.routes.js',
  'backend/src/services/cashfree.service.js',
  'backend/src/services/cashfreeWebhook.service.js',
  'backend/src/services/order.service.js',
  'backend/src/services/subscription.service.js',
  'frontend/src/main.jsx',
  'frontend/src/App.jsx',
  'frontend/src/redux/store.js',
  'frontend/src/services/api.js',
  'frontend/src/services/socket.js'
];

const sections = [
  renderRootSection('Backend', path.join(root, 'backend', 'src')),
  renderRootSection('Frontend', path.join(root, 'frontend', 'src')),
  '## Key files',
  ...keyFiles.map((file) => `- ${file}`)
].join('\n\n');

const content = `${header}\n\n${sections}\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, content);
console.log(`Generated ${path.relative(root, outputPath)}`);
