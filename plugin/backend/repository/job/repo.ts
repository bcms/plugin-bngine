import { JobFSRepository } from './fs';
import { JobMongoDBRepository } from './mongo';

export const JobRepo = process.env.DB_USE_FS
  ? new JobFSRepository()
  : new JobMongoDBRepository();
