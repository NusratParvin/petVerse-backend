import { TVet } from './vets.interface';
import { Vet } from './vets.model';

const createVet = async (payload: TVet) => {
  const vet = await Vet.create(payload);
  return vet;
};

const getAllVets = async (query: Record<string, unknown>) => {
  const { emirate, speciality, search } = query;

  const filter: Record<string, unknown> = { isDeleted: false };

  if (emirate) filter.emirate = emirate;
  if (speciality) filter.specialities = { $in: [speciality] };
  if (search) {
    filter.$or = [
      { clinicName: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { area: { $regex: search, $options: 'i' } },
    ];
  }

  const vets = await Vet.find(filter).sort({ rating: -1 });
  return vets;
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
