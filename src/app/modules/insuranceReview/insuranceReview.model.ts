import { model, Schema } from 'mongoose';

import { InsuranceProvider } from '../insurance/insurance.model';

import { TInsuranceReview } from './insuranceReview.interface';

const insuranceReviewSchema = new Schema<TInsuranceReview>(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'insuranceprovider',
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    planUsed: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

insuranceReviewSchema.post('save', async function () {
  const providerId = this.provider;

  const stats = await InsuranceReview.aggregate([
    {
      $match: {
        provider: providerId,
      },
    },

    {
      $group: {
        _id: '$provider',

        avgRating: {
          $avg: '$rating',
        },

        reviewCount: {
          $sum: 1,
        },
      },
    },
  ]);

  await InsuranceProvider.findByIdAndUpdate(providerId, {
    avgRating: stats[0]?.avgRating || 0,

    reviewCount: stats[0]?.reviewCount || 0,
  });
});

export const InsuranceReview = model<TInsuranceReview>(
  'InsuranceReview',
  insuranceReviewSchema,
);
