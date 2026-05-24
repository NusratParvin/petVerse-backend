import { GoogleGenAI } from '@google/genai';
import { InsuranceProvider } from './insurance.model';
import { TInsuranceProvider } from './insurance.interface';
import config from '../../config';

const gemini = new GoogleGenAI({ apiKey: config.gemini_api_key });

const getAllProviders = async () => {
  return await InsuranceProvider.find().sort({ createdAt: -1 });
};

const getProviderById = async (id: string) => {
  return await InsuranceProvider.findById(id);
};

const createProvider = async (payload: TInsuranceProvider) => {
  return await InsuranceProvider.create(payload);
};

const updateProvider = async (
  id: string,
  payload: Partial<TInsuranceProvider>,
) => {
  return await InsuranceProvider.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const deleteProvider = async (id: string) => {
  return await InsuranceProvider.findByIdAndDelete(id);
};

const getAIRecommendation = async (formData: {
  petName: string;
  species: string;
  breed: string;
  ageYears: string;
  existingConditions: string;
  budget: string;
}) => {
  const providers = await InsuranceProvider.find();

  const providerSummary = providers
    .map(
      (p) =>
        `- ${p.name}: AED ${p.priceFrom}–${p.priceTo}/mo, covers ${p.coverageFlags.join(', ')}, score ${p.coverageScore}%, pets: ${p.pets.join('/')}`,
    )
    .join('\n');

  const prompt = `
You are a UAE pet insurance expert. Based on the pet details below, recommend the best insurance provider from the list.

Pet Details:
- Name: ${formData.petName}
- Species: ${formData.species}
- Breed: ${formData.breed}
- Age: ${formData.ageYears} years
- Existing conditions: ${formData.existingConditions}
- Monthly budget: ${formData.budget} (low=AED 90–150, medium=AED 150–250, high=AED 250+)

Available UAE Providers:
${providerSummary}

Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "topProvider": "Provider Name",
  "recommendation": "One-sentence recommendation",
  "reasoning": "2–3 sentence explanation of why this provider fits",
  "tips": ["tip 1", "tip 2", "tip 3"]
}
`.trim();

  const response = await gemini.models.generateContent({
    model: 'gemini-3-flash-preview',
    config: { responseMimeType: 'application/json' },
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  const text = response.text;

  if (!text) {
    throw new Error('Empty Gemini response');
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(text);

    throw new Error('Invalid JSON response from Gemini');
  }
};

export const InsuranceService = {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  getAIRecommendation,
};
