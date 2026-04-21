import { Types } from 'mongoose';

export type TSpeciality =
  | 'dogs'
  | 'cats'
  | 'birds'
  | 'fish'
  | 'rabbits'
  | 'reptiles'
  | 'exotic'
  | 'small-animals'
  | 'emergency'
  | 'surgery'
  | 'dental'
  | 'dermatology'
  | 'ophthalmology'
  | 'nutrition';

export type TEmirate =
  | 'dubai'
  | 'abu-dhabi'
  | 'sharjah'
  | 'ajman'
  | 'ras-al-khaimah'
  | 'fujairah'
  | 'umm-al-quwain';

export type TWorkingHours = {
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

export type TServiceRate = {
  service: string;
  priceFrom: number;
  priceTo: number;
};

export type TVet = {
  _id: Types.ObjectId;
  name: string;
  clinicName: string;
  emirate: TEmirate;
  area: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  coverPhoto?: string;
  photos?: string[];
  specialities: TSpeciality[];
  workingHours: TWorkingHours[];
  serviceRates: TServiceRate[];
  rating: number;
  reviewCount: number;
  about?: string;
  googleMapsUrl?: string;
  isClaimed: boolean;
  isDeleted: boolean;
};
