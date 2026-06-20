import { Notification } from './notification.model';
import {
  TNotificationType,
  TNotificationTargetType,
} from './notification.interface';

type TCreateNotificationPayload = {
  recipientId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  type: TNotificationType;
  message: string;
  targetType: TNotificationTargetType;
  targetId: string;
};

const createNotification = async (payload: TCreateNotificationPayload) => {
  // don't notify yourself
  if (payload.recipientId === payload.senderId) return;

  await Notification.create({
    recipient: payload.recipientId,
    sender: {
      senderId: payload.senderId,
      name: payload.senderName,
      profilePhoto: payload.senderPhoto || '',
    },
    type: payload.type,
    message: payload.message,
    targetType: payload.targetType,
    targetId: payload.targetId,
    isRead: false,
  });
};

//  get notifications for logged-in user

const getMyNotificationsFromDB = async (userId: string) => {
  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(30);
  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
  // console.log(unreadCount);
  return { notifications, unreadCount };
};

//  mark single as read

const markAsReadInDB = async (notificationId: string, userId: string) => {
  await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
  );
};

//  mark all as read
const markAllAsReadInDB = async (userId: string) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true },
  );
};

export const NotificationService = {
  createNotification,
  getMyNotificationsFromDB,
  markAsReadInDB,
  markAllAsReadInDB,
};
