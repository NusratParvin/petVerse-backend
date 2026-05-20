/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../../../config';
import { THealthRecordType } from '../../pets/pets.interface';
import { ParsedHealthRecord, ParseResult } from '../importWizard.interface';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { buildPrompt } from './aiPrompt';

// AI connections
const gemini = new GoogleGenAI({ apiKey: config.gemini_api_key });
// const groq   = new Groq({ apiKey: config.groq_api_key });
const groq = new OpenAI({
  apiKey: config.groq_api_key,
  baseURL: 'https://api.groq.com/openai/v1',
});

//  Validate + normalize
const VALID_TYPES: THealthRecordType[] = [
  'vaccine',
  'vet-visit',
  'medication',
  'grooming',
  'lab-test',
  'surgery',
  'imaging',
  'hospitalization',
  'other',
];

const normalize = (raw: string, model: string): ParseResult => {
  //   console.log(raw, '------->raw text');
  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  //   console.log(parsed, '------->parsed text');

  const invoiceDate =
    parsed.invoiceDate || new Date().toISOString().split('T')[0];
  const vetName = parsed.doctorName || undefined;
  const clinicName = parsed.clinicName || undefined;

  const records: ParsedHealthRecord[] = (parsed.records ?? []).map(
    (r: any) => ({
      type: VALID_TYPES.includes(r.type) ? r.type : 'other',
      title: r.title ?? 'Unknown',
      date: r.date ?? invoiceDate,
      vetName: r.vetName ?? vetName,
      clinicName: r.clinicName ?? clinicName,
      ...(r.cost ? { cost: Number(r.cost) } : {}),
      ...(r.notes ? { notes: String(r.notes) } : {}),
      ...(r.nextDueDate ? { nextDueDate: r.nextDueDate } : {}),
    }),
  );

  return {
    records,
    summary: parsed.summary ?? `Found ${records.length} records.`,
    model,
  };
};

// const normalize = (raw: string, model: string): ParseResult => {
//   const clean = raw.replace(/```json|```/g, '').trim();

//   // Handle empty/error responses
//   if (!clean || clean === '{}' || clean === 'null') {
//     return {
//       records: [],
//       summary: 'No data could be extracted from the uploaded images.',
//       model,
//     };
//   }

//   try {
//     const parsed = JSON.parse(clean);

//     // NEW: Check if AI explicitly says no data
//     if (parsed.hasData === false) {
//       return {
//         records: [],
//         summary: parsed.summary || 'No veterinary invoice data found in the uploaded image(s).',
//         model,
//       };
//     }

//     const invoiceDate = parsed.invoiceDate || new Date().toISOString().split('T')[0];
//     const vetName = parsed.doctorName || undefined;
//     const clinicName = parsed.clinicName || undefined;

//     // Only create records if data exists
//     const records: ParsedHealthRecord[] = (parsed.records ?? []).map((r: any) => ({
//       type: VALID_TYPES.includes(r.type) ? r.type : 'other',
//       title: r.title ?? 'Unknown',
//       date: r.date ?? invoiceDate,
//       vetName: r.vetName ?? vetName,
//       clinicName: r.clinicName ?? clinicName,
//       ...(r.cost !== undefined && r.cost !== null ? { cost: Number(r.cost) } : {}),
//       ...(r.notes ? { notes: String(r.notes) } : {}),
//       ...(r.nextDueDate ? { nextDueDate: r.nextDueDate } : {}),
//     }));

//     // NEW: Filter out records that seem made up (no title, no cost, no type)
//     const validRecords = records.filter(r =>
//       r.title !== 'Unknown' || r.cost !== undefined || r.type !== 'other'
//     );

//     return {
//       records: validRecords,
//       summary: parsed.summary ?? (validRecords.length > 0
//         ? `Found ${validRecords.length} records.`
//         : 'No valid records could be extracted.'),
//       model,
//     };

//   } catch (error) {
//     console.error('JSON parse error:', error);
//     return {
//       records: [],
//       summary: 'Error parsing AI response. Please try again.',
//       model,
//     };
//   }
// };

//  Gemini Flash (primary)
export const parseWithGemini = async (
  files: { buffer: Buffer; mimetype: string }[],
  text?: string,
): Promise<ParseResult> => {
  const parts: any[] = [
    // images first
    ...files.map((f) => ({
      inlineData: {
        mimeType: f.mimetype,
        data: f.buffer.toString('base64'),
      },
    })),

    { text: buildPrompt(text) },
  ];

  const res = await gemini.models.generateContent({
    model: 'gemini-3-flash-preview',
    config: { responseMimeType: 'application/json' },
    contents: [{ role: 'user', parts }],
  });

  return normalize(res.text ?? '{}', 'gemini-3-flash-preview');
};

//  Llama 4 via Groq (fallback)
export const parseWithLlama = async (
  files: { buffer: Buffer; mimetype: string }[],
  text?: string,
): Promise<ParseResult> => {
  const res = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          // images as base64 data URLs
          ...files.map((f) => ({
            type: 'image_url' as const,
            image_url: {
              url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
            },
          })),
          { type: 'text' as const, text: buildPrompt(text) },
        ],
      },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
    max_tokens: 1500,
  });

  return normalize(res.choices[0].message.content ?? '{}', 'llama-4-scout');
};

//  Text only (no images) — Gemini text, cheaper than vision
export const parseTextOnly = async (text: string): Promise<ParseResult> => {
  console.log(text, 'parse');
  const res = await gemini.models.generateContent({
    model: 'gemini-3-flash-preview',
    config: { responseMimeType: 'application/json' },
    contents: [
      {
        role: 'user',
        parts: [{ text: buildPrompt() + '\n\nVet notes:\n' + text }],
      },
    ],
  });
  if (res) {
    console.log(res.text, 'result coming');
  } else {
    console.log('err');
  }
  return normalize(res.text ?? '{}', 'gemini-3-flash-preview-text');
};
