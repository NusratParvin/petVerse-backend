/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { THealthRecord, TPet } from './pets.interface';
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
  const pet = await Pet.findOne({ _id: petId, isDeleted: false });
  if (!pet) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pet not found!');
  }
  return pet;
};

const updatePetIntoDB = async (
  petId: string,
  userId: string,
  updateData: Partial<TPet>,
) => {
  const pet = await Pet.findOneAndUpdate(
    { _id: petId, owner: userId, isDeleted: false },
    updateData,
    { new: true, runValidators: true },
  );
  if (!pet) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pet not found!');
  }
  return pet;
};

const deletePetFromDB = async (petId: string) => {
  const pet = await Pet.findOneAndUpdate(
    { _id: petId, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );
  if (!pet) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pet not found');
  }

  return pet;
};

const findByMicrochipFromDB = async (chipNumber: string) => {
  const pet = await Pet.findOne({
    microchipNumber: chipNumber,
    isDeleted: false,
  }).populate('owner', 'name email phone');

  if (!pet) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No pet found with this microchip',
    );
  }
  return pet;
};

const addHealthRecordIntoDB = async (
  userId: string,
  petId: string,
  payload: THealthRecord,
) => {
  const pet = await Pet.findOneAndUpdate(
    { owner: userId, _id: petId, isDeleted: false },
    {
      $push: { healthRecords: payload },
    },
    { new: true },
  );

  if (!pet) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pet not found');
  }
  return pet;
};

const getAllUpcomingRemindersFromDB = async () => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const pets = await Pet.find({
    isDeleted: false,
    whatsappAlerts: true,
    healthRecords: {
      $elemMatch: {
        nextDueDate: { $gte: today, $lte: nextWeek },
      },
    },
  }).populate('owner', 'email name');

  const reminders: any[] = [];

  pets.forEach((pet) => {
    const owner = pet.owner as any;
    pet.healthRecords.forEach((record) => {
      if (
        record.nextDueDate &&
        record.nextDueDate >= today &&
        record.nextDueDate <= nextWeek
      ) {
        const daysLeft = Math.ceil(
          (record.nextDueDate.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        reminders.push({
          petName: pet.name,
          recordTitle: record.title,
          nextDueDate: record.nextDueDate,
          daysLeft,
          vetName: record.vetName,
          whatsappNumber: pet.whatsappNumber,
          ownerEmail: owner.email,
          ownerName: owner.name,
        });
      }
    });
  });

  return reminders;
};

const getUpcomingRemindersFromDB = async (userId: string) => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const pets = await Pet.find({
    owner: userId,
    isDeleted: false,
    healthRecords: {
      $elemMatch: {
        nextDueDate: { $gte: today, $lte: nextWeek },
      },
    },
  });

  const reminders: any[] = [];

  pets.forEach((pet) => {
    pet.healthRecords.forEach((record) => {
      if (
        record.nextDueDate &&
        record.nextDueDate >= today &&
        record.nextDueDate <= nextWeek
      ) {
        const daysLeft = Math.ceil(
          (record.nextDueDate.getTime() - today.getTime()) /
            (24 * 60 * 60 * 1000),
        );

        reminders.push({
          petName: pet.name,
          petPhoto: pet.profilePhoto,
          recordTitle: record.title,
          type: record.type,
          nextDueDate: record.nextDueDate,
          daysLeft,
        });
      }
    });
  });

  return reminders;
};

const deleteHealthRecordFromDB = async (
  petId: string,
  userId: string,
  recordId: string,
) => {
  const pet = await Pet.findOneAndUpdate(
    { _id: petId, owner: userId, isDeleted: false },
    { $pull: { healthRecords: { _id: recordId } } },
    { new: true },
  );
  if (!pet) throw new AppError(httpStatus.NOT_FOUND, 'Pet not found');
  return pet;
};

const updateHealthRecordIntoDB = async (
  petId: string,
  userId: string,
  recordId: string,
  updateData: Partial<THealthRecord>,
) => {
  // console.log(petId, userId, recordId, updateData);
  const pet = await Pet.findOneAndUpdate(
    {
      _id: petId,
      owner: userId,
      isDeleted: false,
      'healthRecords._id': recordId,
    },
    { $set: { 'healthRecords.$': { ...updateData, _id: recordId } } },
    { new: true },
  );
  if (!pet) throw new AppError(httpStatus.NOT_FOUND, 'Pet or record not found');
  return pet;
};

export const PetServices = {
  createPetIntoDB,
  findByMicrochipFromDB,
  getMyPetsFromDB,
  getSinglePetFromDB,
  updatePetIntoDB,
  deletePetFromDB,
  addHealthRecordIntoDB,
  getAllUpcomingRemindersFromDB,
  getUpcomingRemindersFromDB,
  updateHealthRecordIntoDB,
  deleteHealthRecordFromDB,
};
