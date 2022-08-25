import type { BCMSModalInputDefaults } from '@becomes/cms-ui/types';

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
