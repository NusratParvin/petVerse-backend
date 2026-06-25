import { LostFound } from './lostFound.model';
import { TLostFound, TUAEEmirate, TPostType } from './lostFound.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { extract } from '../../utils/extract';
import {
  lostFoundFilterableFields,
  lostFoundPaginationFields,
} from './lostFound.constants';
import pagination from '../../utils/pagination';

type TFilters = {
  type?: TPostType;
  emirate?: TUAEEmirate;
  species?: string;
  status?: string;
  search?: string;
};

const getAllPosts = async (filters: TFilters) => {
  console.log(filters);
  const query: Record<string, unknown> = {};

  if (filters.type) query.type = filters.type;
  if (filters.emirate) query.emirate = filters.emirate;
  if (filters.species) query.species = filters.species;
  if (filters.status) query.status = filters.status;
  else query.status = 'active';

  if (filters.search) {
    query.$or = [
      { petName: { $regex: filters.search, $options: 'i' } },
      { breed: { $regex: filters.search, $options: 'i' } },
      { area: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { microchipNumber: { $regex: filters.search, $options: 'i' } },
    ];
  }

  // console.log(query);

  const res = await LostFound.find(query)
    .populate('postedBy', 'name email profilePhoto')
    .sort({ createdAt: -1 });
  // console.log(res, 'res');

  return res;
};

const getPostById = async (id: string) => {
  const post = await LostFound.findById(id).populate(
    'postedBy',
    'name email profilePhoto',
  );
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  return post;
};

const createPost = async (
  userId: string,
  posterName: string,
  posterEmail: string,
  payload: Partial<TLostFound>,
) => {
  const res = await LostFound.create({
    ...payload,
    postedBy: userId,
    posterName,
    posterEmail,
  });
  // console.log(res, 'res');
  return res;
};

const updatePost = async (
  id: string,
  userId: string,
  payload: Partial<TLostFound>,
) => {
  console.log(payload);
  const post = await LostFound.findById(id);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  if (post.postedBy.toString() !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Not authorized');

  const res = await LostFound.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  console.log(res);
  return res;
};

const markResolved = async (id: string, userId: string) => {
  const post = await LostFound.findById(id);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  if (post.postedBy.toString() !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Not authorized');

  const res = await LostFound.findByIdAndUpdate(
    id,
    { status: 'resolved' },
    { new: true },
  );

  return res;
};

const deletePost = async (id: string, userId: string, role: string) => {
  const post = await LostFound.findById(id);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  if (post.postedBy.toString() !== userId && role !== 'admin')
    throw new AppError(httpStatus.FORBIDDEN, 'Not authorized');

  const res = await LostFound.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return res;
};

//   admin: get all posts with filters + search
const getAllPostsForAdminFromDB = async (query: Record<string, unknown>) => {
  // console.log(query, 'service');

  const filters = extract(query, lostFoundFilterableFields);
  const paginationOptions = extract(query, lostFoundPaginationFields);

  const { page, limit, skip, sortBy, sortOrder } =
    pagination(paginationOptions);

  const filter: Record<string, unknown> = { isDeleted: false };

  if (filters.type) filter.type = filters.type;
  if (filters.status) filter.status = filters.status;
  if (filters.emirate) filter.emirate = filters.emirate;
  if (filters.species) filter.species = filters.species;

  if (filters.search) {
    filter.$or = [
      { petName: { $regex: filters.search, $options: 'i' } },
      { breed: { $regex: filters.search, $options: 'i' } },
      { area: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { posterName: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const posts = await LostFound.find(filter)
    .populate('postedBy', 'name email profilePhoto')
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  const total = await LostFound.countDocuments();

  const result = {
    data: posts,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    },
  };

  // console.log(total, 'filter');

  return result;
};

//   admin: stats for summary cards
const getLostFoundStatsFromDB = async () => {
  const [total, active, resolved, lost, found] = await Promise.all([
    LostFound.countDocuments({ isDeleted: false }),
    LostFound.countDocuments({ isDeleted: false, status: 'active' }),
    LostFound.countDocuments({ isDeleted: false, status: 'resolved' }),
    LostFound.countDocuments({ isDeleted: false, type: 'lost' }),
    LostFound.countDocuments({ isDeleted: false, type: 'found' }),
  ]);

  // species breakdown
  const speciesBreakdown = await LostFound.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$species', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // emirate breakdown
  const emirateBreakdown = await LostFound.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$emirate', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

  return {
    total,
    active,
    resolved,
    lost,
    found,
    resolutionRate,
    speciesBreakdown,
    emirateBreakdown,
  };
};

//   admin: force delete
const adminDeletePostFromDB = async (postId: string) => {
  const post = await LostFound.findByIdAndUpdate(
    postId,
    { isDeleted: true },
    { new: true },
  );
  if (!post) throw new Error('Post not found');
  return post;
};

//   admin: force resolve
const adminMarkResolvedInDB = async (postId: string) => {
  const post = await LostFound.findByIdAndUpdate(
    postId,
    { status: 'resolved' },
    { new: true },
  );
  if (!post) throw new Error('Post not found');
  return post;
};

export const LostFoundService = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  markResolved,
  deletePost,

  getAllPostsForAdminFromDB,
  getLostFoundStatsFromDB,
  adminDeletePostFromDB,
  adminMarkResolvedInDB,
};
