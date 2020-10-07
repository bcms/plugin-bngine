import {
  FSDBRepository,
  FSDBRepositoryPrototype,
  Logger,
  Model,
} from '@becomes/purple-cheetah';
import { ProjectFS, ProjectSchema } from '../../models';

@FSDBRepository({
  collectionName: `${process.env.DB_PRFX}_bngine_projects`,
  schema: ProjectSchema,
})
export class ProjectFSRepository implements FSDBRepositoryPrototype<ProjectFS> {
  repo: Model<ProjectFS>;
  logger: Logger;
  findAll: () => Promise<ProjectFS[]>;
  findAllBy: (query: (e: ProjectFS) => boolean) => Promise<ProjectFS[]>;
  findAllById: (ids: string[]) => Promise<ProjectFS[]>;
  findBy: (query: (e: ProjectFS) => boolean) => Promise<ProjectFS>;
  findById: (id: string) => Promise<ProjectFS>;
  add: (e: ProjectFS) => Promise<void>;
  addMany: (e: ProjectFS[]) => Promise<void>;
  update: (e: ProjectFS) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: ProjectFS) => boolean) => Promise<void>;
  deleteMany: (query: (e: ProjectFS) => boolean) => Promise<void>;
  count: () => Promise<number>;

  async findByName(name: string): Promise<ProjectFS> {
    return this.repo.findOne((e) => e.name === name);
  }
}
