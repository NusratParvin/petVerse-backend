import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PostServices } from './posts.service';

const createPost = catchAsync(async (req, res) => {
  const authorId = req.user.id;
  console.log(req.body);
  const result = await PostServices.createPostIntoDB(req.body, authorId);
  console.log(result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

const sharePost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { refId, refType, caption } = req.body;

  const result = await PostServices.createShareIntoDB(
    refId,
    refType,
    userId,
    caption,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shared successfully',
    data: result,
  });
});

// Home feed — supports ?page=&limit= for infinite scroll
const getFeed = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;

  const result = await PostServices.getFeedFromDB(page, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed retrieved successfully',
    data: result,
  });
});

// Profile page — a specific user's posts + shares
const getUserPosts = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await PostServices.getUserPostsFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User posts retrieved successfully',
    data: result,
  });
});

const updatePost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await PostServices.updatePostIntoDB(id, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await PostServices.deletePostFromDB(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: result,
  });
});

const reactToPost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { reactionType } = req.body;
  const result = await PostServices.reactToPostIntoDB(id, userId, reactionType);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reaction updated successfully',
    data: result,
  });
});

const getSinglePost = catchAsync(async (req, res) => {
  const result = await PostServices.getSinglePostFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post retrieved successfully',
    data: result,
  });
});

export const PostControllers = {
  createPost,
  sharePost,
  getFeed,
  getUserPosts,
  updatePost,
  deletePost,
  reactToPost,
  getSinglePost,
};
