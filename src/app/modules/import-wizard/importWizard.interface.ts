import { THealthRecordType } from '../pets/pets.interface';

export interface ParsedHealthRecord {
  type: THealthRecordType;
  title: string;
  date: string;
  nextDueDate?: string;
  notes?: string;
  cost?: number;
  vetName?: string;
  clinicName?: string;
}
export interface ParseResult {
  records: ParsedHealthRecord[];
  summary: string;
  model: string;
}
