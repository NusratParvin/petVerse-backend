import { Schema, model } from 'mongoose';
import { TShare } from './shares.inteface';

const shareSchema = new Schema<TShare>({
  articleId: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sharedAt: {
    type: Date,
    default: Date.now,
  },
  shareContext: {
    type: String,
    default: '',
  },
});

const Share = model<TShare>('Share', shareSchema);
export default Share;
