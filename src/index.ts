import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { config } from './config/env';
import { ensureDirectories } from './utils/filesystem';
import logger from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { apiRateLimiter } from './middleware/rateLimiter';
import { mediaRouter } from './routes/media';
import { healthRouter } from './routes/health';
import { versionRouter } from './routes/version';
import { metricsRouter } from './routes/metrics';
import { DatabaseService } from './services/databaseService';

async function bootstrap(): Promise<void> {
  await ensureDirectories();

  const databaseService = new DatabaseService();
  await databaseService.initialize();

  const app = express();
  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: config.allowedOrigins }));
  app.use(express.json({ limit: `${config.maxUploadSize}` }));
  app.use(requestLogger);
  app.use(apiRateLimiter);

  app.use('/health', healthRouter);
  app.use('/version', versionRouter);
  app.use('/metrics', metricsRouter);
  app.use('/api', mediaRouter);

  app.use(errorHandler);

  const server = app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
  });

  const shutdown = async (): Promise<void> => {
    logger.info('Shutting down server');
    server.close(async () => {
      await databaseService.shutdown();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
