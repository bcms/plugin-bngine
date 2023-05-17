import { Types } from 'mongoose';
import type { Job, JobLite } from './models';

export class JobFactory {
  static instance(data: Omit<Job, '_id' | 'createdAt' | 'updatedAt'>): Job {
    return {
      _id: `${new Types.ObjectId()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: data.userId,
      finishedAt: data.finishedAt,
      inQueueFor: data.inQueueFor,
      pipe: data.pipe,
      project: data.project,
      repo: data.repo,
      running: data.running,
      status: data.status,
    };
  }

  static toLite(job: Job): JobLite {
    return {
      _id: job._id,
      status: job.status,
      updatedAt: job.updatedAt,
      createdAt: job.createdAt,
      finishedAt: job.finishedAt,
      repo: job.repo,
      project: job.project,
      userId: job.userId,
      inQueueFor: job.inQueueFor,
      running: job.running,
    };
  }
}
