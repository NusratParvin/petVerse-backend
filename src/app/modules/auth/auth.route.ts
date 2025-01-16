import express from 'express';
import zodValidationRequest from '../../middlewares/zodValidationRequest';
import { AuthValidation } from './auth.validate';
import { AuthControllers } from './auth.controller';
import { userValidation } from '../user/user.validate';
// import { USER_ROLE } from '../user/user.constants';
// import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/signup',
  zodValidationRequest(userValidation.createUserSchema),
  AuthControllers.signUp,
);

router.post(
  '/login',
  zodValidationRequest(AuthValidation.loginValidationSchema),

  AuthControllers.login,
);

router.post(
  '/social-login',
  zodValidationRequest(AuthValidation.socialLoginSchema),
  AuthControllers.socialLogin,
);

router.post(
  '/forget-password',
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  zodValidationRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword,
);

router.post(
  '/change-password',
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  zodValidationRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword,
);

// router.post(
//   '/refresh-token',
//   zodValidationRequest(AuthValidation.refreshTokenValidationSchema),
//   AuthControllers.refreshToken,
// );

router.post(
  '/reset-password',
  // auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  zodValidationRequest(AuthValidation.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

export const AuthRoutes = router;
