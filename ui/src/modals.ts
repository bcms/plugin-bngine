import type { BCMSModalServiceItem } from '@bcms-ui/types';
import type {
  BCMSAddProjectModalInputData,
  BCMSAddProjectModalOutputData,
  BCMSJobDetailsModalInputData,
  BCMSJobDetailsModalOutputData,
  BCMSOtherProjectsModalInputData,
  BCMSOtherProjectsModalOutputData,
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
  otherProjects: BCMSModalServiceItem<
    BCMSOtherProjectsModalOutputData,
    BCMSOtherProjectsModalInputData
  >;
}

export function registerModals(): void {
  window.bcms.modal.register({ name: 'addProject' });
  window.bcms.modal.register({ name: 'jobDetails' });
  window.bcms.modal.register({ name: 'otherProjects' });
}
