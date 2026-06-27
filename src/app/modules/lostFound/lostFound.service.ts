/* eslint-disable @typescript-eslint/no-explicit-any */
import { LostFound } from './lostFound.model';
import { TLostFound, TUAEEmirate, TPostType } from './lostFound.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { extract } from '../../utils/extract';
import {
  emailTemplate,
  lostFoundFilterableFields,
  lostFoundPaginationFields,
} from './lostFound.constants';
import pagination from '../../utils/pagination';
import { sendWhatsAppText } from '../../utils/sendWhatsAppText';
import { sendEmail } from '../../utils/sendEmail';

type TFilters = {
  type?: TPostType;
  emirate?: TUAEEmirate;
  species?: string;
  status?: string;
  search?: string;
};

const formatPhone = (phone: string): string => {
  // remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // already has country code (UAE numbers are 12 digits with 971)
  if (digits.startsWith('971')) return `+${digits}`;

  // local UAE number starting with 0 → replace with +971
  if (digits.startsWith('0')) return `+971${digits.slice(1)}`;

  // no country code, assume UAE
  return `+971${digits}`;
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
    //dashboard
    byEmirate: emirateBreakdown.map((e) => ({
      emirate: e._id,
      count: e.count,
    })),
    bySpecies: speciesBreakdown.map((s) => ({
      species: s._id,
      count: s.count,
    })),
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

//   get single post with full owner details (admin)
const getPostForAdminFromDB = async (postId: string) => {
  const post = await LostFound.findById(postId)
    .populate('postedBy', 'name email profilePhoto')
    .lean();

  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  return post;
};

//   contact owner via email
const contactOwnerByEmailFromDB = async (
  postId: string,
  subject: string,
  message: string,
) => {
  // console.log(postId, subject, message);
  const post = await LostFound.findById(postId)
    .select('posterName posterEmail petName species')
    .lean();

  // console.log(post);

  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');

  const owner = post.postedBy as any;
  const petName = post.petName || `${post.species} (unnamed)`;

  const html = emailTemplate({
    petName,
    ownerName: owner.name || 'Pet Owner',
    message,
  });

  await sendEmail(owner.email, subject, html);

  // console.log(email, 'email here');

  await LostFound.findByIdAndUpdate(postId, {
    $push: {
      contactLog: {
        method: 'email',
        timestamp: new Date(),
        note: subject,
      },
    },
  });
  // console.log(res);
  return { success: true, sentTo: owner.email };
};

//   contact owner via whatsapp
const contactOwnerByWhatsAppFromDB = async (
  postId: string,
  message: string,
) => {
  const post = await LostFound.findById(postId)
    .select('posterPhone petName species')
    .lean();

  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');

  const phone = post.posterPhone;
  if (!phone)
    throw new AppError(httpStatus.BAD_REQUEST, 'No phone number on this post');

  const petName = post.petName || `${post.species} (unnamed)`;

  const whatsappMessage = `🐾 *PetVerse Lost & Found*\n\nHi! This is the PetVerse admin team regarding your post for *${petName}*.\n\n${message}\n\n_PetVerse UAE_`;
  // console.log(phone);
  await sendWhatsAppText(formatPhone(phone), whatsappMessage);

  // log contact attempt
  await LostFound.findByIdAndUpdate(postId, {
    $push: {
      contactLog: {
        method: 'whatsapp',
        timestamp: new Date(),
        note: message.substring(0, 100),
      },
    },
  });

  return { success: true, sentTo: phone };
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

  getPostForAdminFromDB,
  contactOwnerByEmailFromDB,
  contactOwnerByWhatsAppFromDB,
};
