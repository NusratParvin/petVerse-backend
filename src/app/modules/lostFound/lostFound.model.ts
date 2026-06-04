import { model, Schema } from 'mongoose';
import { TLostFound } from './lostFound.interface';
import {
  POST_TYPES,
  PET_SPECIES,
  UAE_EMIRATES,
  POST_STATUSES,
} from './lostFound.constants';

const lostFoundSchema = new Schema<TLostFound>(
  {
    postedBy: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    posterName: { type: String, required: true, trim: true },
    posterEmail: { type: String, required: true, trim: true },
    posterPhone: { type: String, required: true, trim: true },
    type: { type: String, enum: POST_TYPES, required: true },
    status: { type: String, enum: POST_STATUSES, default: 'active' },
    petName: { type: String, trim: true },
    species: { type: String, enum: PET_SPECIES, required: true },
    breed: { type: String, trim: true },
    color: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    emirate: { type: String, enum: UAE_EMIRATES, required: true },
    area: { type: String, required: true, trim: true },
    dateLostFound: { type: Date, required: true },
    photos: [{ type: String }],
    microchipNumber: { type: String, trim: true },
    reward: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Soft-delete filter
lostFoundSchema.pre('find', function () {
  this.where({ isDeleted: false });
});
lostFoundSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

export const LostFound = model<TLostFound>('LostFound', lostFoundSchema);
