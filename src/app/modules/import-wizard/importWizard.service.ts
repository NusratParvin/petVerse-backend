import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import config from '../../config';
import { buildPrompt } from './constant';
import { THealthRecordType } from '../pets/pets.interface';

const gemini = new GoogleGenAI({ apiKey: config.gemini_api_key });
// const groq   = new Groq({ apiKey: config.groq_api_key });
const groq = new OpenAI({
  apiKey: config.groq_api_key,
  baseURL: 'https://api.groq.com/openai/v1',
});

export interface ParsedHealthRecord {
  type: THealthRecordType;
  title: string;
  date: string;
  nextDueDate?: string;
  notes?: string;
  cost?: number;
  vetName?: string;
}

export interface ParseResult {
  records: ParsedHealthRecord[];
  summary: string;
  model: string;
}

// ── Validate + normalise ──────────────────────────────────────────────────────
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

const normalise = (raw: string, model: string): ParseResult => {
  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  const invoiceDate =
    parsed.invoiceDate || new Date().toISOString().split('T')[0];
  const vetName = parsed.doctorName || parsed.clinicName || undefined;

  const records: ParsedHealthRecord[] = (parsed.records ?? []).map(
    (r: any) => ({
      type: VALID_TYPES.includes(r.type) ? r.type : 'other',
      title: r.title ?? 'Unknown',
      date: r.date ?? invoiceDate,
      vetName: r.vetName ?? vetName,
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

// ── Gemini Flash (primary) ────────────────────────────────────────────────────
const parseWithGemini = async (
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
    // prompt last
    { text: buildPrompt(text) },
  ];

  const res = await gemini.models.generateContent({
    model: 'gemini-3-flash-preview',
    config: { responseMimeType: 'application/json' },
    contents: [{ role: 'user', parts }],
  });

  return normalise(res.text ?? '{}', 'gemini-3-flash-preview');
};

// ── Llama 4 via Groq (fallback) ───────────────────────────────────────────────
const parseWithLlama = async (
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

  return normalise(res.choices[0].message.content ?? '{}', 'llama-4-scout');
};

// ── Text only (no images) — Gemini text, cheaper than vision ─────────────────
const parseTextOnly = async (text: string): Promise<ParseResult> => {
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
  return normalise(res.text ?? '{}', 'gemini-3-flash-preview-text');
};

// ── Main entry — Gemini first, Llama fallback ─────────────────────────────────
export const parseVetNotes = async (
  files: { buffer: Buffer; mimetype: string }[],
  text?: string,
): Promise<ParseResult> => {
  if (files.length === 0 && text) {
    return parseTextOnly(text);
  }
  console.log(text, 'service text');
  try {
    return await parseWithGemini(files, text);
  } catch (err: any) {
    console.warn(
      `[ImportWizard] Gemini failed (${err?.message}) — trying Llama`,
    );
    try {
      return await parseWithLlama(files, text);
    } catch (err2: any) {
      console.error('[ImportWizard] Both providers failed:', err2?.message);
      throw new Error('AI parsing failed. Please try again later.');
    }
  }
};

export const ImportWizardService = { parseVetNotes };
