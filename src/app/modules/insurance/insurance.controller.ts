import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { InsuranceService } from './insurance.service';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';

const getAllProviders = catchAsync(async (req: Request, res: Response) => {
  const data = await InsuranceService.getAllProviders();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Providers fetched',
    data,
  });
});

const getProviderById = catchAsync(async (req: Request, res: Response) => {
  const data = await InsuranceService.getProviderById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Provider fetched',
    data,
  });
});

const createProvider = catchAsync(async (req: Request, res: Response) => {
  const data = await InsuranceService.createProvider(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Provider created',
    data,
  });
});

const updateProvider = catchAsync(async (req: Request, res: Response) => {
  const data = await InsuranceService.updateProvider(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Provider updated',
    data,
  });
});

const deleteProvider = catchAsync(async (req: Request, res: Response) => {
  await InsuranceService.deleteProvider(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Provider deleted',
    data: null,
  });
});

const getAIRecommendation = catchAsync(async (req: Request, res: Response) => {
  const data = await InsuranceService.getAIRecommendation(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Recommendation generated',
    data,
  });
});

export const InsuranceController = {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  getAIRecommendation,
};
