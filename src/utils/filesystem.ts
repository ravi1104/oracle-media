import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/env';

export async function ensureDirectories(): Promise<void> {
  const directories = [
    config.uploadPath,
    config.musicPath,
    config.videoPath,
    config.imagePath,
    config.voicePath,
    config.subtitlePath,
    config.tempPath,
    config.logPath,
    config.backupPath,
  ];
  await Promise.all(directories.map((dir) => fs.mkdir(dir, { recursive: true })));
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function findMediaFileByUuid(uuid: string): Promise<string | null> {
  if (!uuid || typeof uuid !== 'string') {
    return null;
  }
  
  const directories = [
    config.uploadPath,
    config.musicPath,
    config.videoPath,
    config.imagePath,
    config.voicePath,
    config.subtitlePath,
  ];
  
  for (const directory of directories) {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        
        const fileName = entry.name;
        
        // Check if filename starts with UUID followed by hyphen
        // This matches the pattern from buildStoredFilename
        if (fileName.startsWith(`${uuid}-`)) {
          return path.join(directory, fileName);
        }
        
        // Also check if the entire filename (without extension) is exactly the UUID
        const baseName = path.basename(fileName, path.extname(fileName));
        if (baseName === uuid) {
          return path.join(directory, fileName);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
      continue;
    }
  }
  return null;
}

export function sanitizeFilename(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
}

export function calculateChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = require('fs').createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk: Buffer) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

export function getMediaSubdirectory(kind: string): string {
  switch (kind) {
    case 'music':
      return config.musicPath;
    case 'video':
      return config.videoPath;
    case 'image':
      return config.imagePath;
    case 'voice':
      return config.voicePath;
    case 'subtitle':
      return config.subtitlePath;
    default:
      return config.uploadPath;
  }
}