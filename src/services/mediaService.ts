import { MediaRecord } from '../types/media';
import { MediaRepository } from '../repositories/mediaRepository';
import { config } from '../config/env';
import path from 'path';

export class MediaService {
  constructor(private readonly repository: MediaRepository) {}

  async createMediaRecord(record: MediaRecord): Promise<MediaRecord> {
    return this.repository.save(record);
  }

  async getMediaPath(record: MediaRecord): Promise<string> {
    return path.resolve(config.uploadPath, record.relative_path);
  }
}
