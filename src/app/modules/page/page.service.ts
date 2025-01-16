import { Page } from './page.model';
import { toObjectId } from '../../utils/objectCheck';
import { startSession, Types } from 'mongoose';
import { User } from '../user/user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createPageIntoDB = async (
  name: string,
  description: string,
  userId: string,
) => {
  const page = await Page.create({
    name,
    description,
    createdBy: toObjectId(userId),
    members: [toObjectId(userId)],
    admins: [toObjectId(userId)],
  });
  // console.log(page);
  return page;
};

const inviteToPageIntoDB = async (pageId: string, userId: string) => {
  const session = await startSession();
  try {
    session.startTransaction();
    const page = await Page.findOneAndUpdate(
      { _id: toObjectId(pageId), members: { $ne: toObjectId(userId) } },
      { $addToSet: { pendingInvites: toObjectId(userId) } },
      { new: true, session },
    );

    if (!page) {
      throw new Error('Page not found or user already a member');
    }

    await User.findByIdAndUpdate(
      toObjectId(userId),
      { $addToSet: { pendingInvites: toObjectId(pageId) } },
      { new: true, session },
    );

    await session.commitTransaction();
    return page;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const acceptInvitationIntoDB = async (pageId: string, userId: string) => {
  const hasInvited = await Page.findOne({
    _id: toObjectId(pageId),
    pendingInvites: toObjectId(userId),
  });

  if (!hasInvited)
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Page not found or no pending invitation',
    );

  const session = await startSession();
  let transactionSuccessful = false;

  try {
    session.startTransaction();
    const pageUpdate = await Page.findByIdAndUpdate(
      toObjectId(pageId),
      {
        $pull: { pendingInvites: toObjectId(userId) },
        $push: { members: toObjectId(userId) },
      },
      { new: true, session },
    );

    const userUpdate = await User.findByIdAndUpdate(toObjectId(userId), {
      $pull: { pendingInvites: toObjectId(pageId) },
    });
    if (pageUpdate && userUpdate) {
      await session.commitTransaction();

      transactionSuccessful = true;
    } else {
      throw new Error('Failed to update user or page');
    }
  } catch (error) {
    await session.abortTransaction();
  } finally {
    session.endSession();
  }

  return transactionSuccessful;
};

const rejectInvitationIntoDB = async (pageId: string, userId: string) => {
  const hasInvited = await Page.findOne({
    _id: toObjectId(pageId),
    pendingInvites: toObjectId(userId),
  });

  if (!hasInvited)
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Page not found or no pending invitation',
    );

  const session = await startSession();
  let transactionSuccessful = false;

  try {
    session.startTransaction();
    const pageUpdate = await Page.findByIdAndUpdate(
      toObjectId(pageId),
      {
        $pull: { pendingInvites: toObjectId(userId) },
      },
      { new: true, session },
    );

    const userUpdate = await User.findByIdAndUpdate(toObjectId(userId), {
      $pull: { pendingInvites: toObjectId(pageId) },
    });
    if (pageUpdate && userUpdate) {
      await session.commitTransaction();

      transactionSuccessful = true;
    } else {
      throw new Error('Failed to update user or page');
    }
  } catch (error) {
    await session.abortTransaction();
  } finally {
    session.endSession();
  }

  return transactionSuccessful;
};

const getPageDetailsFromDB = async (pageId: string) => {
  const page = await Page.findById(toObjectId(pageId))
    .populate('members', 'name profilePhoto')
    .populate('pendingInvites', 'name profilePhoto');

  if (!page) throw new Error('Page not found');
  // console.log(page);
  return page;
};

const getMyPagesFromDB = async (id: string) => {
  const pages = await Page.find({ createdBy: new Types.ObjectId(id) })
    .populate('members', 'name profilePhoto')
    .populate('pendingInvites', 'name profilePhoto');

  if (!pages) throw new Error('Page not found');
  // console.log(pages);
  return pages;
};

export const PageServices = {
  createPageIntoDB,
  inviteToPageIntoDB,
  acceptInvitationIntoDB,
  rejectInvitationIntoDB,
  getPageDetailsFromDB,
  getMyPagesFromDB,
};
