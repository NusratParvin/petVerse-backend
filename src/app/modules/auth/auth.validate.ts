import { z } from 'zod';

const socialLoginSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  profilePhoto: z.string().optional(),
  provider: z.string().refine((val) => ['google', 'facebook'].includes(val), {
    message: 'Invalid provider',
  }),
});

const loginValidationSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),

  password: z.string({ required_error: 'Password is required' }),
});

const forgetPasswordValidationSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required!',
    })
    .email('Invalid email address!'),
});

const resetPasswordValidationSchema = z.object({
  id: z.string({
    required_error: 'User id is required!',
  }),
  newPassword: z.string({
    required_error: 'User password is required!',
  }),
  // token: z.string({
  //   required_error: 'Token is required!',
  // }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

const changePasswordValidationSchema = z.object({
  oldPassword: z.string({
    required_error: 'Old password is required',
  }),
  newPassword: z.string({ required_error: 'Password is required' }),
});

export const AuthValidation = {
  socialLoginSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};
