import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { TLoginUser } from './auth.interface';
import { User } from '../user/user.model';
import { createJwtToken } from './auth.utils';
import config from '../../config';
import { TUser } from '../user/user.interface';
import { sendEmail } from '../../utils/sendEmail';

const signUp = async (payload: TUser) => {
  const userExists = await User.isUserExistsByEmail(payload.email);

  if (userExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  const result = await User.create(payload);
  const user = result.toJSON();

  return user;
};

const login = async (payload: TLoginUser) => {
  //   console.log(payload);
  const userExists = await User.isUserExistsByEmail(payload.email);

  if (!userExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'User does not exists');
  }

  const isPasswordMatched = await User.isPasswordMatched(
    payload?.password,
    userExists?.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match!');
  }
  // if (!userExists._id) {
  //   throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'User ID not found');
  // }
  const jwtPayload = {
    email: userExists.email,
    id: userExists._id as string,
    role: userExists.role,
  };

  const accessToken = createJwtToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  // console.log(accessToken);
  const refreshToken = createJwtToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
    userExists,
  };
};

const socialLogin = async ({
  email,
  name,
  profilePhoto,
  provider,
}: {
  email: string;
  name: string;
  profilePhoto?: string;
  provider: string;
}) => {
  // console.log('Starting socialLogin service...');
  // console.log('Incoming data:', { email, name, profilePhoto, provider });

  try {
    // console.log('Checking if user already exists...');
    let user = await User.findOne({ email });

    if (!user) {
      // console.log('User not found. Creating new user...');
      user = await User.create({
        email,
        name,
        profilePhoto,
        password: `${provider}-${Date.now()}`, // Dummy password
        role: 'USER',
        phone: '',
        address: '',
        bio: '',

        followers: [],
        following: [],
        articles: [],
      });
      // console.log('New user created:', user);
    } else {
      console.log('User already exists:', user);
    }

    // Generate tokens
    const jwtPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    // console.log('Generating JWT tokens...');
    // console.log('JWT Payload:', jwtPayload);

    const accessToken = createJwtToken(
      jwtPayload,
      process.env.JWT_ACCESS_SECRET!,
      process.env.JWT_ACCESS_EXPIRES_IN!,
    );
    // console.log('Access token generated.');

    const refreshToken = createJwtToken(
      jwtPayload,
      process.env.JWT_REFRESH_SECRET!,
      process.env.JWT_REFRESH_EXPIRES_IN!,
    );
    // console.log('Refresh token generated.');

    // console.log('Returning tokens and user...');
    return { accessToken, refreshToken, user };
  } catch (error) {
    console.error('Error in socialLogin service:', error);
    throw new Error('Social login failed.');
  }
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const user = await User.isUserExistsById(userData.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  //checking if the current password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password mismatch');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

// const refreshToken = async (token: string) => {
//   // checking if the given token is valid
//   const decoded = verifyToken(token, config.jwt_refresh_secret as string);

//   const { userId, iat } = decoded;

//   // checking if the user is exist
//   const user = await User.isUserExistsByCustomId(userId);

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
//   }
//   // checking if the user is already deleted
//   const isDeleted = user?.isDeleted;

//   if (isDeleted) {
//     throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
//   }

//   // checking if the user is blocked
//   const userStatus = user?.status;

//   if (userStatus === 'blocked') {
//     throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
//   }

//   if (
//     user.passwordChangedAt &&
//     User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
//   ) {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
//   }

//   const jwtPayload = {
//     userId: user.id,
//     role: user.role,
//   };

//   const accessToken = createToken(
//     jwtPayload,
//     config.jwt_access_secret as string,
//     config.jwt_access_expires_in as string,
//   );

//   return {
//     accessToken,
//   };
// };

const forgetPassword = async (userEmail: string) => {
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  const resetToken = createJwtToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );

  const resetUILink = `${config.reset_pass_ui_link}/reset-password?id=${user.id}&token=${resetToken} `;

  await sendEmail(user.email, 'Reset Your Password', resetUILink);
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string,
) => {
  // console.log(payload, token);
  const user = await User.isUserExistsById(payload?.id);
  // console.log(user);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;

  if (payload.id !== decoded.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are forbidden from resetting this password!',
    );
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updatedUser = await User.findByIdAndUpdate(
    decoded.id,
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
    { new: true },
  );

  if (!updatedUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update the password!',
    );
  }

  return updatedUser;
};

export const AuthServices = {
  signUp,
  login,
  socialLogin,
  changePassword,
  forgetPassword,
  resetPassword,
};
