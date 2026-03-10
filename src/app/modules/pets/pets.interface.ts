import { Types } from 'mongoose';

export type TSpecies =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'fish'
  | 'rabbit'
  | 'reptile'
  | 'other';

export type TGender = 'male' | 'female' | 'unknown';

export type TEmirate =
  | 'dubai'
  | 'abu-dhabi'
  | 'sharjah'
  | 'ajman'
  | 'ras-al-khaimah'
  | 'fujairah'
  | 'umm-al-quwain';

export type THealthRecordType =
  | 'vaccine'
  | 'vet-visit'
  | 'medication'
  | 'grooming'
  | 'other';

export type THealthRecord = {
  type: THealthRecordType;
  title: string;
  date: Date;
  nextDueDate?: Date;
  notes?: string;
  cost?: number;
  vetName?: string;
};

export type TPet = {
  owner: Types.ObjectId;
  name: string;
  species: TSpecies;
  breed?: string;
  gender: TGender;
  dateOfBirth?: Date;
  weight?: number;
  microchipNumber?: string;
  profilePhoto?: string;
  isNeutered: boolean;
  emirate?: TEmirate;
  healthRecords: THealthRecord[];
  whatsappAlerts: boolean;
  whatsappNumber: string;
  isDeleted: boolean;
};
