import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import httpStatus from 'http-status';
import { PageServices } from './page.service';

// Create a page

const createPage = catchAsync(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  const page = await PageServices.createPageIntoDB(name, description, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Page created successfully',
    data: page,
  });
});

// Invite a user to the page
const inviteToPage = catchAsync(async (req: Request, res: Response) => {
  const { pageId } = req.params;
  const { userId } = req.body;

  const result = await PageServices.inviteToPageIntoDB(pageId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User invited to page',
    data: result,
  });
});

// Accept page invitation
const acceptInvitation = catchAsync(async (req: Request, res: Response) => {
  const { pageId } = req.params;
  const userId = req.user.id;

  const result = await PageServices.acceptInvitationIntoDB(pageId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Page invitation accepted',
    data: result,
  });
});

// Reject page invitation
const rejectInvitation = catchAsync(async (req: Request, res: Response) => {
  const { pageId } = req.params;
  const userId = req.user.id;

  const result = await PageServices.rejectInvitationIntoDB(pageId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Page invitation rejected',
    data: result,
  });
});

// View page details
const getPageDetails = catchAsync(async (req: Request, res: Response) => {
  const { pageId } = req.params;

  const page = await PageServices.getPageDetailsFromDB(pageId);
  // console.log(page);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Page details retrieved',
    data: page,
  });
});

// View my  page details
const getMyPages = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;

  const page = await PageServices.getMyPagesFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Page details retrieved',
    data: page,
  });
});

export const PageControllers = {
  createPage,
  inviteToPage,
  acceptInvitation,
  rejectInvitation,
  getPageDetails,
  getMyPages,
};
