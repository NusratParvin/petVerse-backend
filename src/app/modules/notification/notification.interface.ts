import { Types } from 'mongoose';

// add new types here as features grow
export type TNotificationType =
  | 'comment'
  | 'sighting'
  | 'helpful_lead'
  | 'invitation'       // groups — wire when groups are fixed
  | 'friend_request'   // wire when friends are fixed
  | 'post_resolved'    // future
  | 'vet_review';      // future

export type TNotificationTargetType =
  | 'LostFound'
  | 'Article'
  | 'Comment'
  | 'Group'
  | 'User';

export type TNotification = {
  recipient: Types.ObjectId;        // who sees it
  sender: {
    senderId: Types.ObjectId;
    name: string;
    profilePhoto?: string;
  };
  type: TNotificationType;
  message: string;                  // "Ahmed commented on your post"
  targetType: TNotificationTargetType;
  targetId: Types.ObjectId;         // what to navigate to on click
  isRead: boolean;
  createdAt?: Date;
};
