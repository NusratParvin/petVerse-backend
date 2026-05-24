import { Types } from 'mongoose';

export type TInsuranceReview = {
  provider: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  text: string;
  planUsed?: string;
};
