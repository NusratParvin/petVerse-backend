import { extract } from '../../utils/extract';
import pagination from '../../utils/pagination';
import { vetFilterableFields, vetPaginationFields } from './vets.constant';
import { TVet } from './vets.interface';
import { Vet } from './vets.model';

const createVet = async (payload: TVet) => {
  const vet = await Vet.create(payload);
  return vet;
};

const getAllVets = async (query: Record<string, unknown>) => {
  const filters = extract(query, vetFilterableFields);
  const paginationOptions = extract(query, vetPaginationFields);

  const { page, limit, skip, sortBy, sortOrder } =
    pagination(paginationOptions);

  // console.log(filters);
  const filter: Record<string, unknown> = { isDeleted: false };

  if (filters.emirate) filter.emirate = filters.emirate;
  if (filters.rating && filters.rating !== 'all') {
    filter.rating = { $gte: Number(filters.rating) };
  }
  if (filters.emergency) filter.emergency = filters.emergency;
  if (filters.speciality) filter.specialities = { $in: [filters.speciality] };
  if (filters.search) {
    filter.$or = [
      { clinicName: { $regex: filters.search, $options: 'i' } },
      { name: { $regex: filters.search, $options: 'i' } },
      { area: { $regex: filters.search, $options: 'i' } },
    ];
  }

  console.log(filter);
  const vets = await Vet.find(filter)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  console.log(vets.length);
  const total = await Vet.countDocuments(filter);
  const result = {
    data: vets,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    },
  };

  // console.log(total, 'filter');

  return result;
};

const getSingleVet = async (id: string) => {
  const vet = await Vet.findOne({ _id: id, isDeleted: false });
  return vet;
};

const updateVet = async (id: string, payload: Partial<TVet>) => {
  const vet = await Vet.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true },
  );
  return vet;
};

const deleteVet = async (id: string) => {
  const vet = await Vet.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true },
  );
  return vet;
};

const getVetStats = async () => {
  // Single aggregation — runs once, efficient
  const emirateStats = await Vet.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$emirate',
        count: { $sum: 1 },
        emergencyCount: { $sum: { $cond: ['$emergency', 1, 0] } },
        averageRating: { $avg: '$rating' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const specialityStats = await Vet.aggregate([
    { $match: { isDeleted: false } },
    { $unwind: '$specialities' },
    {
      $group: {
        _id: '$specialities',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const totals = await Vet.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalClinics: { $sum: 1 },
        emergencyCount: { $sum: { $cond: ['$emergency', 1, 0] } },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  const summary = totals[0] || {
    totalClinics: 0,
    emergencyCount: 0,
    averageRating: 0,
  };

  return {
    totalClinics: summary.totalClinics,
    emergencyCount: summary.emergencyCount,
    averageRating: Number(summary.averageRating.toFixed(1)),
    byEmirate: emirateStats.map((e) => ({
      emirate: e._id,
      count: e.count,
      emergencyCount: e.emergencyCount,
      averageRating: Number(e.averageRating.toFixed(1)),
    })),
    bySpeciality: specialityStats.map((s) => ({
      speciality: s._id,
      count: s.count,
    })),
  };
};

export const VetService = {
  createVet,
  getAllVets,
  getSingleVet,
  updateVet,
  deleteVet,
  getVetStats,
};
