import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';
import { NotificationControllers } from './notification.controller';

const router = express.Router();

// all routes require login
router.get(
  '/my',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  NotificationControllers.getMyNotifications,
);

router.patch(
  '/read-all',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  NotificationControllers.markAllAsRead,
);

router.patch(
  '/:id/read',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  NotificationControllers.markAsRead,
);

export const NotificationRoutes = router;
