import {
  Logger,
  MongoDBRepository,
  MongoDBRepositoryPrototype,
} from '@becomes/purple-cheetah';
import type { Model } from 'mongoose';
import type { JobLite } from '../../interfaces';
import { IJob, Job } from '../../models';

@MongoDBRepository({
  entity: {
    schema: Job.schema,
  },
  name: `${process.env.DB_PRFX}_bngine_jobs`,
})
export class JobMongoDBRepository
  implements MongoDBRepositoryPrototype<Job, IJob> {
  repo: Model<IJob>;
  logger: Logger;
  findAll: () => Promise<Job[]>;
  findAllById: (ids: string[]) => Promise<Job[]>;
  findAllBy: <Q>(query: Q) => Promise<Job[]>;
  findById: (id: string) => Promise<Job>;
  findBy: <Q>(query: Q) => Promise<Job>;
  add: (e: Job) => Promise<boolean>;
  update: (e: Job) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  private toLite(e: Job): JobLite {
    return {
      _id: e._id.toHexString(),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      finishedAt: e.finishedAt,
      inQueueFor: e.inQueueFor,
      repo: e.repo,
      project: e.project,
      running: e.running,
      status: e.status,
    };
  }

  private liteModelPropsToInclude() {
    return {
      _id: 1,
      createdAt: 1,
      updatedAt: 1,
      finishedAt: 1,
      inQueueFor: 1,
      repo: 1,
      project: 1,
      running: 1,
      status: 1,
    };
  }

  async findAllLite(): Promise<JobLite[]> {
    const output = await this.repo
      .find()
      .select(this.liteModelPropsToInclude());
    return output.map((e) => {
      return this.toLite(e);
    });
  }

  async findAllLiteByProject(project: string): Promise<JobLite[]> {
    const output = await this.repo
      .find({
        project,
      })
      .select(this.liteModelPropsToInclude());
    return output.map((e) => {
      return this.toLite(e);
    });
  }

  async findLiteById(_id: string): Promise<JobLite> {
    return (await this.repo
      .findOne({
        _id,
      })
      .select(this.liteModelPropsToInclude())) as any;
  }
}
