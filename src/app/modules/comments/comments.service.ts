import { Comment } from './comments.model';
import { Article } from '../articles/articles.model';
import { LostFound } from '../lostFound/lostFound.model';
import { TComment, TTargetType } from './comments.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import { TVoteType } from '../articles/articles.interface';

// ─── helpers  ──────

// push comment id into the parent document's comments array
const pushCommentToParent = async (
  targetType: TTargetType,
  targetId: string,
  commentId: Types.ObjectId,
  session: mongoose.ClientSession,
) => {
  if (targetType === 'Article') {
    await Article.findByIdAndUpdate(
      targetId,
      { $push: { comments: commentId } },
      { session },
    );
  } else if (targetType === 'LostFound') {
    await LostFound.findByIdAndUpdate(
      targetId,
      { $push: { comments: commentId } },
      { session },
    );
  }
};

// ─── create  ───────

const createCommentIntoDB = async (payload: TComment, userId: string) => {
  const commentData = {
    ...payload,
    commenter: {
      commenterId: userId,
      name: payload.commenter.name,
      profilePhoto: payload.commenter.profilePhoto || '',
    },
  };

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const comment = await Comment.create([commentData], { session });
    if (!comment || comment.length === 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Comment creation failed');
    }

    await pushCommentToParent(
      payload.targetType,
      payload.targetId.toString(),
      comment[0]._id,
      session,
    );

    await session.commitTransaction();
    return comment[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ─── get by target  ─

// used by both article comment section and lost & found comment section
// const getCommentsByTargetFromDB = async (
//   targetType: TTargetType,
//   targetId: string,
//   page: string,
// ) => {
//   // pre('find') hook filters isDeleted: false automatically
//   const pageNumber = Number(page) || 1;
//   const limit = 1;
//   const skip = (pageNumber - 1) * 1;
//   const comments = await Comment.find({ targetType, targetId })
//     .sort({
//       createdAt: -1,
//     })
//     .skip(skip)
//     .limit(limit);

//   const total = await Comment.countDocuments({
//     targetType,
//     targetId,
//     isDeleted: false,
//   });

//   const hasMore = skip + limit < total;

//   return { comments, total, hasMore };
// };

const getCommentsByTargetFromDB = async (
  targetType: TTargetType,
  targetId: string,
  page: string,
) => {
  const pageNumber = Number(page) || 1;
  const limit = 10; // Root comments per page
  const skip = (pageNumber - 1) * limit;

  // Step 1: Get paginated ROOT comments only
  const rootComments = await Comment.find({
    targetType,
    targetId,
    $or: [{ parentId: { $exists: false } }, { parentId: null }],
    isDeleted: false,
  })
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .lean();

  if (!rootComments.length) {
    return {
      comments: [],
      total: 0,
      hasMore: false,
    };
  }

  // Step 2: Get ALL replies for these root comments
  const rootIds = rootComments.map((c) => c._id);
  const allReplies = await Comment.find({
    targetType,
    targetId,
    parentId: { $in: rootIds },
    isDeleted: false,
  })
    .sort({ createdAt: 1 }) // Oldest first for replies
    .lean();

  // Step 3: Build a map of ALL comments (roots + replies)
  const commentMap = new Map();

  // Add all root comments to map
  rootComments.forEach((comment) => {
    commentMap.set(comment._id.toString(), {
      ...comment,
      replies: [],
    });
  });

  // Add all replies to map
  allReplies.forEach((reply) => {
    commentMap.set(reply._id.toString(), {
      ...reply,
      replies: [],
    });
  });

  // Step 4: Build parent-child relationships
  const nestedComments = [];

  rootComments.forEach((root) => {
    const rootNode = commentMap.get(root._id.toString());
    nestedComments.push(rootNode);
  });

  allReplies.forEach((reply) => {
    const parentId = reply.parentId?.toString();
    if (parentId && commentMap.has(parentId)) {
      const parent = commentMap.get(parentId);
      const replyNode = commentMap.get(reply._id.toString());
      parent.replies.push(replyNode);
    }
  });

  // Step 5: Sort replies within each parent (oldest first)
  const sortRepliesRecursively = (comments: any[]) => {
    comments.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a: any, b: any) => a.createdAt - b.createdAt);
        sortRepliesRecursively(comment.replies);
      }
    });
  };
  sortRepliesRecursively(nestedComments);

  // Step 6: Get total count for pagination
  const total = await Comment.countDocuments({
    targetType,
    targetId,
    $or: [{ parentId: { $exists: false } }, { parentId: null }],
    isDeleted: false,
  });

  const hasMore = skip + limit < total;

  return {
    comments: nestedComments,
    total,
    hasMore,
  };
};

// ─── update content

const updateCommentIntoDB = async (
  commentId: string,
  updateData: Partial<TComment>,
) => {
  console.log(updateData, 'update');
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const updated = await Comment.findByIdAndUpdate(commentId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Update failed');
  }

  return updated;
};

// ─── vote  ──────────

const updateCommentVotesIntoDB = async (
  commentId: string,
  action: TVoteType,
  userId: string,
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const existingVote = comment.voteInfo.find(
    (vote) => vote.userId.toString() === userId,
  );

  if (existingVote) {
    if (existingVote.voteType === action) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You already cast this vote');
    }
    // switch vote
    if (action === 'upvote') {
      comment.upvotes += 1;
      if (comment.downvotes > 0) comment.downvotes -= 1;
    } else {
      comment.downvotes += 1;
      if (comment.upvotes > 0) comment.upvotes -= 1;
    }
    existingVote.voteType = action;
  } else {
    // new vote
    if (action === 'upvote') comment.upvotes += 1;
    else comment.downvotes += 1;

    comment.voteInfo.push({
      userId: new Types.ObjectId(userId),
      voteType: action,
    });
  }

  const updated = await comment.save();
  if (!updated) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Vote update failed');
  }

  return updated;
};

// ─── soft delete  ───

const deleteCommentFromDB = async (commentId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // soft delete — no transaction needed, no pulling from parent
  comment.isDeleted = true;
  await comment.save();

  return { message: 'Comment deleted' };
};

// ─── mark helpful lead (owner only) ─────────────────────────────────────────

const markHelpfulLeadIntoDB = async (
  commentId: string,
  isHelpfulLead: boolean,
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  comment.isHelpfulLead = isHelpfulLead;
  await comment.save();

  return comment;
};

// ─── admin: get all with filters ─────────────────────────────────────────────

const getAllCommentsFromDB = async (query: {
  targetType?: TTargetType;
  isSighting?: boolean;
  isHelpfulLead?: boolean;
}) => {
  const filter: Record<string, unknown> = {};

  if (query.targetType) filter.targetType = query.targetType;
  if (query.isSighting !== undefined) filter.isSighting = query.isSighting;
  if (query.isHelpfulLead !== undefined)
    filter.isHelpfulLead = query.isHelpfulLead;

  // admin needs to see deleted comments too — bypass the pre hook
  const comments = await Comment.find(filter)
    .setOptions({ bypassPreHooks: true })
    .sort({ createdAt: -1 });

  return comments;
};

export const CommentServices = {
  createCommentIntoDB,
  getCommentsByTargetFromDB,
  updateCommentIntoDB,
  updateCommentVotesIntoDB,
  deleteCommentFromDB,
  markHelpfulLeadIntoDB,
  getAllCommentsFromDB,
};
