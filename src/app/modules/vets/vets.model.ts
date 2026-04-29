import { Schema, model } from 'mongoose';
import { TVet } from './vets.interface';

const workingHoursSchema = new Schema(
  {
    day: { type: String, required: true },
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' },
    closed: { type: Boolean, default: false },
  },
  { _id: false },
);

// const serviceRateSchema = new Schema(
//   {
//     service: { type: String, required: true },
//     priceFrom: { type: Number, required: true },
//     priceTo: { type: Number, required: true },
//   },
//   { _id: false },
// );

const priceRangeSchema = new Schema(
  {
    basePrice: { type: Number, required: true, min: 0 },
    maxPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const vetSchema = new Schema<TVet>(
  {
    name: { type: String, required: false },
    clinicName: { type: String, required: true },
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
      required: true,
    },
    area: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    email: { type: String },
    website: { type: String },
    coverPhoto: { type: String, default: '' },
    photos: [{ type: String }],
    specialities: [
      {
        type: String,
        enum: [
          'dogs',
          'cats',
          'birds',
          'fish',
          'rabbits',
          'reptiles',
          'exotic',
          'small-animals',
          'emergency',
          'surgery',
          'dental',
          'dermatology',
          'ophthalmology',
          'nutrition',
        ],
      },
    ],
    workingHours: [workingHoursSchema],
    // serviceRates: [serviceRateSchema],
    priceRange: priceRangeSchema,
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    about: { type: String },
    googleMapsUrl: { type: String },
    emergency: { type: Boolean, default: false },
    isClaimed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

vetSchema.index({ emirate: 1, specialities: 1 });
vetSchema.index({ isDeleted: 1 });
vetSchema.index({ 'priceRange.consultationFrom': 1 });

export const Vet = model<TVet>('Vet', vetSchema);
