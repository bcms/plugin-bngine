import { Types } from 'mongoose';
import type { Project, ProjectProtected } from './models';

export class ProjectFactory {
  static instance(
    data: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>
  ): Project {
    return {
      _id: `${new Types.ObjectId()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      name: data.name,
      repo: data.repo,
      run: data.run,
      vars: data.vars,
    };
  }
  static toProtected(project: Project): ProjectProtected {
    return {
      _id: project._id,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      name: project.name,
      repo: {
        branch: project.repo.branch,
        name: project.repo.name,
        url: project.repo.url,
      },
      vars: project.vars,
      run: project.run,
    };
  }
}
