import { app } from './app.js';
import { env } from './config/env.config.js';
import { connectDB } from './database/connectDB.js';
import { initializeSocket } from './sockets/socket.config.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`Healthiffy API listening on port ${env.port}`);
  });
  initializeSocket(server);

  const shutdown = () => {
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
