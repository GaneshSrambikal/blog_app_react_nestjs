import * as multer from 'multer';
import * as path from 'path';

export const multerConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads'); // Temporary local storage path
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
  fileFilter: (
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
};
