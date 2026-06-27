/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { LostFoundService } from './lostFound.service';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const { type, emirate, species, status, search } = req.query;
  // console.log(req.query);
  const data = await LostFoundService.getAllPosts({
    type: type as any,
    emirate: emirate as any,
    species: species as string,
    status: status as string,
    search: search as string,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts fetched',
    data,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const data = await LostFoundService.getPostById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post fetched',
    data,
  });
});

const createPost = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.user, req.body);
  const data = await LostFoundService.createPost(
    req.user.id as string,
    req.user.name as string,
    req.user.email as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Post created',
    data,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const data = await LostFoundService.updatePost(
    req.params.id,
    req.user.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated',
    data,
  });
});

const markResolved = catchAsync(async (req: Request, res: Response) => {
  const data = await LostFoundService.markResolved(
    req.params.id,
    req.user.id as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Marked as resolved',
    data,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  await LostFoundService.deletePost(
    req.params.id,
    req.user.id as string,
    req.user.role as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted',
    data: null,
  });
});

const getAllPostsForAdmin = catchAsync(async (req, res) => {
  const result = await LostFoundService.getAllPostsForAdminFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getLostFoundStats = catchAsync(async (req, res) => {
  const result = await LostFoundService.getLostFoundStatsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stats retrieved',
    data: result,
  });
});

const adminDeletePost = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await LostFoundService.adminDeletePostFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted',
    data: result,
  });
});

const adminMarkResolved = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await LostFoundService.adminMarkResolvedInDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post marked as resolved',
    data: result,
  });
});

const getPostForAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await LostFoundService.getPostForAdminFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post retrieved',
    data: result,
  });
});

const contactOwnerByEmail = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { subject, message } = req.body;
  console.log(id, subject, message);
  const result = await LostFoundService.contactOwnerByEmailFromDB(
    id,
    subject,
    message,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email sent successfully',
    data: result,
  });
});

const contactOwnerByWhatsApp = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  const result = await LostFoundService.contactOwnerByWhatsAppFromDB(
    id,
    message,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'WhatsApp sent successfully',
    data: result,
  });
});

export const LostFoundController = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  markResolved,
  deletePost,

  getAllPostsForAdmin,
  getLostFoundStats,
  adminDeletePost,
  adminMarkResolved,

  getPostForAdmin,
  contactOwnerByEmail,
  contactOwnerByWhatsApp,
};
