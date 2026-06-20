import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NotificationService } from './notification.service';

// GET /notifications/my
const getMyNotifications = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await NotificationService.getMyNotificationsFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved',
    data: result,
  });
});

// PATCH /notifications/:id/read
const markAsRead = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  await NotificationService.markAsReadInDB(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Marked as read',
    data: null,
  });
});

// PATCH /notifications/read-all
const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.id;
  await NotificationService.markAllAsReadInDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All marked as read',
    data: null,
  });
});

export const NotificationControllers = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
