import { InsuranceReview } from './insuranceReview.model';
import { InsuranceProvider } from '../insurance/insurance.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const getProviderReviews = async (providerId: string) => {
  const provider = await InsuranceProvider.findById(providerId);
  if (!provider) throw new AppError(httpStatus.NOT_FOUND, 'Provider not found');

  const reviews = await InsuranceReview.find({ provider: providerId })
    .sort({ createdAt: -1 })
    .lean();

  return {
    reviews,
    avgRating: provider.avgRating,
    count: provider.reviewCount,
  };
};

const submitReview = async (
  providerId: string,
  userId: string,
  payload: { rating: number; text: string; planUsed?: string },
) => {
  const provider = await InsuranceProvider.findById(providerId);
  if (!provider) throw new AppError(httpStatus.NOT_FOUND, 'Provider not found');

  // One review per user per provider
  const existing = await InsuranceReview.findOne({
    provider: providerId,
    user: userId,
  });
  if (existing)
    throw new AppError(
      httpStatus.CONFLICT,
      'You have already reviewed this provider',
    );

  const review = await InsuranceReview.create({
    provider: providerId,
    user: userId,
    rating: payload.rating,
    text: payload.text,
    planUsed: payload.planUsed,
  });

  return review;
};

export const InsuranceReviewService = {
  getProviderReviews,
  submitReview,
};
