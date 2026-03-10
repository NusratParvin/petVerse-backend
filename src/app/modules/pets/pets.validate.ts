import { z } from 'zod';

const createPetValidationSchema = z.object({
  name: z.string().nonempty({ message: 'Pet name is required' }),
  species: z.enum(['dog', 'cat', 'bird', 'fish', 'rabbit', 'reptile', 'other']),
  breed: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  dateOfBirth: z.string().optional(),
  weight: z.number().optional(),
  microchipNumber: z.string().optional(),
  profilePhoto: z.string().optional(),
  isNeutered: z.boolean().optional(),
  emirate: z
    .enum([
      'dubai',
      'abu-dhabi',
      'sharjah',
      'ajman',
      'ras-al-khaimah',
      'fujairah',
      'umm-al-quwain',
    ])
    .optional(),
  whatsappAlerts: z.boolean().optional(),
  whatsappNumber: z.string().optional(),
});

const updatePetValidationSchema = z.object({
  name: z.string().optional(),
  species: z
    .enum(['dog', 'cat', 'bird', 'fish', 'rabbit', 'reptile', 'other'])
    .optional(),
  breed: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  dateOfBirth: z.string().optional(),
  weight: z.number().optional(),
  microchipNumber: z.string().optional(),
  profilePhoto: z.string().optional(),
  isNeutered: z.boolean().optional(),
  emirate: z
    .enum([
      'dubai',
      'abu-dhabi',
      'sharjah',
      'ajman',
      'ras-al-khaimah',
      'fujairah',
      'umm-al-quwain',
    ])
    .optional(),
  whatsappAlerts: z.boolean().optional(),
  whatsappNumber: z.string().optional(),
});

const addHealthRecordValidationSchema = z.object({
  type: z.enum(['vaccine', 'vet-visit', 'medication', 'grooming', 'other']),
  title: z.string().nonempty({ message: 'Title is required' }),
  date: z.string().nonempty({ message: 'Date is required' }),
  nextDueDate: z.string().optional(),
  notes: z.string().optional(),
  cost: z.number().optional(),
  vetName: z.string().optional(),
});

export const PetValidation = {
  createPetValidationSchema,
  updatePetValidationSchema,
  addHealthRecordValidationSchema,
};
