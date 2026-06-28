import { Router } from 'express';
import os from 'os';
import fs from 'fs';
import { config } from '../config/env';
import logger from '../utils/logger';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res, next) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const diskUsage = fs.statfsSync?.(config.uploadPath) as { bavail?: number; bsize?: number; blocks?: number } | undefined;

    res.json({
      success: true,
      data: {
        status: 'ok',
        filesystem: {
          uploadPath: config.uploadPath,
          diskUsage,
        },
        database: {
          configured: Boolean(config.db.user && config.db.password && config.db.connectString),
        },
        memory: {
          total: totalMem,
          free: freeMem,
        },
        nodeVersion: process.version,
        uptime: process.uptime(),
        appVersion: config.appVersion,
      },
      message: 'Service healthy',
    });
  } catch (error) {
    logger.error('Health check failed', error);
    next(error);
  }
});
