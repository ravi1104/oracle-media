export type MediaVisibility = 'public' | 'private' | 'unlisted';
export type MediaStatus = 'pending' | 'ready' | 'failed' | 'deleted';
export type MediaKind = 'music' | 'video' | 'image' | 'subtitle' | 'voice';

export interface MediaRecord {
  id: number;
  uuid: string;
  owner_id: string;
  room_id?: string;
  filename: string;
  original_filename: string;
  extension: string;
  mime_type: string;
  file_size: number;
  duration?: number;
  width?: number;
  height?: number;
  checksum: string;
  relative_path: string;
  visibility: MediaVisibility;
  status: MediaStatus;
  upload_source: string;
  created_at?: string;
  updated_at?: string;
}

export interface UploadResponse {
  success: boolean;
  data: MediaRecord | Record<string, unknown>;
  message: string;
}
