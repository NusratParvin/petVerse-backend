import { Router } from 'express';
import { InsuranceController } from './insurance.controller';
import auth from '../../middlewares/auth';
import { createInsuranceProviderValidationSchema } from './insurance.validate';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

//   Provider routes
router.get('/', InsuranceController.getAllProviders);
router.get('/:id', InsuranceController.getProviderById);
router.post(
  '/',
  auth(USER_ROLE.ADMIN),
  zodValidationRequest(createInsuranceProviderValidationSchema),
  InsuranceController.createProvider,
);
router.patch('/:id', auth(USER_ROLE.ADMIN), InsuranceController.updateProvider);
router.delete(
  '/:id',
  auth(USER_ROLE.ADMIN),
  InsuranceController.deleteProvider,
);

//  AI recommendation
router.post(
  '/ai/recommendation',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  InsuranceController.getAIRecommendation,
);

export const InsuranceRoutes = router;
