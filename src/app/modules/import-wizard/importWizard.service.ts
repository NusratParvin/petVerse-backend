/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  parseTextOnly,
  parseWithGemini,
  parseWithLlama,
} from './helpers/parseHelpers';
import { ParseResult } from './importWizard.interface';

//  Gemini first, Llama fallback
export const parseVetNotes = async (
  files: { buffer: Buffer; mimetype: string }[],
  text?: string,
): Promise<ParseResult> => {
  if (files.length === 0 && text) {
    return parseTextOnly(text);
  }
  // console.log(text, 'service text');
  try {
    return await parseWithGemini(files, text);
  } catch (errGemini: any) {
    console.warn(
      `ImportWizard ->  Gemini failed (${errGemini?.message}) — trying Llama`,
    );
    try {
      return await parseWithLlama(files, text);
    } catch (errBoth: any) {
      console.error('ImportWizard -> Both providers failed:', errBoth?.message);
      throw new Error('AI parsing failed. Please try again later.');
    }
  }
};

export const ImportWizardService = { parseVetNotes };
