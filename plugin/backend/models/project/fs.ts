import type { FSDBEntity } from '@becomes/purple-cheetah';
import type { ProjectRepo, ProjectRunCmd, ProjectVar } from './mongo';

export class ProjectFS implements FSDBEntity {
  constructor(
    public _id: string,
    public createdAt: number,
    public updatedAt: number,
    public name: string,
    public repo: ProjectRepo,
    public vars: ProjectVar[],
    public run: ProjectRunCmd[],
  ) {}
}
