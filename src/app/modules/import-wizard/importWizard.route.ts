import express from 'express';
import { ImportWizardController } from './importWizard.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';
import multer from 'multer';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post(
  '/parse',
  auth(USER_ROLE.USER),
  upload.array('files', 5),
  ImportWizardController.parseVetNotes,
);

export const ImportWizardRoutes = router;
