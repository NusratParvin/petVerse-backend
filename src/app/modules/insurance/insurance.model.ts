import { model, Schema } from 'mongoose';

import { TInsuranceProvider } from './insurance.interface';

import {
  COVERAGE_TYPES,
  INSURANCE_BADGES,
  PET_TYPES,
} from './insurance.constants';

const insuranceProviderSchema = new Schema<TInsuranceProvider>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      enum: INSURANCE_BADGES,
    },
    priceFrom: {
      type: Number,
      required: true,
    },
    priceTo: {
      type: Number,
      required: true,
    },
    annualLimit: {
      type: Number,
      required: true,
    },
    reimbursement: {
      type: Number,
      required: true,
    },
    claimsIn: {
      type: String,
      required: true,
    },
    coverageScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    maxAgeYears: {
      type: Number,
      required: true,
    },
    minAgeWeeks: {
      type: Number,
      required: true,
    },
    pets: [
      {
        type: String,
        enum: PET_TYPES,
      },
    ],
    plans: [String],
    coverageFlags: [
      {
        type: String,
        enum: COVERAGE_TYPES,
      },
    ],
    coveredConditions: [String],
    excludedConditions: [String],
    highlights: [String],
    website: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    about: {
      type: String,
      required: true,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const InsuranceProvider = model<TInsuranceProvider>(
  'InsuranceProvider',
  insuranceProviderSchema,
);
