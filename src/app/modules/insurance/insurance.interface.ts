import {
  COVERAGE_TYPES,
  INSURANCE_BADGES,
  PET_TYPES,
} from './insurance.constants';

export type TCoverageFlag = (typeof COVERAGE_TYPES)[number];

export type TInsuranceBadge = (typeof INSURANCE_BADGES)[number];

export type TPetType = (typeof PET_TYPES)[number];

export type TInsuranceProvider = {
  name: string;
  logo: string;
  badge?: TInsuranceBadge;
  priceFrom: number;
  priceTo: number;
  annualLimit: number;
  reimbursement: number;
  claimsIn: string;
  coverageScore: number;
  maxAgeYears: number;
  minAgeWeeks: number;
  pets: TPetType[];
  plans: string[];
  coverageFlags: TCoverageFlag[];
  coveredConditions: string[];
  excludedConditions: string[];
  highlights: string[];
  website: string;
  phone: string;
  email: string;
  about: string;
  avgRating: number;
  reviewCount: number;
};
