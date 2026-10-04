import express from 'express';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { USER_ROLE } from '../user/user.constants';
import {
  createPostValidationSchema,
  createShareValidationSchema,
  updatePostValidationSchema,
  reactToPostValidationSchema,
} from './posts.validate';
import { PostControllers } from './posts.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(createPostValidationSchema),
  PostControllers.createPost,
);

router.post(
  '/share',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(createShareValidationSchema),
  PostControllers.sharePost,
);

// Home feed
router.get(
  '/feed',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  PostControllers.getFeed,
);

// Profile page — another user's (or your own) posts
router.get(
  '/user/:userId',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  PostControllers.getUserPosts,
);

router.get(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  PostControllers.getSinglePost,
);

router.patch(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(updatePostValidationSchema),
  PostControllers.updatePost,
);

router.delete(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  PostControllers.deletePost,
);

router.post(
  '/:id/react',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(reactToPostValidationSchema),
  PostControllers.reactToPost,
);

export const PostRoutes = router;
