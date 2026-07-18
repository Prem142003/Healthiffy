import { cloudinary } from '../config/cloudinary.config.js';
import { env } from '../config/env.config.js';
import { AppError } from '../utils/AppError.js';

export const uploadBufferToCloudinary = (file, folder = 'general') => {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new AppError('Cloudinary is not configured', 500);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinary.folder}/${folder}`,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(new AppError('Image upload failed', 500));
          return;
        }

        resolve({
          publicId: result.public_id,
          url: result.secure_url
        });
      }
    );

    stream.end(file.buffer);
  });
};

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};
