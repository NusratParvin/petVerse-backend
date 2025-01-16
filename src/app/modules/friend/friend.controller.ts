import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import httpStatus from 'http-status';
import { FriendServices } from './friend.service';

// Send a friend request
const sendFriendRequest = catchAsync(async (req: Request, res: Response) => {
  const { recipientId } = req.body;
  const requesterId = req.user.id;

  const result = await FriendServices.createFriendRequest(
    requesterId,
    recipientId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Friend request sent successfully',
    data: result,
  });
});

// Accept a friend request
const acceptFriendRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await FriendServices.updateFriendRequestStatus(id, 'accepted');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Friend request accepted successfully',
    data: result,
  });
});

// Reject a friend request
const rejectFriendRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await FriendServices.updateFriendRequestStatus(id, 'rejected');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Friend request rejected successfully',
    data: result,
  });
});
// Cancel a friend request
const cancelFriendRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await FriendServices.updateFriendRequestStatus(
    id,
    'cancelled',
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Friend request cancelled successfully',
    data: result,
  });
});

// Get all friend-related data (e.g., pending, sent, and friends list)
const getAllFriendData = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  // console.log('friend hit');
  const result = await FriendServices.getFriendData(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Friend data retrieved successfully',
    data: result,
  });
});

export const FriendControllers = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getAllFriendData,
};
