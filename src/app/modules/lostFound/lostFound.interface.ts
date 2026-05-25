import { Types } from 'mongoose';
import {
  POST_TYPES,
  PET_SPECIES,
  UAE_EMIRATES,
  POST_STATUSES,
} from './lostFound.constants';

export type TPostType = (typeof POST_TYPES)[number];
export type TPetSpecies = (typeof PET_SPECIES)[number];
export type TUAEEmirate = (typeof UAE_EMIRATES)[number];
export type TPostStatus = (typeof POST_STATUSES)[number];

export type TLostFound = {
  postedBy: Types.ObjectId;
  posterName: string;
  posterPhone: string;
  type: TPostType; // 'lost' | 'found'
  status: TPostStatus; // 'active' | 'resolved'
  petName?: string; // optional for 'found' posts
  species: TPetSpecies;
  breed?: string;
  color: string;
  description: string;
  emirate: TUAEEmirate;
  area: string;
  dateLostFound: Date;
  photos: string[];
  microchipNumber?: string;
  reward?: number;
  isDeleted: boolean;
};
