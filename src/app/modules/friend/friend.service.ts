import { Types } from 'mongoose';
import { User } from '../user/user.model';
import { TFriendStatus } from './friend.interface';
import { Friend } from './friend.model';

// Create a friend request
const createFriendRequest = async (
  requesterId: string,
  recipientId: string,
) => {
  const existingRequest = await Friend.findOne({
    requesterId,
    recipientId,
    status: 'pending',
  });

  if (existingRequest) {
    throw new Error('Friend request already exists or is pending.');
  }

  const friendRequest = await Friend.create({ requesterId, recipientId });

  console.log(friendRequest);

  return friendRequest;
};
// Update the status of a friend request (accept/reject/cancel)
const updateFriendRequestStatus = async (
  friendRequestId: string,
  status: TFriendStatus,
) => {
  const friendRequest = await Friend.findById(friendRequestId);

  if (!friendRequest) {
    throw new Error('Friend request not found.');
  }

  friendRequest.status = status;
  if (status === 'accepted') {
    friendRequest.acceptedAt = new Date();
  } else if (status === 'rejected' || status === 'cancelled') {
    // console.log(status);
    friendRequest.cancelledAt = new Date();
  }

  await friendRequest.save();
  return friendRequest;
};

const getFriendData = async (userId: string) => {
  const userObjectId = new Types.ObjectId(userId);

  const friendData = await Friend.aggregate([
    {
      $match: {
        $or: [{ requesterId: userObjectId }, { recipientId: userObjectId }],
      },
    },
    {
      $lookup: {
        from: User.collection.name,
        localField: 'requesterId',
        foreignField: '_id',
        as: 'requester',
      },
    },
    {
      $lookup: {
        from: User.collection.name,
        localField: 'recipientId',
        foreignField: '_id',
        as: 'recipient',
      },
    },
    {
      $addFields: {
        friend: {
          $cond: [
            { $eq: ['$requesterId', userObjectId] },
            { $arrayElemAt: ['$recipient', 0] },
            { $arrayElemAt: ['$requester', 0] },
          ],
        },
        isSentRequest: { $eq: ['$requesterId', userObjectId] }, // Add a flag to identify sent requests
      },
    },
    {
      $project: {
        _id: 1,
        status: 1,
        requestedAt: 1,
        acceptedAt: 1,
        isSentRequest: 1, // Include the flag in the output
        friend: {
          _id: 1,
          name: 1,
          profilePhoto: 1,
        },
      },
    },
  ]);

  // console.log(friendData, 'friendData');

  // Separate pending requests into sent and received based on `isSentRequest`
  const pendingRequestsReceived = friendData.filter(
    (f) => f.status === 'pending' && !f.isSentRequest,
  );

  const pendingRequestsSent = friendData.filter(
    (f) => f.status === 'pending' && f.isSentRequest,
  );

  const friends = friendData.filter((f) => f.status === 'accepted');

  // console.log(pendingRequestsReceived, 'Received Pending Requests');
  // console.log(pendingRequestsSent, 'Sent Pending Requests');
  // console.log(friends, 'Friends');

  return {
    pendingRequestsReceived,
    pendingRequestsSent,
    friends,
  };
};

export const FriendServices = {
  createFriendRequest,
  updateFriendRequestStatus,
  getFriendData,
};
