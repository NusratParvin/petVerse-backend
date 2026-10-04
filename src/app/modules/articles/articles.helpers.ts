import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { USER_ROLE } from '../user/user.constants';
import { Types } from 'mongoose';

export const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const buildExcerpt = (content: string, length = 160) => {
  const text = stripHtml(content);

  return text.length > length ? `${text.slice(0, length).trimEnd()}...` : text;
};

export const calcReadTime = (content: string) => {
  const wordsCount = stripHtml(content).split('').filter(Boolean).length;
  return Math.max(1, Math.ceil(wordsCount / 200));
};
export const checkCanModify = (
  authorId: Types.ObjectId,
  userId: string,
  userRole: string,
) => {
  const isOwner = authorId.toString() === userId;
  if (!isOwner && userRole !== USER_ROLE.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only modify your own articles',
    );
  }
};
