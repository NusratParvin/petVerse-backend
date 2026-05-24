import { z } from 'zod';

export const createInsuranceReviewValidationSchema = z.object({
  // provider: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string(),
  planUsed: z.string().optional(),
});
