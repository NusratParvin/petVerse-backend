// import { Schema, model } from 'mongoose';
// import { TComment } from './comments.interface';

// const commentSchema = new Schema<TComment>(
//   {
//     articleId: {
//       type: Schema.Types.ObjectId,
//       ref: 'article',
//       required: true,
//     },
//     commenter: {
//       commenterId: {
//         type: Schema.Types.ObjectId,
//         ref: 'user',
//         required: true,
//       },
//       name: {
//         type: String,
//         required: true,
//       },
//       profilePhoto: {
//         type: String,
//         default: '',
//       },
//     },
//     content: {
//       type: String,
//       required: [true, 'Content is required'],
//     },
//     upvotes: {
//       type: Number,
//       default: 0,
//     },
//     downvotes: {
//       type: Number,
//       default: 0,
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
//   },
//   {
//     timestamps: true,
//   },
// );

// export const Comment = model<TComment>('Comment', commentSchema);

import { Schema, model } from 'mongoose';
import { TComment } from './comments.interface';

const commentSchema = new Schema<TComment>(
  {
    // --- polymorphic target ---
    targetType: {
      type: String,
      enum: ['Article', 'LostFound'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      // no hardcoded ref — works for any collection
    },

    // --- who posted it ---
    commenter: {
      commenterId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      profilePhoto: {
        type: String,
        default: '',
      },
    },

    // --- content ---
    content: {
      type: String,
      required: [true, 'Content is required'],
    },

    // --- votes ---
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voteInfo: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User' },
          voteType: { type: String, enum: ['upvote', 'downvote'] },
        },
      ],
      default: [],
    },

    // --- lost & found sighting fields ---
    isSighting: { type: Boolean, default: false },
    sightingLocation: { type: String, default: '' },
    sightingPhoto: { type: String, default: '' },
    isHelpfulLead: { type: Boolean, default: false },

    // --- soft delete ---
    isDeleted: { type: Boolean, default: false },

    // --- future: threaded replies ---
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
  },
  { timestamps: true },
);

// index for fast lookups by post
commentSchema.index({ targetId: 1, targetType: 1 });

// filter out deleted comments by default
commentSchema.pre('find', function () {
  this.where({ isDeleted: false });
});
commentSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

export const Comment = model<TComment>('Comment', commentSchema);
