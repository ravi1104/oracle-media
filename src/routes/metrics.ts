import { Router } from 'express';
import os from 'os';

export const metricsRouter = Router();

metricsRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      memory: {
        rss: process.memoryUsage().rss,
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
      },
      cpu: {
        count: os.cpus().length,
      },
      uptime: process.uptime(),
    },
    message: 'Metrics',
  });
});
