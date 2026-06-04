/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { catchAsync } from '../utils/catchAsync';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.headers.authorization;
    const token = authToken?.split(' ')[1];

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You have no access to this route',
      );
    }

    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;

    const { role, id, email, name } = decoded;
    // console.log(decoded, 'decoded');
    const user = await User.isUserExistsById(id);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
    }

    // if (
    //   user.passwordChangedAt &&
    //   User.isJWTIssuedBeforePasswordChanged(
    //     user.passwordChangedAt,
    //     iat as number
    //   )
    // ) {
    //   throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
    // }

    if (user.role !== role) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Role mismatch!You are not authorized !',
      );
    }

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You do not have permission to perform this action',
      );
    }

    req.user = decoded as JwtPayload;
    // console.log(req.user);
    next();
  });
};

export default auth;
