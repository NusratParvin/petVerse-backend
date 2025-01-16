import { Types } from 'mongoose';
import { TReactionSummary } from '../reactions/reactions.interface';

export type TVoteType = 'upvote' | 'downvote';

export type TVoteInfo = {
  userId: Types.ObjectId;
  voteType: TVoteType;
};

export type TArticle = {
  authorId: Types.ObjectId;
  title: string;
  content: string;
  category: 'Tip' | 'Story';
  images?: string;
  upvotes: number;
  downvotes: number;
  comments: Types.ObjectId[];
  isPremium: boolean;
  price?: number;
  isDeleted?: boolean;
  isPublish: boolean;
  voteInfo: TVoteInfo[];
  shareCount: number;
  reactionSummary: TReactionSummary;
};
