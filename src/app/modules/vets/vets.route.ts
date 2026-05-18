import express from 'express';
import { VetController } from './vets.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/zodValidationRequest';
import { VetValidation } from './vets.validate';
import { USER_ROLE } from '../user/user.constants';

const router = express.Router();

// Public routes
router.get('/', VetController.getAllVets);
router.get('/:id', VetController.getSingleVet);

// Admin only routes
router.post(
  '/',
  auth(USER_ROLE.ADMIN),
  validateRequest(VetValidation.createVetSchema),
  VetController.createVet,
);

router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN),

  validateRequest(VetValidation.updateVetSchema),
  VetController.updateVet,
);

router.delete('/:id', auth(USER_ROLE.ADMIN), VetController.deleteVet);

export const VetRoutes = router;
