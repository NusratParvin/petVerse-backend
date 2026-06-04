import { LostFound } from './lostFound.model';
import { TLostFound, TUAEEmirate, TPostType } from './lostFound.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

type TFilters = {
  type?: TPostType;
  emirate?: TUAEEmirate;
  species?: string;
  status?: string;
  search?: string;
};

const getAllPosts = async (filters: TFilters) => {
  // console.log(filters);
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
  const post = await LostFound.findById(id);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  if (post.postedBy.toString() !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Not authorized');

  return await LostFound.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const markResolved = async (id: string, userId: string) => {
  const post = await LostFound.findById(id);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  if (post.postedBy.toString() !== userId)
    throw new AppError(httpStatus.FORBIDDEN, 'Not authorized');

  return await LostFound.findByIdAndUpdate(
    id,
    { status: 'resolved' },
    { new: true },
  );
};

const deletePost = async (id: string, userId: string, role: string) => {
  const post = await LostFound.findById(id);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  if (post.postedBy.toString() !== userId && role !== 'admin')
    throw new AppError(httpStatus.FORBIDDEN, 'Not authorized');

  return await LostFound.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
};

export const LostFoundService = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  markResolved,
  deletePost,
};
