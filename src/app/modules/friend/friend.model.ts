import { Schema, model } from 'mongoose';
import { TFriend } from './friend.interface';

const friendSchema = new Schema<TFriend>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Friend = model<TFriend>('friend', friendSchema);
