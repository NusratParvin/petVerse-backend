import express from 'express';
import { PageControllers } from './page.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';

const router = express.Router();

// Create a page
router.post('/', auth(USER_ROLE.USER), PageControllers.createPage);

// Invite a user to the page
router.post(
  '/:pageId/invite',
  auth(USER_ROLE.USER),
  PageControllers.inviteToPage,
);

// Accept page invitation
router.patch(
  '/:pageId/accept',
  auth(USER_ROLE.USER),
  PageControllers.acceptInvitation,
);

// Reject page invitation
router.patch(
  '/:pageId/reject',
  auth(USER_ROLE.USER),
  PageControllers.rejectInvitation,
);

// View page details (including members and invites)
router.get('/:pageId', PageControllers.getPageDetails);
router.get('/', auth(USER_ROLE.USER), PageControllers.getMyPages);

export const PageRoutes = router;
