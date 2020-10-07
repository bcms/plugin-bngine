import {
  FSDBRepository,
  FSDBRepositoryPrototype,
  Logger,
  Model,
} from '@becomes/purple-cheetah';
import type { JobLite } from '../../interfaces';
import { JobFS, JobSchema } from '../../models';

@FSDBRepository({
  collectionName: `${process.env.DB_PRFX}_bngine_jobs`,
  schema: JobSchema,
})
export class JobFSRepository implements FSDBRepositoryPrototype<JobFS> {
  repo: Model<JobFS>;
  logger: Logger;
  findAll: () => Promise<JobFS[]>;
  findAllBy: (query: (e: JobFS) => boolean) => Promise<JobFS[]>;
  findAllById: (ids: string[]) => Promise<JobFS[]>;
  findBy: (query: (e: JobFS) => boolean) => Promise<JobFS>;
  findById: (id: string) => Promise<JobFS>;
  add: (e: JobFS) => Promise<void>;
  addMany: (e: JobFS[]) => Promise<void>;
  update: (e: JobFS) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: JobFS) => boolean) => Promise<void>;
  deleteMany: (query: (e: JobFS) => boolean) => Promise<void>;
  count: () => Promise<number>;

  async findAllLite(): Promise<JobLite[]> {
    const output: JobLite[] = [];
    await this.repo.find((e) => {
      output.push({
        _id: e._id,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        finishedAt: e.finishedAt,
        inQueueFor: e.inQueueFor,
        repo: e.repo,
        project: e.project,
        running: e.running,
        status: e.status,
      });
      return false;
    });
    return output;
  }

  async findLiteById(_id: string): Promise<JobLite> {
    const job = await this.repo.findOne((e) => e._id === _id);
    return {
      _id: job._id,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      finishedAt: job.finishedAt,
      inQueueFor: job.inQueueFor,
      repo: job.repo,
      project: job.project,
      running: job.running,
      status: job.status,
    };
  }

  async findAllLiteByProject(project: string): Promise<JobLite[]> {
    const output: JobLite[] = [];
    await this.repo.find((e) => {
      if (e.project === project) {
        output.push({
          _id: e._id,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          finishedAt: e.finishedAt,
          inQueueFor: e.inQueueFor,
          repo: e.repo,
          project: e.project,
          running: e.running,
          status: e.status,
        });
      }
      return false;
    });
    return output;
  }

  async latest(): Promise<JobFS> {
    let job: JobFS;
    await this.repo.find((e) => {
      if (!job) {
        job = e;
      } else {
        if (job.createdAt < e.createdAt) {
          job = e;
        }
      }
      return false;
    });
    return job;
  }
}
