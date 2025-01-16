import { Types } from 'mongoose';

export type TFriendStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface TFriend {
  requesterId: Types.ObjectId;
  recipientId: Types.ObjectId;
  status: TFriendStatus;
  requestedAt: Date;
  acceptedAt?: Date;
  cancelledAt?: Date;
}
