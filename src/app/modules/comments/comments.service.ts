import { Comment } from './comments.model';
import { Article } from '../articles/articles.model';
import { LostFound } from '../lostFound/lostFound.model';
import { TComment, TTargetType } from './comments.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import { TVoteType } from '../articles/articles.interface';
import { NotificationService } from '../notification/notification.service';

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

//   create

const createCommentIntoDB = async (payload: TComment, userId: string) => {
  const commentData = {
    ...payload,
    commenter: {
      commenterId: userId,
      name: payload.commenter.name,
      profilePhoto: payload.commenter.profilePhoto || '',
    },
  };
  // console.log(commentData);
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // find post owner
    let postOwnerId: string | null = null;

    if (payload.targetType === 'Article') {
      const article = await Article.findById(payload.targetId).select(
        'authorId',
      );
      postOwnerId = article?.authorId?.toString() || null;
    } else if (payload.targetType === 'LostFound') {
      const post = await LostFound.findById(payload.targetId).select(
        'postedBy',
      );
      postOwnerId = post?.postedBy?.toString() || null;
    }

    if (postOwnerId) {
      await NotificationService.createNotification({
        recipientId: postOwnerId,
        senderId: userId,
        senderName: payload.commenter.name,
        senderPhoto: payload.commenter.profilePhoto,
        type: payload.isSighting ? 'sighting' : 'comment',
        message: payload.isSighting
          ? `${payload.commenter.name} reported a sighting on your post`
          : `${payload.commenter.name} commented on your post`,
        targetType: payload.targetType,
        targetId: payload.targetId.toString(),
      });
    }

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

//   get by target

const getCommentsByTargetFromDB = async (
  targetType: TTargetType,
  targetId: string,
  page: string,
) => {
  // console.log('type');
  const pageNumber = Number(page) || 1;
  const limit = 3;
  const skip = (pageNumber - 1) * limit;
  const comments = await Comment.find({ targetType, targetId, parentId: null })
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  const commentIds = comments.map((c) => c._id);
  const replyCounts = await Comment.aggregate([
    {
      $match: {
        parentId: { $in: commentIds },
        // parentId: new Types.ObjectId('6a2fbc4e9287193265ebb560'),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$parentId',
        count: { $sum: 1 },
      },
    },
  ]);

  console.log(commentIds, 'commentIds');
  console.log(replyCounts, 'replyCounts');

  // const transformedComments: any = [];
  // comments.map((c) => {
  //   const repliesWithCounts=replyCounts.find((r) => c._id.equals(r._id))

  //   return {

  //     transformedComments.push({ ...c, replyCount: c.repliesWithCounts || 0})
  //   }

  // });

  const transformedComments = comments.map((c) => {
    const repliesWithCounts = replyCounts.find((r) => r._id.equals(c._id));
    return { ...c.toObject(), replyCount: repliesWithCounts?.count ?? 0 };
  });

  console.log(transformedComments);

  const total = await Comment.countDocuments({
    targetType,
    targetId,
    isDeleted: false,
    parentId: null,
  });

  const hasMore = skip + limit < total;

  return { comments: transformedComments, total, hasMore };
};

const getRepliesByParentIdFromDB = async (parentId: string, page: string) => {
  const pageNumber = Number(page);
  const limit = 3;
  const skip = (pageNumber - 1) * limit;

  // console.log(parentId, 'here');
  // const replies = await Comment.find({ parentId })
  //   .sort({ createdAt: -1 })
  //   .skip(skip)
  //   .limit(limit)
  //   .lean();

  // const total = await Comment.countDocuments({ parentId, isDeleted: false });

  // const [result] = await Comment.aggregate([
  //   {
  //     $match: {
  //       parentId: new mongoose.Types.ObjectId(parentId),
  //       isDeleted: false,
  //     },
  //   },
  //   {
  //     $facet: {
  //       replies: [
  //         { $sort: { createdAt: -1 } },
  //         {
  //           $skip: skip,
  //         },
  //         {
  //           $limit: limit,
  //         },
  //       ],
  //       totalCount: [{ $count: 'count' }],
  //     },
  //   },
  // ]);

  const [result] = await Comment.aggregate([
    {
      $match: {
        parentId: new mongoose.Types.ObjectId(parentId),
        isDeleted: false,
      },
    },
    {
      $facet: {
        replies: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },

          {
            $lookup: {
              from: 'comments',
              let: { replyId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$parentId', '$$replyId'],
                    },
                    isDeleted: false,
                  },
                },
                {
                  $count: 'count',
                },
              ],
              as: 'replyCounts',
            },
          },

          {
            $addFields: {
              replyCount: {
                $ifNull: [{ $first: '$replyCounts.count' }, 0],
              },
            },
          },

          {
            $project: {
              replyCounts: 0,
            },
          },
        ],

        totalCount: [
          {
            $count: 'count',
          },
        ],
      },
    },
  ]);
  // console.log(result.replies);
  const replies = result.replies;
  const total = result.totalCount[0].count || 0;
  const hasMore = skip + limit < total;

  // console.log(' Final:', { repliesCount: replies.length, total, hasMore });

  return { replies, hasMore, total };
};

//   update content

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

//   vote

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

//   soft delete

const deleteCommentFromDB = async (commentId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // soft delete
  comment.isDeleted = true;
  await comment.save();

  return { message: 'Comment deleted' };
};

//   mark helpful lead (owner only)

const markHelpfulLeadIntoDB = async (
  commentId: string,
  isHelpfulLead: boolean,
  requestingUserId: string,
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  comment.isHelpfulLead = isHelpfulLead;
  await comment.save();

  await NotificationService.createNotification({
    recipientId: comment.commenter.commenterId.toString(),
    senderId: requestingUserId,
    senderName: 'Post Owner',
    type: 'helpful_lead',
    message: 'Your sighting was marked as a helpful lead!',
    targetType: 'Comment',
    targetId: commentId,
  });

  return comment;
};

//   admin: get all with filters

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
  getRepliesByParentIdFromDB,
  updateCommentIntoDB,
  updateCommentVotesIntoDB,
  deleteCommentFromDB,
  markHelpfulLeadIntoDB,
  getAllCommentsFromDB,
};
