import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReactionServices } from './reactions.service';

// Get all reactions
const getAllReactions = catchAsync(async (req, res) => {
  const result = await ReactionServices.getAllReactionsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Reactions retrieved successfully',
    data: result,
  });
});
export const ReactionControllers = {
  getAllReactions,
};
