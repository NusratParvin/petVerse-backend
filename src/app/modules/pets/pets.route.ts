import express from 'express';
import auth from '../../middlewares/auth';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { USER_ROLE } from '../user/user.constants';
import { PetValidation } from './pets.validate';
import { PetControllers } from './pets.controller';

const router = express.Router();

// Public — no auth needed (vet can search by microchip)
router.get('/microchip/:chipNumber', PetControllers.findByMicrochip);

// Protected routes
router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(PetValidation.createPetValidationSchema),
  PetControllers.createPet,
);

router.get(
  '/my-pets',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  PetControllers.getMyPets,
);

router.get(
  '/reminders',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  PetControllers.getUpcomingReminders,
);

router.get(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  PetControllers.getSinglePet,
);

router.patch(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(PetValidation.updatePetValidationSchema),
  PetControllers.updatePet,
);

router.delete(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  PetControllers.deletePet,
);

router.post(
  '/:id/health-record',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(PetValidation.addHealthRecordValidationSchema),
  PetControllers.addHealthRecord,
);

export const PetRoutes = router;
