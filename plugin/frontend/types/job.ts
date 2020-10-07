export enum JobStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  RUNNING = 'RUNNING',
  QUEUE = 'QUEUE',
}
export interface JobPipe {
  id: string;
  createdAt: number;
  timeToExec: number;
  title: string;
  cmd: string;
  ignoreIfFail: boolean;
  out: string;
  err: string;
  status: JobStatus;
}
export interface JobPipeModified {
  id: string;
  createdAt: number;
  timeToExec: string;
  show: boolean;
  title: string;
  cmd: string;
  ignoreIfFail: boolean;
  out: string;
  err: string;
  status: JobStatus;
}
export interface Job {
  _id: string;
  createdAt: number;
  updatedAt: number;
  finishedAt: number;
  inQueueFor: number;
  repo: {
    name: string;
    branch: string;
  };
  running: boolean;
  status: JobStatus;
  project: string;
  pipe: JobPipe[];
}
export interface JobModified {
  _id: string;
  time: string;
  createdAt: number;
  updatedAt: number;
  finishedAt: number;
  inQueueFor: number;
  repo: {
    name: string;
    branch: string;
  };
  running: boolean;
  status: JobStatus;
  project: string;
  pipe: JobPipeModified[];
}
export interface JobLite {
  _id: string;
  createdAt: number;
  updatedAt: number;
  finishedAt: number;
  inQueueFor: number;
  repo: {
    name: string;
    branch: string;
  };
  running: boolean;
  status: JobStatus;
  project: string;
}
