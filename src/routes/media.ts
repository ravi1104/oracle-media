import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { calculateChecksum, findMediaFileByUuid, getMediaSubdirectory, sanitizeFilename } from '../utils/filesystem';
import logger from '../utils/logger';
import { MediaKind, MediaRecord, UploadResponse } from '../types/media';
import fs from 'fs/promises';
import { DatabaseService } from '../services/databaseService';
import { MediaRepository } from '../repositories/mediaRepository';
import { MediaService } from '../services/mediaService';

const router = Router();
const databaseService = new DatabaseService();
const mediaRepository = new MediaRepository(databaseService);
const mediaService = new MediaService(mediaRepository);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.tempPath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${sanitizeFilename(path.basename(file.originalname, ext))}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxUploadSize },
  fileFilter: (_req, file, cb) => {
    const kind = detectKind(file.mimetype, file.originalname);
    if (!kind) {
      cb(new AppError(400, 'Unsupported file type'));
      return;
    }
    cb(null, true);
  },
});

function detectKind(mimeType: string, originalName: string): MediaKind | null {
  const lower = `${mimeType}`.toLowerCase();
  const ext = path.extname(originalName).toLowerCase();

  if (lower.startsWith('audio/')) return 'music';
  if (lower.startsWith('video/')) return 'video';
  if (lower.startsWith('image/')) return 'image';
  if (ext === '.srt' || ext === '.vtt' || ext === '.ass') return 'subtitle';
  if (lower.startsWith('application/ogg') || lower.startsWith('audio/ogg')) return 'voice';
  return null;
}

function buildResponse(data: MediaRecord | Record<string, unknown>, message = 'Success'): UploadResponse {
  return { success: true, data, message };
}

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    const kind = detectKind(req.file.mimetype, req.file.originalname);
    if (!kind) {
      throw new AppError(400, 'Unsupported file type');
    }

    const checksum = await calculateChecksum(req.file.path);
    const ext = path.extname(req.file.originalname);
    const newName = `${uuidv4()}${ext}`;
    const targetDir = getMediaSubdirectory(kind);
    const targetPath = path.join(targetDir, newName);
    await fs.rename(req.file.path, targetPath);

    const record: MediaRecord = {
      id: 0,
      uuid: uuidv4(),
      owner_id: 'system',
      filename: newName,
      original_filename: req.file.originalname,
      extension: ext.replace('.', ''),
      mime_type: req.file.mimetype,
      file_size: req.file.size,
      checksum,
      relative_path: path.relative(config.uploadPath, targetPath),
      visibility: 'private',
      status: 'ready',
      upload_source: 'api',
    };

    const persistedRecord = await mediaService.createMediaRecord(record);

    logger.info('Upload completed', { kind, checksum, size: req.file.size });
    res.json(buildResponse(persistedRecord, 'Media uploaded successfully'));
  } catch (error) {
    logger.error('Upload failed', error);
    next(error);
  }
});

router.get('/media/:uuid', async (req, res, next) => {
  try {
    const { uuid } = req.params;
    const filePath = await findMediaFileByUuid(uuid);

    if (!filePath) {
      throw new AppError(404, 'Media not found');
    }

    const stat = await fs.stat(filePath);
    const range = req.headers.range;

    if (!range) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', stat.size.toString());
      res.setHeader('Accept-Ranges', 'bytes');
      const stream = require('fs').createReadStream(filePath);
      stream.pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = Number(parts[0]);
    const end = parts[1] ? Number(parts[1]) : stat.size - 1;
    const chunkSize = end - start + 1;

    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', chunkSize.toString());
    const stream = require('fs').createReadStream(filePath, { start, end });
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
});

router.get('/media', (_req, res) => {
  res.json({ success: true, data: [], message: 'Media index' });
});

router.get('/media/search', (_req, res) => {
  res.json({ success: true, data: [], message: 'Search placeholder' });
});

router.delete('/media/:uuid', async (req, res, next) => {
  try {
    const { uuid } = req.params;
    if (!uuid) {
      throw new AppError(400, 'UUID required');
    }

    const removed = await mediaService.deleteMediaByUuid(uuid);

    res.json(buildResponse(removed, 'Media deleted successfully'));
  } catch (error) {
    next(error);
  }
});

router.put('/media/:uuid', async (_req, res, next) => {
  try {
    res.json({ success: true, data: {}, message: 'Update placeholder' });
  } catch (error) {
    next(error);
  }
});

export const mediaRouter = router;
