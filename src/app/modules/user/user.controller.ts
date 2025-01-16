import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const getUser = catchAsync(async (req, res) => {
  const { id } = req.user;
  // console.log(id);
  const result = await UserServices.getUserFromDB(id);
  // console.log(result, 'me');
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

const getFriend = catchAsync(async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  const result = await UserServices.getFriendFromDB(id);
  // console.log(result, 'friend');
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Friend profile retrieved successfully',
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req, res) => {
  const { id } = req.user;

  const updatedData = req.body;
  // console.log('check', updatedData, 'check');

  const result = await UserServices.updateUserIntoDB(id, updatedData);
  // console.log(result);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  }
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await UserServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedUser = await UserServices.deleteUserFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: 'User deleted successfully',
    data: deletedUser,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const updatedUser = await UserServices.updateUserRoleInDB(id, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User role updated to ${role} successfully`,
    data: updatedUser,
  });
});

const followUser = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const followUserId = req.params.id;
  // console.log(followUserId);

  const result = await UserServices.followUserIntoDB(userId, followUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});

const getMostFollowedAuthors = catchAsync(async (req, res) => {
  const authors = await UserServices.getMostFollowedAuthorsFromDB();
  // console.log(authors);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Most followed authors fetched successfully',
    data: authors,
  });
});

export const UserControllers = {
  getUser,
  getFriend,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
  followUser,
  getMostFollowedAuthors,
};
