import { Router } from 'express';
import auth from '../../middlewares/auth';
import { createInsuranceReviewValidationSchema } from '../insuranceReview/insuranceReview.validation';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { InsuranceReviewController } from '../insuranceReview/insuranceReview.controller';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.get(
  '/:providerId/reviews',
  InsuranceReviewController.getProviderReviews,
);
router.post(
  '/:providerId/reviews',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(createInsuranceReviewValidationSchema),
  InsuranceReviewController.submitReview,
);

export const InsuranceReviewRoutes = router;
