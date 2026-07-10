import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { MESSAGES } from '../constants/messages';
import * as statsService from '../services/stats.service';
import { HTTP_STATUS } from '../constants/httpStatus';

export const getStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const stats = await statsService.getUserStats();

  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.SUCCESS, stats));
});
