import { Router } from 'express';
import { LostFoundController } from './lostFound.controller';
import auth from '../../middlewares/auth';
import {
  createLostFoundValidation,
  updateLostFoundValidation,
} from './lostFound.validation';
import { USER_ROLE } from '../user/user.constants';
import zodValidationRequest from '../../middlewares/zodValidationRequest';

const router = Router();

router.get('/', LostFoundController.getAllPosts);
router.get('/:id', LostFoundController.getPostById);

router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(createLostFoundValidation),
  LostFoundController.createPost,
);
router.patch(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(updateLostFoundValidation),
  LostFoundController.updatePost,
);
router.patch(
  '/:id/resolve',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  LostFoundController.markResolved,
);
router.delete(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  LostFoundController.deletePost,
);

export const LostFoundRoutes = router;
