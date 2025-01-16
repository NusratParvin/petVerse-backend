import { Schema, model } from 'mongoose';
import { TPage } from './page.interface';

const pageSchema = new Schema<TPage>(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'user', default: [] }],
    admins: [{ type: Schema.Types.ObjectId, ref: 'user', default: [] }],
    pendingInvites: [{ type: Schema.Types.ObjectId, ref: 'user', default: [] }],
  },
  {
    timestamps: true,
  },
);

export const Page = model<TPage>('page', pageSchema);
