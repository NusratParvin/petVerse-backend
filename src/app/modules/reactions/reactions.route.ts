import express from 'express';
import { USER_ROLE } from '../user/user.constants';

import auth from '../../middlewares/auth';
import { ReactionControllers } from './reactions.controller';

const router = express.Router();

router.get('/', auth(USER_ROLE.ADMIN), ReactionControllers.getAllReactions);

export const ReactionsRoutes = router;
