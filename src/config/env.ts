import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const rootDir = process.cwd();

export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'oracle-media-server',
  appVersion: process.env.APP_VERSION || '1.0.0',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  apiKey: process.env.API_KEY || 'dev-key',
  maxUploadSize: Number(process.env.MAX_UPLOAD_SIZE || 104857600),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map((origin) => origin.trim()),
  uploadPath: path.resolve(rootDir, process.env.UPLOAD_PATH || './uploads'),
  musicPath: path.resolve(rootDir, process.env.MUSIC_PATH || './uploads/music'),
  videoPath: path.resolve(rootDir, process.env.VIDEO_PATH || './uploads/videos'),
  imagePath: path.resolve(rootDir, process.env.IMAGE_PATH || './uploads/images'),
  voicePath: path.resolve(rootDir, process.env.VOICE_PATH || './uploads/voices'),
  subtitlePath: path.resolve(rootDir, process.env.SUBTITLE_PATH || './uploads/subtitles'),
  tempPath: path.resolve(rootDir, process.env.TEMP_PATH || './uploads/temp'),
  logPath: path.resolve(rootDir, process.env.LOG_PATH || './uploads/logs'),
  backupPath: path.resolve(rootDir, process.env.BACKUP_PATH || './uploads/backups'),
  db: {
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    connectString: process.env.DB_CONNECT_STRING || '',
    tnsAdmin: process.env.TNS_ADMIN || '',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};
