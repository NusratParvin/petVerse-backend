import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { VetService } from './vets.service';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';

const createVet = catchAsync(async (req: Request, res: Response) => {
  const vet = await VetService.createVet(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Vet created successfully',
    data: vet,
  });
});

const getAllVets = catchAsync(async (req: Request, res: Response) => {
  const vets = await VetService.getAllVets(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vets retrieved successfully',
    data: vets,
  });
});

const getSingleVet = catchAsync(async (req: Request, res: Response) => {
  const vet = await VetService.getSingleVet(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vet retrieved successfully',
    data: vet,
  });
});

const updateVet = catchAsync(async (req: Request, res: Response) => {
  const vet = await VetService.updateVet(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vet updated successfully',
    data: vet,
  });
});

const deleteVet = catchAsync(async (req: Request, res: Response) => {
  await VetService.deleteVet(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vet deleted successfully',
    data: null,
  });
});

export const VetController = {
  createVet,
  getAllVets,
  getSingleVet,
  updateVet,
  deleteVet,
};
