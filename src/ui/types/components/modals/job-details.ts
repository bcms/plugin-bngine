import { BCMSModalInputDefaults } from '@becomes/cms-ui/types';

export type BCMSJobDetailsModalOutputData = void;
export interface BCMSJobDetailsModalInputData
  extends BCMSModalInputDefaults<BCMSJobDetailsModalOutputData> {
  jobId: string;
}
