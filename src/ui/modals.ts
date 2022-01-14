import { BCMSModalServiceItem } from '@becomes/cms-ui/types';
import {
  BCMSAddProjectModalInputData,
  BCMSAddProjectModalOutputData,
} from './types';

export interface CustomModals {
  addProject: BCMSModalServiceItem<
    BCMSAddProjectModalOutputData,
    BCMSAddProjectModalInputData
  >;
}

export function registerModals(): void {
  window.bcms.modal.register({ name: 'addProject' });
}
