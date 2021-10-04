import type { Project } from '../types';
import * as fsSystem from 'fs';
import * as util from 'util';
import * as path from 'path';
import { useFS } from '@becomes/purple-cheetah';

export class ProjectHelper {
  static async setupProjectFS(project: Project): Promise<void> {
    const fs = useFS();
    return await new Promise<void>((resolve, reject) => {
      // TODO: 1. Check if /bngine-workspace/{project_id} exists - If not, create dir
      if (
        !fs.exist(path.join(process.cwd(), `bngine-workspace/${project._id}`))
      ) {
        util.promisify(fsSystem.mkdir)(
          path.join(process.cwd(), `bngine-workspace/${project._id}`)
        );
      }
      // TODO: 2. Check if SSH key is present in a Project.
      if (project.repo.sshKey !== '') {
        `${fs.save(
          path.join(
            process.cwd(),
            'bngine-workspace',
            project._id,
            '.ssh',
            'key'
          ),
          project.repo.sshKey
        )} && chmod 600 /bngine-workspace/${project._id}`;
      }
      // TODO: 2.1 If it is present, save it to file /bngine-workspace/{project_id}/.ssh/key
      //            After that, change file mode to 600 (chmod 600 /bngine-workspace/{project_id}/.ssh/key)
      // TODO: 2.2 If not, skip
      // TODO: 3. Check if /bngine-workspace/{project_id}/git exists
      console.log(project.repo.url === 'http | https');
      if (
        !fs.exist(
          path.join(process.cwd(), `bngine-workspace/${project._id}/git`)
        )
      ) {
        
        if (project.repo.sshKey) {
          if (project.repo.url.includes('http | https')) {
            reject(`Project have SSH key`);
          } else {
            `cd bngine-workspace/${project._id} && git clone ${project.repo.url} --config core.sshCommand="ssh -i /app/bngine-workspace/${project._id}/.ssh/key" `;
          }
        } else {
          `cd bngine-workspace/${project._id} && git clone ${project.repo.url}`;
        }
      }
      resolve();
      // TODO: 3.1 If it does exist, skip
      // TODO: 3.2 If it does not exist:
      // TODO: 3.2.1 SSH Key is available - Check if URL is SSH compatible.
      //              If it is clone repo with SSH key
      //              (git clone URL --config ssh.coreCommand="ssh -i /app/bngine-workspace/{project_id}/.ssh/key")
      // TODO: 3.2.2 SSH Key is not available - Clone normally (git clone {URL})
    });
  }
}
