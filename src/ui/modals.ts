import { BCMSModalServiceItem } from '@becomes/cms-ui/types';
import {
  BCMSAddProjectModalInputData,
  BCMSAddProjectModalOutputData,
  BCMSJobDetailsModalInputData,
  BCMSJobDetailsModalOutputData,
} from './types';

export interface CustomModals {
  addProject: BCMSModalServiceItem<
    BCMSAddProjectModalOutputData,
    BCMSAddProjectModalInputData
  >;
  jobDetails: BCMSModalServiceItem<
    BCMSJobDetailsModalOutputData,
    BCMSJobDetailsModalInputData
  >;
}

export function registerModals(): void {
  window.bcms.modal.register({ name: 'addProject' });
  window.bcms.modal.register({ name: 'jobDetails' });
}
