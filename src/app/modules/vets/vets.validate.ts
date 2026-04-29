import { z } from 'zod';

const specialities = [
  'dogs',
  'cats',
  'birds',
  'fish',
  'rabbits',
  'reptiles',
  'exotic',
  'small-animals',
  'emergency',
  'surgery',
  'dental',
  'dermatology',
  'ophthalmology',
  'nutrition',
] as const;

const emirates = [
  'dubai',
  'abu-dhabi',
  'sharjah',
  'ajman',
  'ras-al-khaimah',
  'fujairah',
  'umm-al-quwain',
] as const;

const workingHoursSchema = z.object({
  day: z.string(),
  open: z.string().optional(),
  close: z.string().optional(),
  closed: z.boolean().optional(),
});

// const serviceRateSchema = z.object({
//   service: z.string(),
//   priceFrom: z.number().min(0),
//   priceTo: z.number().min(0),
// });

const priceRangeSchema = z
  .object({
    basePrice: z.number().min(0, 'Minimum price must be 0 or greater'),
    maxPrice: z.number().min(0, 'Maximum price must be 0 or greater'),
  })
  .refine((data) => data.basePrice >= data.maxPrice, {
    message: 'Maximum price must be greater than or equal to minimum price',
    // path: ['consultationTo'],
  });

const createVetSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    clinicName: z.string().min(1, 'Clinic name is required'),
    emirate: z.enum(emirates),
    area: z.string().min(1, 'Area is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().min(1, 'Phone is required'),
    whatsapp: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    coverPhoto: z.string().optional(),
    photos: z.array(z.string()).optional(),
    specialities: z
      .array(z.enum(specialities))
      .min(1, 'At least one speciality required'),
    workingHours: z.array(workingHoursSchema).optional(),
    // serviceRates: z.array(serviceRateSchema).optional(),
    priceRange: priceRangeSchema,
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().min(0).optional(),
    about: z.string().optional(),
    googleMapsUrl: z.string().optional(),
    emergency: z.boolean().optional(),
  }),
});

const updateVetSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    clinicName: z.string().optional(),
    emirate: z.enum(emirates).optional(),
    area: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    coverPhoto: z.string().optional(),
    photos: z.array(z.string()).optional(),
    specialities: z.array(z.enum(specialities)).optional(),
    workingHours: z.array(workingHoursSchema).optional(),
    // serviceRates: z.array(serviceRateSchema).optional(),
    priceRange: priceRangeSchema.optional(),
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().min(0).optional(),
    about: z.string().optional(),
    googleMapsUrl: z.string().optional(),
    emergency: z.boolean().optional(),
    isClaimed: z.boolean().optional(),
  }),
});

export const VetValidation = { createVetSchema, updateVetSchema };
