import express from 'express';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { userValidation } from './user.validate';
import auth from '../../middlewares/auth';
import { UserControllers } from './user.controller';
import { USER_ROLE } from './user.constants';

const router = express.Router();

router.get(
  '/me',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  UserControllers.getUser,
);
router.get('/friend/:id', auth(USER_ROLE.USER), UserControllers.getFriend);

router.put(
  '/me',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  zodValidationRequest(userValidation.updateUserSchema),
  UserControllers.updateUserProfile,
);

router.get('/', auth(USER_ROLE.ADMIN), UserControllers.getAllUsers);

router.delete('/:id', auth(USER_ROLE.ADMIN), UserControllers.deleteUser);

router.put('/:id', auth(USER_ROLE.ADMIN), UserControllers.updateUserRole);

router.patch(
  '/:id/follow',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  UserControllers.followUser,
);

router.get('/most-followed', UserControllers.getMostFollowedAuthors);

export const UserRoutes = router;
