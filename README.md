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

## Notes
- Files are stored on disk, while metadata is prepared for Oracle DB integration.
- For production, configure real Oracle DB credentials and TLS/Nginx settings.
