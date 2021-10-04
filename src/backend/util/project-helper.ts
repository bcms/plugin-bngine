import type { Project } from '../types';

export class ProjectHelper {
  static async setupProjectFS(project: Project): Promise<void> {
    // TODO: 1. Check if /bngine-workspace/{project_id} exists - If not, create dir
    // TODO: 2. Check if SSH key is present in a Project.
    // TODO: 2.1 If it is present, save it to file /bngine-workspace/{project_id}/.ssh/key
    //            After that, change file mode to 600 (chmod 600 /bngine-workspace/{project_id}/.ssh/key)
    // TODO: 2.2 If not, skip
    // TODO: 3. Check if /bngine-workspace/{project_id}/git exists
    // TODO: 3.1 If it does exist, skip
    // TODO: 3.2 If it does not exist:
    // TODO: 3.2.1 SSH Key is available - Check if URL is SSH compatible.
    //              If it is clone repo with SSH key
    //              (git clone URL --config ssh.coreCommand="ssh -i /app/bngine-workspace/{project_id}/.ssh/key")
    // TODO: 3.2.2 SSH Key is not available - Clone normally (git clone {URL})
  }
}
