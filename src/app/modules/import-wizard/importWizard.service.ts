// src/app/modules/importWizard/importWizard.service.ts
import OpenAI from 'openai';
import config from '../../config';

const openai = new OpenAI({
  apiKey: config.openai_api_key,
  baseURL: 'https://api.groq.com/openai/v1',
});

export interface ParsedHealthRecord {
  type:
    | 'vaccine'
    | 'vet-visit'
    | 'medication'
    | 'grooming'
    | 'lab-test'
    | 'surgery'
    | 'imaging'
    | 'hospitalization'
    | 'other';
  title: string;
  date: string; // YYYY-MM-DD
  nextDueDate?: string;
  notes?: string;
  cost?: number; // AED
  vetName?: string;
}

export interface ParseResult {
  records: ParsedHealthRecord[];
  summary: string;
}

// ── Shared prompt used for both text and vision calls ─────────────────────────
const SYSTEM_PROMPT = `You are a veterinary records parser for PetVerse UAE.
You will receive either raw text notes OR a vet invoice/receipt image from a UAE clinic.

Extract EVERY health event or line item and return ONLY valid JSON in this exact shape:
{
  "records": [
    {
      "type": one of: "vaccine" | "vet-visit" | "medication" | "grooming" | "lab-test" | "surgery" | "imaging" | "hospitalization" | "other",
      "title": "short descriptive name e.g. Rabies Vaccine / Hematology / Surgical Procedure / X-Ray",
      "date": "YYYY-MM-DD",
      "nextDueDate": "YYYY-MM-DD — only include if explicitly mentioned",
      "notes": "any extra detail — include dosage, quantity, duration if present",
      "cost": number in AED — use the TOTAL/final price per line after discount, omit if not present,
      "vetName": "vet or clinic name if shown"
    }
  ],
  "summary": "one sentence: e.g. Found 8 records from Kare Clinic visit on 2 Apr 2026 totalling AED 3548"
}

Type mapping rules — use the MOST specific type:
- Consultation / Examination / Checkup → "vet-visit"
- Any vaccine / booster / immunisation → "vaccine"
- Any tablet / syrup / injection / inj / medication → "medication"
- Blood test / CBC / hematology / panel / culture → "lab-test"
- Surgical procedure / operation / spay / neuter / fracture fixation → "surgery"
- X-Ray / radiograph / ultrasound / scan / imaging → "imaging"
- Hospitalization / boarding / per day / overnight → "hospitalization"
- Grooming / bath / nail trim → "grooming"
- Anything else → "other"

Invoice rules:
- Each LINE ITEM on an invoice becomes its OWN separate record
- Use the invoice date as the date for every line item
- Use the TOTAL column (after discount, before or after VAT is fine) for cost
- The vet/doctor name shown on invoice goes in vetName for every record
- If multiple invoices are provided, process all of them

Return ONLY the JSON object. No markdown. No explanation. No backticks.
If nothing useful found: { "records": [], "summary": "No health records detected." }`;

// ── Text-only parse (paste input) ─────────────────────────────────────────────
const parseFromText = async (text: string): Promise<ParseResult> => {
  const completion = await openai.chat.completions.create({
    // model: 'gpt-4o-mini',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',

    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 3000,
  });

  return parseResponse(completion.choices[0].message.content);
};

// ── Vision parse (image/PDF input) ────────────────────────────────────────────
// Each file buffer is base64 encoded and sent as an image_url content part.
// GPT-4o reads the invoice visually — no separate OCR step needed.
const parseFromImages = async (
  files: { buffer: Buffer; mimetype: string }[],
  extraText?: string,
): Promise<ParseResult> => {
  // Build content array: one image part per file + optional text
  const imageContent: OpenAI.Chat.ChatCompletionContentPart[] = files.map(
    (f) => ({
      type: 'image_url',
      image_url: {
        url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
        detail: 'high', // high detail for invoices with small text
      },
    }),
  );

  const textPart: OpenAI.Chat.ChatCompletionContentPart = {
    type: 'text',
    text: extraText
      ? `Please extract all health records from the attached invoice image(s). Additional context: ${extraText}`
      : 'Please extract all health records from the attached invoice image(s).',
  };

  const completion = await openai.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [...imageContent, textPart],
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 3000,
  });

  return parseResponse(completion.choices[0].message.content);
};

// ── Parse + validate the raw JSON string from OpenAI ─────────────────────────
const VALID_TYPES = [
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

const parseResponse = (raw: string | null): ParseResult => {
  if (!raw) throw new Error('OpenAI returned empty response');

  const parsed = JSON.parse(raw) as ParseResult;

  parsed.records = (parsed.records ?? []).map((r) => ({
    ...r,
    // Fallback to 'other' if AI returns an unrecognised type
    type: VALID_TYPES.includes(r.type) ? r.type : 'other',
    // Fallback to today if date missing
    date: r.date || new Date().toISOString().split('T')[0],
    // Strip undefined fields to keep DB clean
    ...(r.nextDueDate ? { nextDueDate: r.nextDueDate } : {}),
    ...(r.notes ? { notes: r.notes } : {}),
    ...(r.cost ? { cost: r.cost } : {}),
    ...(r.vetName ? { vetName: r.vetName } : {}),
  })) as ParsedHealthRecord[];

  return parsed;
};

// ── Main entry point called by the controller ─────────────────────────────────
const parseVetNotes = async (
  files: { buffer: Buffer; mimetype: string }[],
  text?: string,
): Promise<ParseResult> => {
  if (files.length > 0) {
    // Images/PDFs provided — use Vision
    console.log(files, 'parse');
    return parseFromImages(files, text);
  }
  if (text) {
    // Text only
    return parseFromText(text);
  }
  throw new Error('No input provided');
};

export const ImportWizardService = { parseVetNotes };
