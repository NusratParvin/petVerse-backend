// import { Schema, model } from 'mongoose';
// import { TArticle } from './articles.interface';

// // Define the Article schema
// const articleSchema = new Schema<TArticle>(
//   {
//     authorId: {
//       type: Schema.Types.ObjectId,
//       ref: 'user',
//       required: true,
//     },
//     title: {
//       type: String,
//       required: [true, 'Title is required'],
//     },
//     content: {
//       type: String,
//       required: [true, 'Content is required'],
//     },
//     category: {
//       type: String,
//       enum: ['Tip', 'Story'],
//       required: [true, 'Category is required'],
//     },
//     images: {
//       type: String,
//       required: false,
//     },
//     upvotes: {
//       type: Number,
//       default: 0,
//     },
//     downvotes: {
//       type: Number,
//       default: 0,
//     },
//     comments: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: 'comment',
//         default: [],
//       },
//     ],
//     commentCount: {
//       type: Number,
//       default: 0,
//     },
//     isPremium: {
//       type: Boolean,
//       required: [true, 'Premium Content Selection is required'],
//     },
//     price: {
//       type: Number,
//       default: 0,
//     },
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//     isPublish: {
//       type: Boolean,
//       default: true,
//     },
//     voteInfo: {
//       type: [
//         {
//           userId: {
//             type: Schema.Types.ObjectId,
//             ref: 'user',
//           },
//           voteType: {
//             type: String,
//             enum: ['upvote', 'downvote'],
//           },
//         },
//       ],
//       default: [],
//     },
//     shareCount: {
//       type: Number,
//       default: 0,
//     },

//     reactionSummary: {
//       like: { type: Number, default: 0 },
//       love: { type: Number, default: 0 },
//       haha: { type: Number, default: 0 },
//       wow: { type: Number, default: 0 },
//       sad: { type: Number, default: 0 },
//       angry: { type: Number, default: 0 },
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// export const Article = model<TArticle>('Article', articleSchema);

import { Schema, model } from 'mongoose';
import { TArticle } from './articles.interface';
import { ARTICLE_CATEGORIES, PET_TYPES } from './articles.constants';

// Define the Article schema
const articleSchema = new Schema<TArticle>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      enum: [...ARTICLE_CATEGORIES],
      required: [true, 'Category is required'],
    },
    petType: {
      type: String,
      enum: [...PET_TYPES],
      default: 'other',
    },
    tags: {
      type: [String],
      default: [],
    },
    images: {
      type: String,
      required: false,
    },
    // Computed in the service (not sent by the client)
    excerpt: {
      type: String,
      default: '',
    },
    readTime: {
      type: Number,
      default: 1,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    // Admin-only, used for the featured hero card
    isFeatured: {
      type: Boolean,
      default: false,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'comment',
        default: [],
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      required: [true, 'Premium Content Selection is required'],
    },
    price: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isPublish: {
      type: Boolean,
      default: true,
    },
    voteInfo: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
          voteType: {
            type: String,
            enum: ['upvote', 'downvote'],
          },
        },
      ],
      default: [],
    },
    shareCount: {
      type: Number,
      default: 0,
    },

    reactionSummary: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes: speed up the list page's most common queries
articleSchema.index({ isPublish: 1, isDeleted: 1, createdAt: -1 });
articleSchema.index({ category: 1, petType: 1 });
articleSchema.index({ upvotes: -1 });

export const Article = model<TArticle>('Article', articleSchema);
