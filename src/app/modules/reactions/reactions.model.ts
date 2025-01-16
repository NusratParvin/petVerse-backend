import { Schema, model } from 'mongoose';
import { REACTION_TYPE, TReaction } from './reactions.interface';

const reactionSchema = new Schema<TReaction>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: 'article', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    reactionType: {
      type: String,
      enum: Object.values(REACTION_TYPE),
      required: true,
    },
    reactedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export const Reaction = model<TReaction>('reaction', reactionSchema);
