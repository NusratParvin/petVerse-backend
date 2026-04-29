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

  const filter: Record<string, unknown> = { isDeleted: false };

  if (filters.emirate) filter.emirate = filters.emirate;
  if (filters.speciality) filter.specialities = { $in: [filters.speciality] };
  if (filters.search) {
    filter.$or = [
      { clinicName: { $regex: filters.search, $options: 'i' } },
      { name: { $regex: filters.search, $options: 'i' } },
      { area: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const vets = await Vet.find(filter)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Vet.countDocuments(filter);

  return {
    data: vets,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
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

export const VetService = {
  createVet,
  getAllVets,
  getSingleVet,
  updateVet,
  deleteVet,
};
