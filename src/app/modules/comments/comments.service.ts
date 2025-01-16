import { Comment } from './comments.model';
import { Article } from '../articles/articles.model';
import { TComment } from './comments.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import { TVoteType } from '../articles/articles.interface';

// Create a new comment
const createCommentIntoDB = async (payload: TComment, userId: string) => {
  const commentData = {
    ...payload,
    commenter: {
      commenterId: userId,
      name: payload.commenter.name,
      profilePhoto: payload.commenter.profilePhoto,
    },
  };
  console.log(commentData);

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Create comment
    const comment = await Comment.create([commentData], { session });
    if (!comment || comment.length === 0) {
      throw new Error('Comment creation failed');
    }

    const articleId = comment[0].articleId;
    await Article.findByIdAndUpdate(
      articleId,
      { $push: { comments: comment[0]._id } },
      { session, new: true },
    );

    await session.commitTransaction();

    return comment[0];
  } catch (error) {
    console.error('Error creating comment:', error);
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Update comment votes (upvote/downvote)
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

  // If user has already voted
  if (existingVote) {
    if (existingVote.voteType === action) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have already cast this vote',
      );
    } else {
      // Switching the vote type
      if (action === 'upvote') {
        comment.upvotes += 1;
        if (comment.downvotes > 0) {
          comment.downvotes -= 1; // Decrement downvote only if it's greater than 0
        }
      } else if (action === 'downvote') {
        comment.downvotes += 1;
        if (comment.upvotes > 0) {
          comment.upvotes -= 1; // Decrement upvote only if it's greater than 0
        }
      }

      // Update the user's vote type
      existingVote.voteType = action;
    }
  } else {
    // New vote
    if (action === 'upvote') {
      comment.upvotes += 1;
    } else if (action === 'downvote') {
      comment.downvotes += 1;
    }

    // Push the new vote info to the array
    comment.voteInfo.push({
      userId: new Types.ObjectId(userId),
      voteType: action,
    });
  }

  const updatedComment = await comment.save();
  if (!updatedComment) {
    throw new AppError(httpStatus.NOT_IMPLEMENTED, 'Vote update failed');
  }

  return updatedComment;
};

const updateCommentIntoDB = async (
  commentId: string,
  updateData: Partial<TComment>,
) => {
  const comment = await Comment.findById(commentId);
  console.log(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'No comment found');
  }

  //  updateData.updatedAt = new Date();

  // Find and update the comment
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    updateData,
    {
      new: true, // Return the updated comment
      runValidators: true, // Ensure the data being updated is valid
    },
  );

  // If update failed, throw error
  if (!updatedComment) {
    throw new AppError(httpStatus.NOT_IMPLEMENTED, 'Update failed');
  }

  return updatedComment; // Return the updated comment
};

const deleteCommentFromDB = async (commentId: string, articleId: string) => {
  // console.log(articleId);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isCommentExists = await Comment.findById(commentId);

    if (!isCommentExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'No comment found');
    }

    // Remove the comment ID from the article's comment list
    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      { $pull: { comments: commentId } }, // Pull the comment ID from the `comments` array
      { session, new: true }, // Make sure the session is used and return the updated document
    );

    if (!updatedArticle) {
      throw new AppError(httpStatus.NOT_FOUND, 'Article not found');
    }

    // Delete the comment itself
    const deletedComment = await Comment.deleteOne(
      { _id: commentId },
      { session },
    );

    if (deletedComment.deletedCount === 0) {
      throw new AppError(httpStatus.NOT_IMPLEMENTED, 'Delete failed');
    }

    await session.commitTransaction();
    session.endSession();

    return deletedComment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Get all comments for a specific article
const getCommentsByArticleIdFromDB = async (articleId: string) => {
  const comments = await Comment.find({ articleId }).populate(
    'commenter.commenterId',
    'name profilePhoto',
  );
  if (!comments) {
    throw new AppError(httpStatus.NOT_FOUND, 'No comments found');
  }

  return comments;
};

const getAllCommentsFromDB = async () => {
  const comments = await Comment.find();
  console.log(comments);

  if (!comments || comments.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No comments found  ');
  }
  return comments;
};

export const CommentServices = {
  createCommentIntoDB,
  getCommentsByArticleIdFromDB,
  updateCommentVotesIntoDB,
  updateCommentIntoDB,
  deleteCommentFromDB,
  getAllCommentsFromDB,
};
