import { Job, JobFS, JobStatus } from '../models';
import { Types } from 'mongoose';

export class JobFactory {
  public static get instance(): Job | JobFS {
    if (process.env.DB_USE_FS) {
      return new JobFS(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        -1,
        -1,
        {
          branch: '',
          name: '',
        },
        false,
        JobStatus.QUEUE,
        '',
        [],
      );
    } else {
      return new Job(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        -1,
        -1,
        {
          branch: '',
          name: '',
        },
        false,
        JobStatus.QUEUE,
        '',
        [],
      );
    }
  }
}
