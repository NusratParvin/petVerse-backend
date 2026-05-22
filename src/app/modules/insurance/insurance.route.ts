import { Router } from 'express';
import { InsuranceController } from './insurance.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post(
  '/recommend',
  auth(USER_ROLE.USER),
  InsuranceController.getInsuranceRecommendation,
);

export const InsuranceRoutes = router;
