import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

export const CHAT_ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
];
export const CHAT_ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
export const CHAT_IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const chatUploadOptions = {
  storage: diskStorage({
    destination: (req: any, file, cb) => {
      const userId = req.user?.userId ?? 'shared';
      const uploadPath = join(process.cwd(), 'uploads', 'chat', userId);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const extension = extname(file.originalname).toLowerCase();
    const isAllowedExtension =
      CHAT_ALLOWED_IMAGE_EXTENSIONS.includes(extension);
    const isAllowedMimeType = CHAT_ALLOWED_IMAGE_MIME_TYPES.includes(
      file.mimetype,
    );

    if (!isAllowedExtension || !isAllowedMimeType) {
      return cb(
        new BadRequestException(
          'Only JPG, JPEG, PNG, and WebP image files are allowed.',
        ),
        false,
      );
    }

    cb(null, true);
  },
  limits: {
    fileSize: CHAT_IMAGE_MAX_FILE_SIZE,
  },
};

export function toPublicUploadPath(filePath?: string | null): string | null {
  if (!filePath) return null;

  const normalizedPath = filePath.replace(/\\/g, '/');
  const uploadsIndex = normalizedPath.lastIndexOf('/uploads/');

  if (uploadsIndex >= 0) {
    return normalizedPath.slice(uploadsIndex);
  }

  const withoutDotPrefix = normalizedPath.replace(/^\.\//, '/');
  return withoutDotPrefix.startsWith('/uploads/')
    ? withoutDotPrefix
    : `/uploads/${withoutDotPrefix.replace(/^\/+/, '')}`;
}

export function deleteUploadedFile(filePath?: string | null): void {
  if (!filePath) return;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
