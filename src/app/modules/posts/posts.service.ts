import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Post } from './posts.model';
import { Article } from '../articles/articles.model';
import { TPost, TShareRefType } from './posts.interface';
import { ReactionServices } from '../reactions/reactions.service';
import { REACTION_TYPE } from '../reactions/reactions.interface';

const createPostIntoDB = async (payload: Partial<TPost>, userId: string) => {
  // figure out the type based on what was uploaded
  let type = 'text';
  if (payload.media && payload.media.length > 0) {
    type = payload.media[0].type === 'video' ? 'video' : 'photo';
  }
  // console.log(payload);
  const postData = { ...payload, authorId: userId, type };
  // console.log('------>postData', postData);
  const post = await Post.create(postData);
  return post;
};

const sharedContentPopulate = {
  path: 'refId',
  match: { isDeleted: { $ne: true } },
  populate: [
    {
      path: 'authorId',
      select: 'name profilePhoto',
      strictPopulate: false,
    },
    {
      path: 'petId',
      select: 'name species profilePhoto',
      strictPopulate: false,
    },
  ],
};

// Sharing an Article or another Post into the feed.

// const createShareIntoDB = async (
//   refId: string,
//   refType: TShareRefType,
//   userId: string,
//   caption?: string,
// ) => {
//   const session = await mongoose.startSession();
//   try {
//     session.startTransaction();

//     let original;
//     if (refType === 'Article') {
//       original = await Article.findById(refId).session(session);
//     } else {
//       original = await Post.findById(refId).session(session);
//     }

//     if (!original) {
//       throw new AppError(httpStatus.NOT_FOUND, `${refType} not found`);
//     }

//     const sharePost = await Post.create(
//       [
//         {
//           authorId: userId,
//           type: refType === 'Article' ? 'shared_article' : 'shared_post',
//           refId,
//           refType,
//           caption,
//         },
//       ],
//       { session },
//     );

//     if (refType === 'Article') {
//       await Article.findByIdAndUpdate(
//         refId,
//         { $inc: { shareCount: 1 } },
//         { session },
//       );
//     } else {
//       await Post.findByIdAndUpdate(
//         refId,
//         { $inc: { shareCount: 1 } },
//         { session },
//       );
//     }

//     await session.commitTransaction();
//     return sharePost[0];
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     session.endSession();
//   }
// };
const createShareIntoDB = async (
  refId: string,
  refType: TShareRefType,
  userId: string,
  caption?: string,
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // by default, point at what the user clicked
    let rootId: string = refId;
    let rootType: TShareRefType = refType;

    if (refType === 'Article') {
      // articles are never shares, so no refId to check
      const article = await Article.findOne({
        _id: refId,
        isDeleted: { $ne: true },
      }).session(session);
      if (!article)
        throw new AppError(httpStatus.NOT_FOUND, 'Article not found');
    } else {
      const post = await Post.findOne({
        _id: refId,
        isDeleted: { $ne: true },
      }).session(session);
      if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');

      // if the clicked post is itself a share, point at ITS original instead
      if (post.refId && post.refType) {
        rootId = post.refId.toString();
        rootType = post.refType;
      }
    }

    // create the share
    const [sharePost] = await Post.create(
      [
        {
          authorId: userId,
          type: rootType === 'Article' ? 'shared_article' : 'shared_post',
          refId: rootId,
          refType: rootType,
          caption,
        },
      ],
      { session },
    );

    // bump the root's share count
    if (rootType === 'Article') {
      await Article.findByIdAndUpdate(
        rootId,
        { $inc: { shareCount: 1 } },
        { session },
      );
    } else {
      await Post.findByIdAndUpdate(
        rootId,
        { $inc: { shareCount: 1 } },
        { session },
      );
    }

    await session.commitTransaction();
    return sharePost;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Home feed — every non-deleted post, newest first.
// refId is populated dynamically via refPath, so a shared_article post
// comes back with the full Article embedded, no extra query needed on
// the frontend.
const getFeedFromDB = async (page = 1, limit = 2) => {
  const skip = (page - 1) * limit;

  const posts = await Post.find({ isDeleted: false })
    .populate({ path: 'authorId', select: 'name profilePhoto' })
    .populate({ path: 'petId', select: 'name species profilePhoto' })
    // .populate({ path: 'refId' }) // resolves to Article or Post per refType
    .populate(sharedContentPopulate) // resolves to Article or Post per refType
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  console.log(posts, 'posts---->');
  return posts;
};

// Profile page — a specific user's own posts + their shares, same shape
// as the feed query, just scoped to one author.
const getUserPostsFromDB = async (userId: string) => {
  const posts = await Post.find({ authorId: userId, isDeleted: false })
    .populate({ path: 'petId', select: 'name species profilePhoto' })
    .populate({ path: 'refId' })
    .sort({ createdAt: -1 });

  return posts;
};

const updatePostIntoDB = async (
  postId: string,
  userId: string,
  updateData: Partial<TPost>,
) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (post.authorId.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only edit your own posts',
    );
  }

  const updated = await Post.findByIdAndUpdate(postId, updateData, {
    new: true,
    runValidators: true,
  });

  return updated;
};

const deletePostFromDB = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (post.authorId.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own posts',
    );
  }

  const deleted = await Post.findByIdAndUpdate(
    postId,
    { isDeleted: true },
    { new: true },
  );

  return deleted;
};

const reactToPostIntoDB = async (
  postId: string,
  userId: string,
  reactionType: REACTION_TYPE,
) => {
  return ReactionServices.toggleReactionInDB(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Post as any, // ← add as any
    'Post',
    postId,
    userId,
    reactionType,
  );
};

const getSinglePostFromDB = async (postId: string) => {
  const post = await Post.findOne({ _id: postId, isDeleted: false })
    .populate({ path: 'authorId', select: 'name profilePhoto' })
    .populate({ path: 'petId', select: 'name species profilePhoto' })
    .populate(sharedContentPopulate);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  console.log(post);
  return post;
};

export const PostServices = {
  createPostIntoDB,
  createShareIntoDB,
  getFeedFromDB,
  getUserPostsFromDB,
  updatePostIntoDB,
  deletePostFromDB,
  reactToPostIntoDB,
  getSinglePostFromDB,
};
