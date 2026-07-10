import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { MESSAGES } from '../constants/messages';
import { HTTP_STATUS } from '../constants/httpStatus';
import { isImageKitConfigured, createImageKitAuthParams } from '../services/upload.service';

// Returns the short-lived params the client uses to upload straight to ImageKit.
// Requires auth so only signed-in users can request upload credentials.
export const getImageKitAuth = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  if (!isImageKitConfigured()) {
    throw ApiError.serviceUnavailable(MESSAGES.IMAGEKIT_NOT_CONFIGURED);
  }

  const params = createImageKitAuthParams();

  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.UPLOAD_AUTH_SUCCESS, params));
});
