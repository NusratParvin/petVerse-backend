import express from 'express';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { USER_ROLE } from '../user/user.constants';
import { CommentValidation } from './comments.validate';
import { CommentControllers } from './comments.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

//   create
router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(CommentValidation.createCommentValidationSchema),
  CommentControllers.createComment,
);

router.get('/stats', auth(USER_ROLE.ADMIN), CommentControllers.getCommentStats);

//   get by target

router.get(
  '/replies/:parentId/:page',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  CommentControllers.getRepliesByParentId,
);

router.get(
  '/:targetType/:targetId/:page',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  CommentControllers.getCommentsByTarget,
);

//    get all
router.get('/', auth(USER_ROLE.ADMIN), CommentControllers.getAllComments);

//   update content
router.patch(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(CommentValidation.updateCommentValidationSchema),
  CommentControllers.updateComment,
);

//   vote
router.patch(
  '/:id/vote',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  CommentControllers.updateCommentVotes,
);

//   mark helpful lead
router.patch(
  '/:id/helpful-lead',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(CommentValidation.markHelpfulLeadValidationSchema),
  CommentControllers.markHelpfulLead,
);

//restore comment
router.patch(
  '/:id/restore',
  auth(USER_ROLE.ADMIN),
  CommentControllers.restoreComment,
);

//   soft delete
router.delete(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  CommentControllers.deleteComment,
);

export const CommentRoutes = router;
