import { Router } from 'express';
import { config } from '../config/env';

export const versionRouter = Router();

versionRouter.get('/', (_req, res) => {
  res.json({ success: true, data: { version: config.appVersion, name: config.appName }, message: 'Version information' });
});
