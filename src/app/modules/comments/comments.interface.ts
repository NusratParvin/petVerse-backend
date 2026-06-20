import { Types } from 'mongoose';
import { TVoteInfo } from '../articles/articles.interface';

export type TTargetType = 'Article' | 'LostFound';

export type TComment = {
  targetType: TTargetType;
  targetId: Types.ObjectId;

  commenter: {
    commenterId: Types.ObjectId;
    name: string;
    profilePhoto?: string;
  };

  content: string;

  upvotes: number;
  downvotes: number;
  voteInfo: TVoteInfo[];

  // lost & found sighting fields (null for articles)
  isSighting: boolean;
  sightingLocation?: string;
  sightingPhoto?: string;
  isHelpfulLead: boolean;

  isDeleted: boolean;

  //  threaded replies
  parentId?: Types.ObjectId | null;
};
