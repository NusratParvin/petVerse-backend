import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { LostFoundService } from './lostFound.service';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const { type, emirate, species, status, search } = req.query;
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
  const data = await LostFoundService.createPost(
    req.user._id as string,
    req.user.name as string,
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
    req.user._id as string,
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
    req.user._id as string,
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
    req.user._id as string,
    req.user.role as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted',
    data: null,
  });
});

export const LostFoundController = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  markResolved,
  deletePost,
};
