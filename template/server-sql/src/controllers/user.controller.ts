import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { MESSAGES } from '../constants/messages';
import { ROLES } from '../constants/roles';
import * as userService from '../services/user.service';
import { UpdateUserInput } from '../validations/user.schema';
import { HTTP_STATUS } from '../constants/httpStatus';
import { audit, AuditEvent } from '../utils/audit';

export const getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await userService.findAllUsers(req.query);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.SUCCESS, result.data, result.meta));
});

export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const user = await userService.findUserById(id);

  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.SUCCESS, user));
});

export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const input = req.body as UpdateUserInput;

  // Only admins may change privileged fields. Moderators can edit profile data
  // (e.g. name) but must not be able to grant roles or (de)activate accounts —
  // otherwise a moderator could promote itself or anyone else to ADMIN.
  if (
    req.user?.role !== ROLES.ADMIN &&
    (input.role !== undefined || input.isActive !== undefined)
  ) {
    throw ApiError.forbidden(MESSAGES.FORBIDDEN);
  }

  const user = await userService.updateUser(id, input);

  audit(AuditEvent.USER_UPDATED, {
    actorId: req.user?.userId,
    targetId: id,
    ip: req.ip,
    requestId: req.id,
    outcome: 'success',
  });

  res.status(HTTP_STATUS.OK).json(new ApiResponse(MESSAGES.UPDATED, user));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  await userService.deleteUser(id);

  audit(AuditEvent.USER_DELETED, {
    actorId: req.user?.userId,
    targetId: id,
    ip: req.ip,
    requestId: req.id,
    outcome: 'success',
  });

  res.status(HTTP_STATUS.NO_CONTENT).send();
});
