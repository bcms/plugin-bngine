import type { BCMSModalInputDefaults } from '@ui/bcms-ui/types';

export type BCMSJobDetailsModalOutputData = void;
export interface BCMSJobDetailsModalInputData
  extends BCMSModalInputDefaults<BCMSJobDetailsModalOutputData> {
  jobId: string;
}
