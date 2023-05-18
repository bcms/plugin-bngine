import type { BCMSModalInputDefaults } from '@ui/bcms-ui/types';

export interface BCMSAddProjectModalOutputData {
  projectName: string;
  repo: {
    name: string;
    branch: string;
    url: string;
    sshKey: string;
  };
}
export type BCMSAddProjectModalInputData =
  BCMSModalInputDefaults<BCMSAddProjectModalOutputData>;
