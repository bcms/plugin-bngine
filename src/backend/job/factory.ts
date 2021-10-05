import { Types } from 'mongoose';
import { Job, JobLite, JobPipe, JobStatus } from '../types';

export class JobFactory {
  static instance(data: {
    finishedAt?: number;
    inQueueFor?: number;
    repo?: {
      name: string;
      branch: string;
    };
    running?: boolean;
    status?: JobStatus;
    project?: string;
    pipe?: JobPipe[];
  }): Job {
    const output: Job = {
      _id: new Types.ObjectId() as never,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      finishedAt: data.finishedAt || -1,
      inQueueFor: data.inQueueFor || -1,
      pipe: data.pipe || [],
      project: data.project || '',
      repo: data.repo || {
        branch: '',
        name: '',
      },
      running: false,
      status: JobStatus.QUEUE,
    };

    return output;
  }

  static toLite(job: Job): JobLite {
    // TODO: Map
  }
}
