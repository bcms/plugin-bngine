import { Types } from 'mongoose';
import { Project, ProjectFS, ProjectProtected } from '../models';

export class ProjectFactory {
  static get instance(): ProjectFS | Project {
    if (process.env.DB_USE_FS) {
      return new ProjectFS(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        '',
        {
          branch: '',
          name: '',
          sshKey: '',
          url: '',
        },
        [],
        [],
      );
    } else {
      return new Project(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        '',
        {
          branch: '',
          name: '',
          sshKey: '',
          url: '',
        },
        [],
        [],
      );
    }
  }
  static toProtected(e: ProjectFS | Project): ProjectProtected {
    return {
      _id: `${e._id}`,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      name: e.name,
      repo: {
        branch: e.repo.branch,
        name: e.repo.name,
        url: e.repo.url,
      },
      vars: e.vars,
      run: e.run,
    };
  }
}
