import type { JobPipe } from '../../backend/types';

// eslint-disable-next-line no-shadow
export enum JobSocketEventName {
  JOB = 'JOB',
  JOB_PIPE_CREATE = 'JOB_PIPE_CREATE',
  JOB_PIPE_UPDATE = 'JOB_PIPE_UPDATE',
  JOB_PIPE_COMPLETE = 'JOB_PIPE_COMPLETE',
}

export interface JobSocketEventNew {
  /** Job ID */
  j: string;
}

export interface JobSocketEventPipeCreate {
  /** Job ID */
  j: string;
  /** New Pipe for this job */
  p: JobPipe;
}

export interface JobSocketEventPipeUpdate {
  /** Job ID */
  j: string;
  /** Pipe ID */
  pid: string;
  stdout?: string;
  stderr?: string;
}

export interface JobSocketEventPipeComplete {
  /** Job ID */
  j: string;
  /** New Pipe for this job */
  p: JobPipe;
}

export type BCMSBngineCustomSocketEvents =
  | JobSocketEventNew
  | JobSocketEventPipeCreate
  | JobSocketEventPipeUpdate
  | JobSocketEventPipeComplete;
