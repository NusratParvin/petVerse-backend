import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { InsuranceReviewService } from './insuranceReview.service';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';

const getProviderReviews = catchAsync(async (req: Request, res: Response) => {
  const data = await InsuranceReviewService.getProviderReviews(
    req.params.providerId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews fetched',
    data,
  });
});

const submitReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  console.log(req);
  const data = await InsuranceReviewService.submitReview(
    req.params.providerId,
    userId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review submitted',
    data,
  });
});

export const InsuranceReviewController = {
  getProviderReviews,
  submitReview,
};
