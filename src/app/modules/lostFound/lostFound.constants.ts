export const POST_TYPES = ['lost', 'found'] as const;
export const PET_SPECIES = [
  'dog',
  'cat',
  'bird',
  'fish',
  'rabbit',
  'reptile',
  'other',
] as const;
export const UAE_EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
] as const;
export const POST_STATUSES = ['active', 'resolved'] as const;

export const lostFoundFilterableFields = [
  'type',
  'status',
  'emirate',
  'species',
  'search',
];
export const lostFoundPaginationFields = [
  'page',
  'limit',
  'sortBy',
  'sortOrder',
];
