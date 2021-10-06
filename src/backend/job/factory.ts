import { BCMSConfig } from '@becomes/cms-backend/config';
import { Types } from 'mongoose';
import { Job, JobLite, JobPipe, JobStatus } from '../types';

export class JobFactory {
  static instance(data: {
    finishedAt?: number;
    inQueueFor?: number;
    userId?: string;
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
      userId: `${data.userId}`,
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
    
    if (BCMSConfig.database.fs) {
      output._id = `${output._id}`;
    }
    return output;
  }

  static toLite(job: Job): JobLite {
    return {
      _id: `${job._id}`,
      status: job.status,
      updatedAt: job.updatedAt,
      createdAt: job.createdAt,
      finishedAt: job.finishedAt,
      repo: {
        branch: job.repo.branch,
      },
      project: job.project,
      userId: `${job.userId}`,
    };
  }
}
