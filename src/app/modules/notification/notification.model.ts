import { Schema, model } from 'mongoose';
import { TNotification } from './notification.interface';

const notificationSchema = new Schema<TNotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: { type: String, required: true },
      profilePhoto: { type: String, default: '' },
    },
    type: {
      type: String,
      enum: [
        'comment',
        'sighting',
        'helpful_lead',
        'invitation',
        'friend_request',
        'post_resolved',
        'vet_review',
      ],
      required: true,
    },
    message: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['LostFound', 'Article', 'Comment', 'Group', 'User'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// fast lookup — user opens bell, fetch only their unread
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = model<TNotification>(
  'Notification',
  notificationSchema,
);
