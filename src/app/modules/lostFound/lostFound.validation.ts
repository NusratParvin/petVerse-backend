import { z } from 'zod';
import { POST_TYPES, PET_SPECIES, UAE_EMIRATES } from './lostFound.constants';

export const createLostFoundValidation = z.object({
  type: z.enum(POST_TYPES),
  petName: z.string().optional(),
  species: z.enum(PET_SPECIES),
  breed: z.string().optional(),
  color: z.string(),
  description: z.string().min(10),
  emirate: z.enum(UAE_EMIRATES),
  area: z.string(),
  dateLostFound: z.string(),
  photos: z.array(z.string()).optional(),
  microchipNumber: z.string().optional(),
  reward: z.number().optional(),
  posterPhone: z.string(),
});

export const updateLostFoundValidation = createLostFoundValidation
  .partial()
  .extend({ status: z.enum(['active', 'resolved']).optional() });
