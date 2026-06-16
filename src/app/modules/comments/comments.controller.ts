import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { CommentServices } from './comments.service';
import { TTargetType } from './comments.interface';

// ─── create ──────────────────────────────────────────────────────────────────

const createComment = catchAsync(async (req, res) => {
  const commenterId = req.user.id;
  const commentData = {
    ...req.body,
    commenter: {
      ...req.body.commenter,
      commenterId,
    },
  };

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

// ─── get by target ────────────────────────────────────────────────────────────
// GET /comments/:targetType/:targetId
// e.g. /comments/Article/abc123
//      /comments/LostFound/xyz789

const getCommentsByTarget = catchAsync(async (req, res) => {
  const { targetType, targetId, page } = req.params;

  const result = await CommentServices.getCommentsByTargetFromDB(
    targetType as TTargetType,
    targetId,
    page,
  );
  // console.log(result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments retrieved successfully',
    data: result,
  });
});

const getRepliesByParentId = catchAsync(async (req, res) => {
  console.log(req.params);
  const { parentId, page } = req.params;
  const result = await CommentServices.getRepliesByParentIdFromDB(
    parentId,
    page,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Replies fetched successfully',
    data: result,
  });
});

// ─── update content ───────────────────────────────────────────────────────────

const updateComment = catchAsync(async (req, res) => {
  const commentId = req.params.id;
  const updateData = req.body;

  const result = await CommentServices.updateCommentIntoDB(
    commentId,
    updateData,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

// ─── vote ─────────────────────────────────────────────────────────────────────

const updateCommentVotes = catchAsync(async (req, res) => {
  const commentId = req.params.id;
  const { voteType } = req.body;
  const userId = req.user.id;

  const result = await CommentServices.updateCommentVotesIntoDB(
    commentId,
    voteType,
    userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vote updated successfully',
    data: result,
  });
});

// ─── soft delete ──────────────────────────────────────────────────────────────

const deleteComment = catchAsync(async (req, res) => {
  const { id: commentId } = req.params;

  const result = await CommentServices.deleteCommentFromDB(commentId);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: result,
  });
});

// ─── mark helpful lead ────────────────────────────────────────────────────────
// only the post owner should call this — enforce on frontend for now

const markHelpfulLead = catchAsync(async (req, res) => {
  const { id: commentId } = req.params;
  const { isHelpfulLead } = req.body;

  const result = await CommentServices.markHelpfulLeadIntoDB(
    commentId,
    isHelpfulLead,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Helpful lead updated',
    data: result,
  });
});

// ─── admin: all comments ──────────────────────────────────────────────────────
// GET /comments?targetType=LostFound&isSighting=true

const getAllComments = catchAsync(async (req, res) => {
  const { targetType, isSighting, isHelpfulLead } = req.query;

  const result = await CommentServices.getAllCommentsFromDB({
    targetType: targetType as TTargetType | undefined,
    isSighting: isSighting !== undefined ? isSighting === 'true' : undefined,
    isHelpfulLead:
      isHelpfulLead !== undefined ? isHelpfulLead === 'true' : undefined,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All comments retrieved successfully',
    data: result,
  });
});

export const CommentControllers = {
  createComment,
  getCommentsByTarget,
  getRepliesByParentId,
  updateComment,
  updateCommentVotes,
  deleteComment,
  markHelpfulLead,
  getAllComments,
};
