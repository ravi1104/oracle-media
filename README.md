# Oracle Media Server

A production-ready Node.js + TypeScript media server for uploading, storing, and streaming media files on a low-resource VM.

## Features

- Upload media with validation and checksum generation
- Stream media with range-request support
- Authenticated API with JWT and X-API-Key
- Configurable filesystem layout for music, video, image, subtitle, and voice files
- Health, version, and metrics endpoints
- Nginx and systemd deployment templates

## Quick Start

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and update the values
3. Build the project: `npm run build`
4. Start the server: `npm start`

## Environment Variables

- `PORT` – server port
- `NODE_ENV` – runtime mode
- `JWT_SECRET` – JWT signing secret
- `API_KEY` – API key for protected routes
- `UPLOAD_PATH` – base upload directory
- `DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING` – Oracle DB settings
- `MAX_UPLOAD_SIZE` – max allowed upload size in bytes

## API Endpoints

- `POST /api/upload` – upload media
- `GET /api/media/:uuid` – stream media
- `GET /health` – health status
- `GET /version` – service version
- `GET /metrics` – runtime metrics
- `DELETE /api/media/:uuid` – delete media by UUID (removes file and metadata)

## Media Upload and Download Behavior

### Upload Process

When you upload a file:

1. The system generates a unique UUID for the file
2. The file is renamed to `UUID-originalfilename.ext` and stored in the appropriate directory (music, video, etc.)
3. The original filename is stored in the database metadata
4. The API response returns the UUID and original filename

### Download Process

When you download a file using `GET /api/media/:uuid`:

- The system finds the file by UUID
- The file is served with the **original filename** (not the UUID-based filename)
- The `Content-Disposition` header is set to ensure browsers download the file with its original name
- This means users will always receive files with their original names, even though they're stored with UUID-based names on disk

This approach provides:

- **File system organization**: UUID-based filenames prevent naming conflicts
- **User experience**: Users download files with their original, meaningful names
- **Data integrity**: UUIDs ensure unique identification and prevent accidental overwrites

## Notes

- Files are stored on disk, while metadata is prepared for Oracle DB integration.
- For production, configure real Oracle DB credentials and TLS/Nginx settings.

## Media deletion

- Endpoint: `DELETE /api/media/:uuid`
- Description: Permanently removes the media file from disk (if present) and deletes its metadata record from the database. Returns the deleted media record in the `data` field on success.
- Example request:
```bash
curl -X DELETE "http://localhost:3000/api/media/REPLACE_WITH_UUID"
```
- Example successful response:
```json
{
  "success": true,
  "data": {
    /* deleted media record */
  },
  "message": "Media deleted successfully"
}
```
