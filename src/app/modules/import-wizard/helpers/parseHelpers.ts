/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../../../config';
import { THealthRecordType } from '../../pets/pets.interface';
import { ParsedHealthRecord, ParseResult } from '../importWizard.interface';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { buildImagePrompt, buildTextPrompt } from './aiPrompt';

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
  //text cleanup and parsing to json

  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

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
  console.log(records, 'normalized ');
  return {
    records,
    summary: parsed.summary ?? `Found ${records.length} records.`,
    model,
  };
};

export const parseWithGemini = async (
  files: { buffer: Buffer; mimetype: string }[],
  text?: string,
) => {
  const imageObjects = files.map((f) => ({
    inlineData: {
      mimeType: f.mimetype,
      data: f.buffer.toString('base64'),
    },
  }));

  const parts = [...imageObjects, { text: buildImagePrompt(text) }];

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
) => {
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
          { type: 'text' as const, text: buildImagePrompt(text) },
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
  const res = await gemini.models.generateContent({
    model: 'gemini-3-flash-preview',
    config: { responseMimeType: 'application/json' },
    contents: [
      {
        role: 'user',
        parts: [{ text: buildTextPrompt(text) }],
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
