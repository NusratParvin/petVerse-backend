import express from 'express';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { USER_ROLE } from '../user/user.constants';
import { ArticleValidation } from './articles.validate';
import { ArticleControllers } from './articles.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(ArticleValidation.createArticleValidationSchema),
  ArticleControllers.createArticle,
);

router.get('/', ArticleControllers.getAllArticles);

router.get(
  '/me',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  ArticleControllers.getMyArticles,
);

router.get(
  '/following',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  ArticleControllers.getFollowingArticles,
);

router.get('/:id', ArticleControllers.getSingleArticle);

router.patch(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  zodValidationRequest(ArticleValidation.updateArticleValidationSchema),
  ArticleControllers.updateArticle,
);

router.patch(
  '/:id/vote',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  ArticleControllers.voteArticle,
);
router.post(
  '/:articleId/react',
  auth(USER_ROLE.USER),
  ArticleControllers.reactToArticle,
);

router.patch(
  '/:id/publish',
  auth(USER_ROLE.ADMIN),
  ArticleControllers.publishArticle,
);

router.delete(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  ArticleControllers.deleteArticle,
);

router.get(
  '/dashboard-feed',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  ArticleControllers.getDashboardFeed,
);

export const ArticleRoutes = router;
