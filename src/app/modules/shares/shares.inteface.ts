import { Types } from 'mongoose';

export type TShare = {
  articleId: Types.ObjectId;
  userId: Types.ObjectId;
  sharedAt: Date;
  shareContext?: string;
};
