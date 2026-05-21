export const validateImportWizardData = (
  files: Express.Multer.File[],
  text: string,
): string | null => {
  if (files.length === 0 && (!text || text.trim().length < 5)) {
    return 'Please upload at least one image or paste some text.';
  }

  if (text && text.length > 8000) {
    return 'Text is too long. Please keep it under 8000 characters.';
  }

  return null;
};
