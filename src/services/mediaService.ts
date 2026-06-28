import { MediaRecord } from '../types/media';
import { MediaRepository } from '../repositories/mediaRepository';
import { config } from '../config/env';
import path from 'path';
import fs from 'fs/promises';
import { AppError } from '../middleware/errorHandler';

export class MediaService {
  constructor(private readonly repository: MediaRepository) {}

  async createMediaRecord(record: MediaRecord): Promise<MediaRecord> {
    return this.repository.save(record);
  }

  async getMediaPath(record: MediaRecord): Promise<string> {
    return path.resolve(config.uploadPath, record.relative_path);
  }

  async deleteMediaByUuid(uuid: string): Promise<MediaRecord> {
    const record = await this.repository.findByUuid(uuid);
    if (!record) {
      throw new AppError(404, 'Media not found');
    }

    // determine absolute path
    const fullPath = await this.getMediaPath(record);

    try {
      // remove file if it exists
      await fs.unlink(fullPath).catch(() => undefined);
    } catch (err) {
      // log but continue to remove DB record
    }

    const deleted = await this.repository.deleteByUuid(uuid);
    if (!deleted) {
      throw new AppError(500, 'Failed to remove media metadata');
    }

    return record;
  }
}
