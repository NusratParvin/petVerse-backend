export const ARTICLE_CATEGORIES = [
  'Tip',
  'Story',
  'Health',
  'Nutrition',
  'Training',
  'News',
] as const;

export const PET_TYPES = [
  'dog',
  'cat',
  'fish',
  'bird',
  'rabbit',
  'reptile',
  'other',
] as const;

export const articleFilterableFields = [
  'search',
  'category',
  'petType',
  'status',
  'isPremium',
  'range',
];
export const articleSearchableFields = ['title', 'content', 'tags'];
export const articlePaginationFields = ['page', 'limit', 'sortBy', 'sortOrder'];
