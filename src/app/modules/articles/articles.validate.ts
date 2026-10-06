import { z } from 'zod';
import { ARTICLE_CATEGORIES, PET_TYPES } from './articles.constants';

const createArticleValidationSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, { message: 'Title is required' })
    .max(150, { message: 'Title must be 150 characters or less' }),
  content: z
    .string({ required_error: 'Content is required' })
    .min(1, { message: 'Content is required' }),
  category: z.enum(ARTICLE_CATEGORIES, {
    required_error: 'Category is required',
    invalid_type_error: 'Invalid category',
  }),
  petType: z
    .enum(PET_TYPES, { invalid_type_error: 'Invalid pet type' })
    .default('other'),
  tags: z
    .array(z.string().trim().min(1).max(20))
    .max(5, { message: 'You can add up to 5 tags' })
    .default([]),
  images: z.string().nullable().optional(),
  isPremium: z.boolean({ required_error: 'Premium selection is required' }),
  price: z.number().nonnegative().default(0),
});

const updateArticleValidationSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(ARTICLE_CATEGORIES).optional(),
  petType: z.enum(PET_TYPES).optional(),
  tags: z.array(z.string().trim().min(1).max(20)).max(5).optional(),
  images: z.string().nullable().optional(),
  isPremium: z.boolean().optional(),
  price: z.number().nonnegative().optional(),
});

export const ArticleValidation = {
  createArticleValidationSchema,
  updateArticleValidationSchema,
};
