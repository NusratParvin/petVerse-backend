import { Schema, model } from 'mongoose';
import { TPost } from './posts.interface';

const postSchema = new Schema<TPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: 'Pet',
      required: false,
    },
    type: {
      type: String,
      enum: [
        'photo',
        'video',
        'milestone',
        'shared_article',
        'shared_post',
        'text',
      ],
      required: true,
    },
    caption: {
      type: String,
      required: false,
    },
    media: {
      type: [
        {
          url: { type: String, required: true },
          type: { type: String, enum: ['image', 'video'], required: true },
        },
      ],
      default: [],
    },

    refId: {
      type: Schema.Types.ObjectId,
      refPath: 'refType',
      required: false,
    },
    refType: {
      type: String,
      enum: ['Article', 'Post'],
      required: false,
    },

    isMilestone: {
      type: Boolean,
      default: false,
    },
    milestoneCategory: {
      type: String,
      enum: ['birthday', 'adoption', 'vet-visit', 'health', 'other'],
      default: null,
      required: function () {
        return this.isMilestone === true;
      },
    },

    reactionSummary: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Post = model<TPost>('Post', postSchema);
