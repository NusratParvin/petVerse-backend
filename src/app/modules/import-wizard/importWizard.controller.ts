import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { ImportWizardService } from './importWizard.service';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';

const parseVetNotes = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.files);
  // multer puts files in req.files, text field comes in req.body
  const files = (req.files as Express.Multer.File[]) ?? [];
  const text: string = req.body.text ?? '';
  // console.log(files, 'files');
  if (files.length === 0 && text.trim().length < 5) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Please upload at least one image or paste some text.',
      data: null,
    });
  }

  if (text.length > 8000) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Text is too long. Please keep it under 8000 characters.',
      data: null,
    });
  }

  // Pass file buffers + mimetype — service decides text vs vision
  const fileMeta = files.map((f) => ({
    buffer: f.buffer,
    mimetype: f.mimetype,
  }));
  // console.log(fileMeta, 'filemeta');
  const result = await ImportWizardService.parseVetNotes(
    fileMeta,
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
