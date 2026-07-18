import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    callback(new AppError('Only image files are allowed', 400), false);
    return;
  }
  callback(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
