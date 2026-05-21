import express from 'express';
import { ImportWizardController } from './importWizard.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';
import { multerHelper } from './helpers/multerHelper';

const router = express.Router();

router.post(
  '/parse',
  auth(USER_ROLE.USER),
  multerHelper.array('files', 5),
  ImportWizardController.parseVetNotes,
);

export const ImportWizardRoutes = router;
