import type { Project, ProjectProtected } from '../types';

export class ProjectFactory {
  static toProtected(project: Project): ProjectProtected {
    return {
      _id: `${project._id}`,
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
