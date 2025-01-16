import { Request, Response } from 'express';
import { ShareServices } from './shares.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';

const shareArticle = catchAsync(async (req: Request, res: Response) => {
  const { articleId } = req.body;
  const userId = req.user.id;
  const shareContext = '';
  const share = await ShareServices.createShareIntoDB(
    articleId,
    userId,
    shareContext,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Article shared successfully',
    data: share,
  });
});

export const ShareControllers = {
  shareArticle,
};
