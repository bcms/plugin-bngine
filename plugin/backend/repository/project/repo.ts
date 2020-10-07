import { ProjectFSRepository } from './fs';
import { ProjectMongoRepository } from './mongo';

export const ProjectRepo = process.env.DB_USE_FS
  ? new ProjectFSRepository()
  : new ProjectMongoRepository();
