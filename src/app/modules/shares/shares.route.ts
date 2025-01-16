import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';
import { ShareControllers } from './shares.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  ShareControllers.shareArticle,
);

export const ShareRoutes = router;
