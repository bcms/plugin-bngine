import {
  Logger,
  MongoDBRepository,
  MongoDBRepositoryPrototype,
} from '@becomes/purple-cheetah';
import type { Model } from 'mongoose';
import { IProject, Project } from '../../models';

@MongoDBRepository({
  entity: {
    schema: Project.schema,
  },
  name: `${process.env.DB_PRFX}_bngine_projects`,
})
export class ProjectMongoRepository
  implements MongoDBRepositoryPrototype<Project, IProject> {
  repo: Model<IProject>;
  logger: Logger;
  findAll: () => Promise<Project[]>;
  findAllById: (ids: string[]) => Promise<Project[]>;
  findAllBy: <Q>(query: Q) => Promise<Project[]>;
  findById: (id: string) => Promise<Project>;
  findBy: <Q>(query: Q) => Promise<Project>;
  add: (e: Project) => Promise<boolean>;
  update: (e: Project) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  count: () => Promise<number>;

  async findByName(name: string): Promise<Project> {
    return await this.repo.findOne({ name });
  }
}
