export const buildPrompt = (extraText?: string) =>
  `
UAE vet invoice parser. Return ONLY JSON, no markdown.

Types: vaccine | vet-visit | medication | grooming | lab-test | surgery | imaging | hospitalization | other

Map: Consultation→vet-visit, Blood/CBC/Hematology→lab-test, X-Ray/Ultrasound→imaging, Surgical/Fixation→surgery, Boarding/per day→hospitalization, Tablet/Syrup/Inj→medication, Vaccine/Booster→vaccine

Rules:
- One record per invoice line item
- cost = final total per line after discount (AED)
- date = invoice date as YYYY-MM-DD (today if missing)
- vetName = doctor or clinic name
- Skip VAT/discount/subtotal/total rows

{
  "invoiceDate": "YYYY-MM-DD",
  "clinicName": "string|null",
  "doctorName": "string|null",
  "records": [
    {
      "type": "",
      "title": "",
      "cost": 0,
      "notes": "dosage or qty if shown",
      "nextDueDate": "YYYY-MM-DD if mentioned"
    }
  ],
  "summary": "Found X records from [clinic] on [date] totalling AED [amount]"
}
${extraText ? `\nUser note: ${extraText}` : ''}
`.trim();
