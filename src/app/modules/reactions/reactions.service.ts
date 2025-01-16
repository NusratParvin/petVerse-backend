import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Reaction } from './reactions.model';

const getAllReactionsFromDB = async () => {
  const reactions = await Reaction.find();
  console.log(reactions);

  if (!reactions || reactions.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No reactions found  ');
  }
  return reactions;
};

export const ReactionServices = {
  getAllReactionsFromDB,
};
