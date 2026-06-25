export const POST_TYPES = ['lost', 'found'] as const;
export const PET_SPECIES = [
  'dog',
  'cat',
  'bird',
  'fish',
  'rabbit',
  'reptile',
  'other',
] as const;
export const UAE_EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
] as const;
export const POST_STATUSES = ['active', 'resolved'] as const;

export const lostFoundFilterableFields = [
  'type',
  'status',
  'emirate',
  'species',
  'search',
];
export const lostFoundPaginationFields = [
  'page',
  'limit',
  'sortBy',
  'sortOrder',
];

interface EmailTemplateProps {
  petName: string;
  ownerName: string;
  message: string;
}

export const emailTemplate = ({
  petName,
  ownerName,
  message,
}: EmailTemplateProps): string => {
  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #1B6CA8; padding: 24px; border-radius: 12px 12px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 20px;">🐾 PetVerse Lost & Found</h2>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Admin Support Team</p>
      </div>

      <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 12px;">Hi <strong>${ownerName}</strong>,</p>
        <p style="margin: 0 0 16px; color: #374151;">
          This message is regarding your Lost & Found post for
          <strong>${petName}</strong>.
        </p>

        <div style="background: white; border-left: 4px solid #1B6CA8; padding: 16px; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 0; white-space: pre-line; color: #374151; line-height: 1.6;">${message}</p>
        </div>

        <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0;">
          If you have any questions, please reply to this email.<br/>
          — PetVerse UAE Admin Team
        </p>
      </div>
    </div>
  `;
};
