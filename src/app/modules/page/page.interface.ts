import { Types } from 'mongoose';

export interface TPage {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
  admins: Types.ObjectId[];
  pendingInvites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
