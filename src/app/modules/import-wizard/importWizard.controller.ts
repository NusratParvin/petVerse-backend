import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { ImportWizardService } from './importWizard.service';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { validateImportWizardData } from './helpers/validateImportWizardData';

const parseVetNotes = catchAsync(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const text: string = req.body.text ?? '';

  const validateImportWizardDataError = validateImportWizardData(files, text);
  // console.log(text, 'text');
  if (validateImportWizardDataError) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: validateImportWizardDataError,
      data: null,
    });
  }

  const fileInfo = files.map((f) => ({
    buffer: f.buffer,
    mimetype: f.mimetype,
  }));

  // console.log(fileMeta, 'filemeta');
  const result = await ImportWizardService.parseVetNotes(
    fileInfo,
    text || undefined,
  );
  console.log(result, 'result');
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.records.length
      ? `Found ${result.records.length} health record(s).`
      : 'No health records detected.',
    data: result,
  });
});

export const ImportWizardController = { parseVetNotes };
