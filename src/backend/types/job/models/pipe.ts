import type { JobStatus } from './main';

export interface JobPipe {
  id: string;
  createdAt: number;
  timeToExec: number;
  title: string;
  cmd: string;
  ignoreIfFail: boolean;
  stdout: string; // --> pointer to file (ex. bcms_storage/bngine/2021-09-07/{PIPE_ID}_out)
  stderr: string; // --> pointer to file (ex. bcms_storage/bngine/2021-09-07/{PIPE_ID}_err)
  status: JobStatus;
}
