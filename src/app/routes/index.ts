import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { ArticleRoutes } from '../modules/articles/articles.route';
import { CommentRoutes } from '../modules/comments/comments.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { ShareRoutes } from '../modules/shares/shares.route';
import { FriendRoutes } from '../modules/friend/friend.route';
import { PageRoutes } from '../modules/page/page.route';
import { ReactionsRoutes } from '../modules/reactions/reactions.route';
import { PetRoutes } from '../modules/pets/pets.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/articles', route: ArticleRoutes },
  { path: '/comments', route: CommentRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/share', route: ShareRoutes },
  { path: '/friends', route: FriendRoutes },
  { path: '/pages', route: PageRoutes },
  { path: '/reactions', route: ReactionsRoutes },
  { path: '/pets', route: PetRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
