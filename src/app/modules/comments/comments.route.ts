import express from 'express';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { USER_ROLE } from '../user/user.constants';
import { CommentValidation } from './comments.validate';
import { CommentControllers } from './comments.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Create a comment
router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(CommentValidation.createCommentValidationSchema),
  CommentControllers.createComment,
);
router.get('/', auth(USER_ROLE.ADMIN), CommentControllers.getAllComments);

// Get comments by article ID (this is likely the missing route)
router.get(
  '/article/:articleId',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  CommentControllers.getCommentsByArticleId,
);

// Update a comment
router.patch(
  '/:id',
  auth(USER_ROLE.USER),
  zodValidationRequest(CommentValidation.updateCommentValidationSchema),
  CommentControllers.updateComment,
);

// Delete a comment
router.delete(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  CommentControllers.deleteComment,
);

// Upvote/Downvote a comment
router.patch(
  '/:id/vote',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  CommentControllers.updateCommentVotes,
);

router.get(
  '/article/:articleId/comments',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  CommentControllers.getCommentsByArticleId,
);

export const CommentRoutes = router;
