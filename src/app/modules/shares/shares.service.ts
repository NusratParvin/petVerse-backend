import { Article } from '../articles/articles.model';
import { User } from '../user/user.model';
import Share from './shares.model';

// Function to create a share
export const createShareIntoDB = async (
  articleId: string,
  userId: string,
  shareContext: string,
) => {
  // Create the new share document
  const newShare = await Share.create({
    articleId,
    userId,
    sharedAt: new Date(), // Ensure the shared date is recorded
    shareContext,
  });

  // Increment share count in the article document
  await Article.findByIdAndUpdate(articleId, { $inc: { shareCount: 1 } });

  // Add the new share's ID to the user's shareIds array
  await User.findByIdAndUpdate(userId, { $push: { shareIds: newShare._id } });

  return newShare;
};

export const ShareServices = {
  createShareIntoDB,
};
