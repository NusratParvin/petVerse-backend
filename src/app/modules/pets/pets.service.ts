import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TPet } from './pets.interface';
import { Pet } from './pets.model';

const createPetIntoDB = async (payload: Partial<TPet>, userId: string) => {
  const pet = await Pet.create({ ...payload, owner: userId });

  if (!pet) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Pet creation failed');
  }

  return pet;
};

const getMyPetsFromDB = async (userId: string) => {
  const pets = await Pet.find({ owner: userId, isDeleted: false });
  return pets;
};

const getSinglePetFromDB = async (petId: string) => {
  const pet = await Pet.findById({ _id: petId, isDeleted: false });
  if (!pet) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Pet not found!');
  }
  return pet;
};

const updatePetIntoDB = async (
  petId: string,
  userId: string,
  updateData: Partial<TPet>,
) => {
  const pet = await Pet.findByIdAndUpdate(
    { _id: petId, isDeleted: false },
    updateData,
    { new: true, runValidators: true },
  );
  if (!pet) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Pet not found!');
  }
  return pet;
};

const deletePetFromDB = async (petId: string) => {
  const pet = await Pet.findByIdAndDelete(
    { _id: petId, isDeleted: true },
    { new: true },
  );
  if (!pet) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pet not found');
  }
  return pet;
};

export const PetServices = {
  createPetIntoDB,

  getMyPetsFromDB,
  getSinglePetFromDB,
  updatePetIntoDB,
  deletePetFromDB,
};
