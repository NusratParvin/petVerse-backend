import OpenAI from 'openai';
import config from '../../../config';
import { IInsuranceRequest, IInsuranceResponse } from './insurance.interface';

const openai = new OpenAI({ apiKey: config.openai_api_key });

export const InsuranceService = {
  async getRecommendation(
    data: IInsuranceRequest,
  ): Promise<IInsuranceResponse> {
    const { petName, species, breed, ageYears, existingConditions, budget } =
      data;

    const budgetRanges = {
      low: 'AED 90-150',
      medium: 'AED 150-250',
      high: 'AED 250+',
    };

    const prompt = `
      You are a UAE pet insurance expert. A pet owner needs advice.
      
      Pet Details:
      - Name: ${petName}
      - Age: ${ageYears} years old
      - Species: ${species}
      - Breed: ${breed || 'Not specified'}
      - Existing conditions: ${existingConditions || 'None'}
      - Monthly budget: ${budgetRanges[budget]} (${budget} range)
      
      UAE insurance providers available:
      - GIG Gulf (AXA)
      - Sukoon Insurance
      - Gargash Insurance
      - MetLife UAE
      - PetAssure (Bupa)
      - InsuranceMarket.ae
      
      IMPORTANT: Reply ONLY with valid JSON. No markdown, no extra text.
      
      Return this EXACT JSON structure:
      {
        "recommendation": "2-3 sentence plain-English recommendation for this specific pet",
        "topProvider": "name of the best provider for this pet",
        "reasoning": "1-2 sentences explaining why this provider is best",
        "tips": ["tip 1", "tip 2", "tip 3"]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500,
    });

    const result = JSON.parse(completion.choices[0].message.content ?? '{}');

    return {
      recommendation:
        result.recommendation ||
        'Unable to generate recommendation at this time.',
      topProvider: result.topProvider || 'GIG Gulf (AXA)',
      reasoning:
        result.reasoning || 'Based on general pet insurance guidelines.',
      tips: result.tips || [
        'Compare multiple providers',
        'Read policy exclusions carefully',
        'Check waiting periods',
      ],
    };
  },
};
