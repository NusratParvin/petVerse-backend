import { Types } from 'mongoose';
import { TReactionSummary } from '../reactions/reactions.interface';
import { ARTICLE_CATEGORIES, PET_TYPES } from './articles.constants';

export type TVoteType = 'upvote' | 'downvote';

export type TVoteInfo = {
  userId: Types.ObjectId;
  voteType: TVoteType;
};

export type TArticleCategories = (typeof ARTICLE_CATEGORIES)[number];
export type TPetType = (typeof PET_TYPES)[number];

export type TArticle = {
  authorId: Types.ObjectId;
  title: string;
  content: string;
  category: TArticleCategories;
  petType: TPetType;
  tags: string[];

  images?: string;
  excerpt: string;
  readTime: number;
  viewCount: number;
  isFeatured: boolean;

  upvotes: number;
  downvotes: number;
  comments: Types.ObjectId[];
  commentCount: number;
  isPremium: boolean;
  price?: number;
  isDeleted?: boolean;
  isPublish: boolean;
  voteInfo: TVoteInfo[];
  shareCount: number;
  reactionSummary: TReactionSummary;
};
