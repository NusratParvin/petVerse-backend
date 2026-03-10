import { model, Schema } from 'mongoose';
import { TPet } from './pets.interface';

const healthRecordSchema = new Schema({
  type: {
    type: String,
    enum: ['vaccine', 'vet-visit', 'medication', 'grooming', 'other'],
    required: true,
  },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  nextDueDate: { type: Date },
  notes: { type: String },
  cost: { type: Number },
  vetName: { type: String },
});

const petSchema = new Schema<TPet>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    name: { type: String, required: [true, 'Pet Name is required'] },
    species: {
      type: String,
      enum: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'reptile', 'other'],
      required: [true, 'Species is required'],
    },
    breed: { type: String },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'unknown',
    },
    dateOfBirth: { type: Date },
    weight: { type: Number },
    microchipNumber: { type: String },
    profilePhoto: { type: String, default: '' },
    isNeutered: { type: Boolean, default: false },
    emirate: {
      type: String,
      enum: [
        'dubai',
        'abu-dhabi',
        'sharjah',
        'ajman',
        'ras-al-khaimah',
        'fujairah',
        'umm-al-quwain',
      ],
    },
    healthRecords: {
      type: [healthRecordSchema],
      default: [],
    },
    whatsappAlerts: { type: Boolean, default: false },

    whatsappNumber: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Pet = model<TPet>('Pet', petSchema);
