import { Types } from 'mongoose';

export enum REACTION_TYPE {
  LIKE = 'like',
  LOVE = 'love',
  HAHA = 'haha',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}
export type TReactionSummary = {
  [key in REACTION_TYPE]: number;
};

export type TReaction = {
  articleId: Types.ObjectId;
  userId: Types.ObjectId;
  reactionType: REACTION_TYPE;
  reactedAt: Date;
};
