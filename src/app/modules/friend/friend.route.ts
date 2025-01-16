import express from 'express';
import { FriendControllers } from './friend.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middlewares/auth';

const router = express.Router();

// Send a friend request
router.post(
  '/request',
  auth(USER_ROLE.USER),
  FriendControllers.sendFriendRequest,
);

// Accept a friend request
router.patch(
  '/accept/:id',
  auth(USER_ROLE.USER),
  FriendControllers.acceptFriendRequest,
);

// Reject a friend request
router.patch(
  '/reject/:id',
  auth(USER_ROLE.USER),
  FriendControllers.rejectFriendRequest,
);
// cancel a friend request
router.patch(
  '/cancel/:id',
  auth(USER_ROLE.USER),
  FriendControllers.cancelFriendRequest,
);

// Get all friend-related data
router.get('/', auth(USER_ROLE.USER), FriendControllers.getAllFriendData);

export const FriendRoutes = router;
