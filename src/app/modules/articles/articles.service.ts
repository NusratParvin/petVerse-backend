import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Article } from './articles.model';
import { TArticle, TVoteType } from './articles.interface';
import { User } from '../user/user.model';
import mongoose, { Types } from 'mongoose';
import { Reaction } from '../reactions/reactions.model';
import { REACTION_TYPE } from '../reactions/reactions.interface';
import { buildExcerpt, calcReadTime, checkCanModify } from './articles.helpers';
import { extract } from '../../utils/extract';
import {
  articleFilterableFields,
  articlePaginationFields,
} from './articles.constants';
import pagination from '../../utils/pagination';

const createArticleIntoDB = async (payload: TArticle, userId: string) => {
  const { title, content, category, petType, tags, images, isPremium, price } =
    payload;

  if (isPremium && (!price || price <= 0)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Premium articles need a price greater than 0',
    );
  }

  const articleData = {
    title,
    content,
    category,
    petType,
    tags,
    images,
    isPremium,
    price: isPremium ? price : 0,

    authorId: new Types.ObjectId(userId),
    excerpt: buildExcerpt(content),
    readTime: calcReadTime(content),
  };

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const article = await Article.create([articleData], { session });

    if (!article || article.length === 0) {
      throw new Error('Article creation failed');
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $push: { articles: article[0]._id },
      },
      {
        session,
        new: true,
      },
    );
    await session.commitTransaction();
    return article[0];
  } catch (error) {
    console.error('Error creating article:', error);
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// const getAllArticlesFromDB = async () => {
//   const result = await Article.find()
//     .populate({
//       path: 'authorId',
//       select: 'name profilePhoto followers',
//     })
//     .sort({ createdAt: -1 });
//   return result;
// };

// Get a single article by ID

const getAllArticlesFromDB = async (query: Record<string, unknown>) => {
  const filterableFields = extract(query, articleFilterableFields);
  const paginationOptions = extract(query, articlePaginationFields);

  const { page, limit, skip, sortBy, sortOrder } =
    pagination(paginationOptions);

  const filter: Record<string, unknown> = {
    isPublish: true,
    isDeleted: { $ne: true },
  };

  // Search in title, content and tags
  const searchTerm = query.searchTerm?.trim();
  if (searchTerm) {
    const regex = new RegExp(escapeRegex(searchTerm), 'i');
    filter.$or = [{ title: regex }, { content: regex }, { tags: regex }];
  }

  // Unknown values (like "All") are simply ignored
  const category = pickAllowed(query.category, ARTICLE_CATEGORIES);
  if (category) filter.category = category;

  const petType = pickAllowed(query.petType, PET_TYPES);
  if (petType) filter.petType = petType;

  if (query.isPremium === 'true') filter.isPremium = true;
  if (query.isPremium === 'false') filter.isPremium = false;

  // Date range
  const range = pickAllowed(query.range, ARTICLE_RANGES);
  if (range && range !== 'all') {
    filter.createdAt = {
      $gte: new Date(Date.now() - RANGE_DAYS[range] * DAY_MS),
    };
  }

  const sort = SORT_MAP[pickAllowed(query.sort, ARTICLE_SORTS) ?? 'newest'];

  const [data, total] = await Promise.all([
    Article.find(filter)
      .select('-content') // the list uses the excerpt, not the full text
      .populate({ path: 'authorId', select: 'name profilePhoto followers' })
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Article.countDocuments(filter),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSingleArticleFromDB = async (articleId: string) => {
  const article = await Article.findByIdAndUpdate(
    articleId,
    { $inc: { viewCount: 1 } },
    { new: true },
  )
    .populate({
      path: 'comments',
      model: 'Comment',
      select:
        'content commenter upvotes downvotes createdAt updatedAt voteInfo',
    })
    .populate({
      path: 'authorId',
      select: 'name profilePhoto followers following ',
    });

  if (!article || article.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  return article;
};

const updateArticleVotesIntoDB = async (
  articleId: string,
  action: TVoteType,
  userId: string,
) => {
  if (action !== 'upvote' && action !== 'downvote') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Action must be "upvote" or "downvote"',
    );
  }

  const article = await Article.findById(articleId);

  if (!article || article.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Article not found');
  }

  const existingVote = article.voteInfo.find(
    (vote) => vote.userId.toString() === userId,
  );

  if (!existingVote) {
    // 1. First vote from this user
    article.voteInfo.push({
      userId: new Types.ObjectId(userId),
      voteType: action,
    });
    if (action === 'upvote') article.upvotes += 1;
    else article.downvotes += 1;
  } else if (existingVote.voteType === action) {
    // 2. Same button clicked again: remove the vote
    article.voteInfo = article.voteInfo.filter(
      (vote) => vote.userId.toString() !== userId,
    );
    if (action === 'upvote') article.upvotes = Math.max(0, article.upvotes - 1);
    else article.downvotes = Math.max(0, article.downvotes - 1);
  } else {
    // 3. Switching from one vote to the other
    existingVote.voteType = action;
    if (action === 'upvote') {
      article.upvotes += 1;
      article.downvotes = Math.max(0, article.downvotes - 1);
    } else {
      article.downvotes += 1;
      article.upvotes = Math.max(0, article.upvotes - 1);
    }
  }

  return await article.save();
};

// Update an article
const updateArticleIntoDB = async (
  articleId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateData: any,
  userId: string,
  userRole: string,
) => {
  const article = await Article.findById(articleId);

  if (!article || article.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  // Only the author or an admin can edit
  checkCanModify(article.authorId, userId, userRole);

  // Zod already removed any unknown fields
  const changes: Record<string, unknown> = { ...updateData };

  // If content was sent, rebuild the preview fields
  if (updateData.content) {
    changes.excerpt = buildExcerpt(updateData.content);
    changes.readTime = calcReadTime(updateData.content);
  }

  // Premium / price rules, using the saved values when not sent
  const isPremiumAfterUpdate = updateData.isPremium ?? article.isPremium;
  const priceAfterUpdate = updateData.price ?? article.price ?? 0;

  if (isPremiumAfterUpdate && priceAfterUpdate <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Premium articles need a price greater than 0',
    );
  }

  // Free articles always have price 0
  if (!isPremiumAfterUpdate) {
    changes.price = 0;
  }

  const updatedArticle = await Article.findByIdAndUpdate(articleId, changes, {
    new: true,
    runValidators: true,
  });

  if (!updatedArticle) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  return updatedArticle;
};

// Update publish status of an article
const updatePublishArticleIntoDB = async (
  articleId: string,
  isPublish: boolean,
) => {
  const isArticleExists = await Article.findById(articleId);
  console.log(isPublish, 'check');
  if (!isArticleExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  const updateData: Partial<TArticle> = {
    isPublish: isPublish,
  };

  console.log('  Publish Status:', updateData);

  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedArticle) {
      throw new AppError(httpStatus.NOT_IMPLEMENTED, 'Publish Update Failed');
    }

    return updatedArticle;
  } catch (error) {
    console.error('Publish   Error:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Publish Update Failed',
    );
  }
};

// Delete an article
const deleteArticleFromDB = async (
  articleId: string,
  userId: string,
  userRole: string,
) => {
  const article = await Article.findById(articleId);
  if (!article) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  checkCanModify(article.authorId, userId, userRole);

  return await Article.deleteOne({ _id: articleId });
};

// Get authors sorted by most followers
const getAuthorsByMostFollowers = async () => {
  const result = await User.find().sort({ followers: -1 }).limit(10);

  return result;
};

// Get dashboard feed (articles + authors sorted by followers)
const getDashboardFeed = async () => {
  const articles = await Article.find().populate('authorId');
  const topAuthors = await getAuthorsByMostFollowers();

  return {
    articles,
    topAuthors,
  };
};

const getMyArticlesFromDB = async (userId: string) => {
  const articles = await Article.find({ authorId: userId }).populate({
    path: 'authorId',
    select: 'name profilePhoto followers',
  });
  console.log(articles);
  if (!articles || articles.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No articles found for this user');
  }

  return articles;
};

const getArticlesByFollowingFromDB = async (userId: string) => {
  const user = await User.findById(userId).select('following');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const followingIds = user.following;

  const articles = await Article.find({
    authorId: { $in: followingIds },
  }).populate('authorId', 'name profilePhoto followers');

  if (!articles.length) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No articles found from followed users',
    );
  }

  return articles;
};

