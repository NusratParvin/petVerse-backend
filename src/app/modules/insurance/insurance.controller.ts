import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { InsuranceService } from './insurance.service';

const getInsuranceRecommendation = catchAsync(
  async (req: Request, res: Response) => {
    const { petName, species, breed, ageYears, existingConditions, budget } =
      req.body;

    // Validation
    if (!petName || !species || !ageYears || !budget) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'Missing required fields: petName, species, ageYears, budget',
        data: null,
      });
    }

    if (!['low', 'medium', 'high'].includes(budget)) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Budget must be 'low', 'medium', or 'high'",
        data: null,
      });
    }

    const result = await InsuranceService.getRecommendation({
      petName,
      species,
      breed,
      ageYears: Number(ageYears),
      existingConditions,
      budget,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Insurance recommendation generated successfully',
      data: result,
    });
  },
);

export const InsuranceController = {
  getInsuranceRecommendation,
};
