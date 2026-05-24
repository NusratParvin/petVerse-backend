import { z } from 'zod';

import {
  COVERAGE_TYPES,
  INSURANCE_BADGES,
  PET_TYPES,
} from './insurance.constants';

export const createInsuranceProviderValidationSchema = z.object({
  name: z.string(),
  logo: z.string(),
  badge: z.enum(INSURANCE_BADGES).optional(),
  priceFrom: z.number(),
  priceTo: z.number(),
  annualLimit: z.number(),
  reimbursement: z.number(),
  claimsIn: z.string(),
  coverageScore: z.number().min(0).max(100),
  maxAgeYears: z.number(),
  minAgeWeeks: z.number(),
  pets: z.array(z.enum(PET_TYPES)),
  plans: z.array(z.string()),
  coverageFlags: z.array(z.enum(COVERAGE_TYPES)),
  coveredConditions: z.array(z.string()),
  excludedConditions: z.array(z.string()),
  highlights: z.array(z.string()),
  website: z.string(),
  phone: z.string(),
  email: z.string().email(),
  about: z.string(),
});
