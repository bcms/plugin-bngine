import { Types } from 'mongoose';
import type {
  Project,
  ProjectGitRepo,
  ProjectProtected,
  ProjectRunCmd,
  ProjectVar,
} from '../types';

export class ProjectFactory {
  static instance(data: {
    name?: string;
    repo?: ProjectGitRepo;
    vars?: ProjectVar[];
    run?: ProjectRunCmd[];
  }): Project {
    return {
      _id: `${new Types.ObjectId()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      name: data.name || '',
      repo: data.repo
        ? {
            branch: data.repo.branch,
            name: data.repo.name,
            sshKey: data.repo.sshKey,
            url: data.repo.url,
          }
        : {
            branch: '',
            name: '',
            sshKey: '',
            url: '',
          },
      vars: data.vars
        ? data.vars.map((variable) => {
            return {
              key: variable.key,
              value: variable.value,
            };
          })
        : [],
      run: data.run
        ? data.run.map((run) => {
            return {
              command: run.command || '',
              ignoreIfFail: run.ignoreIfFail || false,
              title: run.title || '',
            };
          })
        : [],
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
