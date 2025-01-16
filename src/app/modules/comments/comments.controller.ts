import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { CommentServices } from './comments.service';

// Create a comment
const createComment = catchAsync(async (req, res) => {
  const commenterId = req.user.id;
  const commentData = {
    ...req.body,
  };
  console.log(commentData);
  const result = await CommentServices.createCommentIntoDB(
    commentData,
    commenterId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment created successfully',
    data: result,
  });
});

// Get comments by articleId
const getCommentsByArticleId = catchAsync(async (req, res) => {
  const { articleId } = req.params;

  const result = await CommentServices.getCommentsByArticleIdFromDB(articleId);
  console.log(result);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments retrieved successfully',
    data: result,
  });
});

// Update a comment
const updateComment = catchAsync(async (req, res) => {
  const commentId = req.params.id;
  const updateData = req.body;

  const updatedComment = await CommentServices.updateCommentIntoDB(
    commentId,
    updateData,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: updatedComment,
  });
});

// Vote on a comment
const updateCommentVotes = catchAsync(async (req, res) => {
  const commentId = req.params.id;
  const { voteType } = req.body;
  const userId = req.user.id;

  const updatedComment = await CommentServices.updateCommentVotesIntoDB(
    commentId,
    voteType,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment vote updated successfully',
    data: updatedComment,
  });
});

// Delete a comment
const deleteComment = catchAsync(async (req, res) => {
  const { id: commentId } = req.params;
  const { articleId } = req.body;

  const deletedComment = await CommentServices.deleteCommentFromDB(
    commentId,
    articleId,
  );

  if (!deletedComment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: deletedComment,
  });
});

const getAllComments = catchAsync(async (req, res) => {
  const result = await CommentServices.getAllCommentsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Comments retrieved successfully',
    data: result,
  });
});

export const CommentControllers = {
  createComment,
  getCommentsByArticleId,
  updateComment,
  updateCommentVotes,
  deleteComment,
  getAllComments,
};
