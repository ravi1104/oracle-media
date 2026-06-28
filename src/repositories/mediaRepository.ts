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

  async findByUuid(uuid: string): Promise<MediaRecord | null> {
    try {
      const connection = await this.db.getConnection();
      const result = await connection.execute(
        `SELECT * FROM media WHERE uuid = :uuid`,
        { uuid },
      );

      await connection.close();

      // oracledb returns rows in result.rows when OUT_FORMAT_OBJECT is set
      // cast to any to access rows
      const rows: any = (result && (result as any).rows) || [];
      if (!rows || rows.length === 0) return null;

      const row = rows[0];
      const record: MediaRecord = {
        id: row.ID || row.id,
        uuid: row.UUID || row.uuid,
        owner_id: row.OWNER_ID || row.owner_id,
        room_id: row.ROOM_ID || row.room_id,
        filename: row.FILENAME || row.filename,
        original_filename: row.ORIGINAL_FILENAME || row.original_filename,
        extension: row.EXTENSION || row.extension,
        mime_type: row.MIME_TYPE || row.mime_type,
        file_size: row.FILE_SIZE || row.file_size,
        duration: row.DURATION || row.duration,
        width: row.WIDTH || row.width,
        height: row.HEIGHT || row.height,
        checksum: row.CHECKSUM || row.checksum,
        relative_path: row.RELATIVE_PATH || row.relative_path,
        visibility: row.VISIBILITY || row.visibility,
        status: row.STATUS || row.status,
        upload_source: row.UPLOAD_SOURCE || row.upload_source,
        created_at: row.CREATED_AT || row.created_at,
        updated_at: row.UPDATED_AT || row.updated_at,
      } as MediaRecord;

      return record;
    } catch (error) {
      logger.error('Failed to find media by uuid', error);
      return null;
    }
  }

  async deleteByUuid(uuid: string): Promise<boolean> {
    try {
      const connection = await this.db.getConnection();
      await connection.execute(`DELETE FROM media WHERE uuid = :uuid`, { uuid });
      await connection.commit();
      await connection.close();
      return true;
    } catch (error) {
      logger.error('Failed to delete media by uuid', error);
      return false;
    }
  }
}
