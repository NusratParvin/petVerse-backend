import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PetServices } from './pets.service';

const createPet = catchAsync(async (req, res) => {
  const userId = req.user.id;
  //   const userId = '678299d038fe32f2152a5e42';
  const result = await PetServices.createPetIntoDB(req.body, userId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Pet created successfully',
    data: result,
  });
});

const getMyPets = catchAsync(async (req, res) => {
  const userId = req.user.id;
  //   const userId = '678299d038fe32f2152a5e42';

  const result = await PetServices.getMyPetsFromDB(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pets fetched successfully',
    data: result,
  });
});

const getSinglePet = catchAsync(async (req, res) => {
  const result = await PetServices.getSinglePetFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pet fetched successfully',
    data: result,
  });
});

const updatePet = catchAsync(async (req, res) => {
  const userId = req.user.id;
  //   const userId = '678299d038fe32f2152a5e42';

  const result = await PetServices.updatePetIntoDB(
    req.params.id,
    userId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pet updated successfully',
    data: result,
  });
});

const deletePet = catchAsync(async (req, res) => {
  const result = await PetServices.deletePetFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pet deleted successfully',
    data: result,
  });
});

const addHealthRecord = catchAsync(async (req, res) => {
  const userId = req.user.id;
  //   const userId = '678299d038fe32f2152a5e42';

  const result = await PetServices.addHealthRecordIntoDB(
    userId,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Health record added successfully',
    data: result,
  });
});

const getUpcomingReminders = catchAsync(async (req, res) => {
  const userId = req.user.id;
  //   const userId = '678299d038fe32f2152a5e42';

  const result = await PetServices.getUpcomingRemindersFromDB(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Upcoming reminders fetched successfully',
    data: result,
  });
});

const findByMicrochip = catchAsync(async (req, res) => {
  const result = await PetServices.findByMicrochipFromDB(req.params.chipNumber);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pet found',
    data: result,
  });
});

const deleteHealthRecord = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await PetServices.deleteHealthRecordFromDB(
    req.params.id,
    userId,
    req.params.recordId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Health record deleted',
    data: result,
  });
});

const updateHealthRecord = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id, recordId } = req.params;
  const updateData = req.body;

  const result = await PetServices.updateHealthRecordIntoDB(
    id,
    userId,
    recordId,
    updateData,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Health record updated',
    data: result,
  });
});

export const PetControllers = {
  createPet,
  getMyPets,
  getSinglePet,
  updatePet,
  deletePet,
  addHealthRecord,
  getUpcomingReminders,
  findByMicrochip,
  updateHealthRecord,
  deleteHealthRecord,
};
