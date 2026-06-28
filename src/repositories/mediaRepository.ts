import { DatabaseService } from '../services/databaseService';
import { MediaRecord } from '../types/media';
import logger from '../utils/logger';

export class MediaRepository {
  constructor(private readonly db: DatabaseService) {}

  async save(record: MediaRecord): Promise<MediaRecord> {
    try {
      const connection = await this.db.getConnection();
      await connection.execute(
        `INSERT INTO media (
          uuid, owner_id, room_id, filename, original_filename, extension, mime_type, file_size,
          duration, width, height, checksum, relative_path, visibility, status, upload_source
        ) VALUES (
          :uuid, :owner_id, :room_id, :filename, :original_filename, :extension, :mime_type, :file_size,
          :duration, :width, :height, :checksum, :relative_path, :visibility, :status, :upload_source
        )`,
        {
          uuid: record.uuid,
          owner_id: record.owner_id,
          room_id: record.room_id,
          filename: record.filename,
          original_filename: record.original_filename,
          extension: record.extension,
          mime_type: record.mime_type,
          file_size: record.file_size,
          duration: record.duration,
          width: record.width,
          height: record.height,
          checksum: record.checksum,
          relative_path: record.relative_path,
          visibility: record.visibility,
          status: record.status,
          upload_source: record.upload_source,
        },
      );
      await connection.commit();
      await connection.close();
      return record;
    } catch (error) {
      logger.error('Failed to save media metadata', error);
      return record;
    }
  }
}
