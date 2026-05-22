export interface IInsuranceRequest {
  petName: string;
  species: string;
  breed?: string;
  ageYears: number;
  existingConditions?: string;
  budget: 'low' | 'medium' | 'high';
}

export interface IInsuranceResponse {
  recommendation: string;
  topProvider: string;
  reasoning: string;
  tips: string[];
}
