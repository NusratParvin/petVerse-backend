import { Types } from 'mongoose';
import { TReactionSummary } from '../reactions/reactions.interface';

export type TPostType =
  | 'photo'
  | 'video'
  | 'milestone'
  | 'shared_article'
  | 'text'
  | 'shared_post';

export type TMilestoneCategory =
  | 'birthday'
  | 'adoption'
  | 'vet-visit'
  | 'health'
  | 'other';

// The two content types a Post can point back to when it's a share.
// Kept explicit (not just 'string') so TS catches typos at compile time.
export type TShareRefType = 'Article' | 'Post';

export type TMedia = {
  url: string;
  type: 'image' | 'video';
};

export type TPost = {
  authorId: Types.ObjectId;
  petId?: Types.ObjectId; // which pet this post is about (optional — not every post is pet-specific)
  type: TPostType;
  caption?: string;
  media?: TMedia[];

  // Share fields — only present when type is 'shared_article' or 'shared_post'.
  // refPath in the schema uses refType to decide whether refId points at
  // the Article collection or the Post collection.
  refId?: Types.ObjectId;
  refType?: TShareRefType;
  isMilestone: boolean;
  milestoneCategory?: TMilestoneCategory | null;
  reactionSummary: TReactionSummary;
  commentCount: number;
  shareCount: number;
  isDeleted?: boolean;
};
