// import { z } from 'zod';

// const createCommentValidationSchema = z.object({
//   articleId: z.string().nonempty({ message: 'Article ID is required' }),
//   commenter: z.object({
//     commenterId: z.string().nonempty({ message: 'Commenter ID is required' }),
//     name: z.string().nonempty({ message: 'Commenter name is required' }),
//     profilePhoto: z.string().optional().nullable().default(''),
//   }),
//   content: z.string().nonempty({ message: 'Comment content is required' }),
//   upvotes: z.number().int().optional(),
//   downvotes: z.number().int().optional(),
// });

// const updateCommentValidationSchema = z.object({
//   content: z.string().nonempty({ message: 'Comment content is required' }),
// });
// export const CommentValidation = {
//   createCommentValidationSchema,
//   updateCommentValidationSchema,
// };

import { z } from 'zod';

const createCommentValidationSchema = z.object({
  // polymorphic target
  targetType: z.enum(['Article', 'LostFound'], {
    required_error: 'targetType is required',
  }),
  targetId: z.string().nonempty({ message: 'targetId is required' }),

  // who posted (name + photo sent from frontend, commenterId set from JWT in controller)
  commenter: z.object({
    name: z.string().nonempty({ message: 'Commenter name is required' }),
    profilePhoto: z.string().optional().nullable().default(''),
  }),

  // content
  content: z.string().nonempty({ message: 'Comment content is required' }),

  // lost & found sighting fields — all optional, ignored for articles
  isSighting: z.boolean().optional().default(false),
  sightingLocation: z.string().optional().default(''),
  sightingPhoto: z.string().optional().default(''),
});

const updateCommentValidationSchema = z.object({
  content: z.string().nonempty({ message: 'Comment content is required' }),
});

const markHelpfulLeadValidationSchema = z.object({
  isHelpfulLead: z.boolean(),
});

export const CommentValidation = {
  createCommentValidationSchema,
  updateCommentValidationSchema,
  markHelpfulLeadValidationSchema,
};
