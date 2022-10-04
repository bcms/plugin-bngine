import type { Project } from '../types';
import * as fsSystem from 'fs';
import * as util from 'util';
import * as path from 'path';
import { useFS } from '@becomes/purple-cheetah';
import { System } from '.';

export class ProjectHelper {
  static async setupProjectFS(project: Project): Promise<void> {
    const fs = useFS();
    if (!(await fs.exist(path.join(process.cwd(), `bngine-workspace`)))) {
      await fs.mkdir('bngine-workspace');
    }
    if (
      !(await fs.exist(
        path.join(process.cwd(), `bngine-workspace/${project._id}`)
      ))
    ) {
      await util.promisify(fsSystem.mkdir)(
        path.join(process.cwd(), `bngine-workspace/${project._id}`)
      );
    }
    if (project.repo.sshKey) {
      await fs.save(
        path.join(
          process.cwd(),
          'bngine-workspace',
          project._id,
          '.ssh',
          'key'
        ),
        project.repo.sshKey
      );
      await System.exec(`chmod 600 bngine-workspace/${project._id}/.ssh/key`);
    }
    if (
      !(await fs.exist(
        path.join(process.cwd(), `bngine-workspace/${project._id}/git`)
      ))
    ) {
      await this.cloneRepo(project);
    }
  }
  static async cloneRepo(project: Project): Promise<void> {
    if (project.repo.sshKey) {
      if (!project.repo.url.startsWith('git@')) {
        throw Error('Project does not have valid URL to be used with SSH key.');
      } else {
        await System.exec(
          [
            `cd bngine-workspace/${project._id}`,
            '&&',
            `git clone ${project.repo.url} git`,
            `--config core.sshCommand="ssh -i /app/bngine-workspace/${project._id}/.ssh/key" `,
          ].join(' ')
        );
      }
    } else {
      await System.exec(
        [
          `cd bngine-workspace/${project._id}`,
          '&&',
          `git clone ${project.repo.url} git`,
        ].join(' ')
      );
    }
  }

  static async pullRepo(project: Project): Promise<void> {
    await System.exec(
      [`cd bngine-workspace/${project._id}/git`, '&&', `git pull`].join(' '),
      (type, chunk) => {
        process[type].write(chunk);
      }
    );
  }
}