const reactToArticleIntoDB = async (
  articleId: string,
  userId: string,
  reaction: REACTION_TYPE,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // console.log(
    //   `Starting reaction process for articleId: ${articleId}, userId: ${userId}, reaction: ${reaction}`,
    // );

    const existingReaction = await Reaction.findOne({
      articleId,
      userId,
    }).session(session);
    // console.log('Existing reaction:', existingReaction);

    let previousReaction: REACTION_TYPE | null = null;

    if (existingReaction) {
      previousReaction = existingReaction.reactionType;

      if (existingReaction.reactionType !== reaction) {
        // console.log('Updating reaction to:', reaction);
        existingReaction.reactionType = reaction;
        await existingReaction.save({ session });
      } else {
        // console.log('Removing reaction:', existingReaction.reactionType);
        await Reaction.deleteOne({ _id: existingReaction._id }).session(
          session,
        );
        previousReaction = existingReaction.reactionType;
        reaction = null as unknown as REACTION_TYPE;
      }
    } else {
      // console.log('Creating new reaction:', reaction);
      await Reaction.create([{ articleId, userId, reactionType: reaction }], {
        session,
      });
    }

    // Prepare the summary update object
    const summaryUpdate: Record<string, number> = {};
    if (reaction) summaryUpdate[`reactionSummary.${reaction}`] = 1;
    if (previousReaction)
      summaryUpdate[`reactionSummary.${previousReaction}`] = -1;
    console.log('Summary update:', summaryUpdate);

    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      { $inc: summaryUpdate },
      { new: true, session },
    );

    if (!updatedArticle) throw new Error('Article not found');

    await session.commitTransaction();
    session.endSession();

    return updatedArticle;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const ArticleServices = {
  createArticleIntoDB,
  getAllArticlesFromDB,
  getSingleArticleFromDB,
  updateArticleIntoDB,
  updatePublishArticleIntoDB,
  deleteArticleFromDB,
  getAuthorsByMostFollowers,
  getDashboardFeed,
  updateArticleVotesIntoDB,
  getMyArticlesFromDB,
  getArticlesByFollowingFromDB,
  reactToArticleIntoDB,
};
