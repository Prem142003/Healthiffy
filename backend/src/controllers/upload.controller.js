import { sendSuccess } from '../helpers/apiResponse.helper.js';
import { uploadBufferToCloudinary } from '../services/upload.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

export const uploadImageHandler = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('Image file is required', 400);
  const folder = req.body.folder || 'general';
  const image = await uploadBufferToCloudinary(req.file, folder);
  sendSuccess(res, 201, 'Image uploaded', { image });
});
