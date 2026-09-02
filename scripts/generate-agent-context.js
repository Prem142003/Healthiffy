import fs from 'fs';
import path from 'path';

const root = process.cwd();
const outputPath = path.join(root, 'scripts', 'agent-context-summary.json');

const directories = [
  'backend/src/controllers',
  'backend/src/services',
  'backend/src/models',
  'backend/src/routes',
  'frontend/src/pages',
  'frontend/src/components',
  'frontend/src/services',
  'frontend/src/redux'
];

const readDir = (directory) => {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name))
    .map((entry) => path.relative(root, path.join(directory, entry.name)))
    .sort();
};

const summary = {
  generatedAt: new Date().toISOString(),
  project: 'Healthiffy',
  directories: Object.fromEntries(
    directories.map((dir) => [dir, readDir(dir)])
  ),
  keyFiles: {
    backendEntry: 'backend/src/server.js',
    appEntry: 'backend/src/app.js',
    frontendEntry: 'frontend/src/main.jsx',
    authRoutes: 'backend/src/routes/auth.routes.js',
    paymentRoutes: 'backend/src/routes/payment.routes.js',
    subscriptionRoutes: 'backend/src/routes/subscription.routes.js',
    orderRoutes: 'backend/src/routes/order.routes.js',
    socketConfig: 'backend/src/sockets/socket.config.js',
    cashfreeService: 'backend/src/services/cashfree.service.js',
    cashfreeWebhookService: 'backend/src/services/cashfreeWebhook.service.js'
  }
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2) + '\n');
console.log(`Generated ${path.relative(root, outputPath)}`);
