import type {
  ProjectCreateBody,
  ProjectProtected,
  ProjectUpdateBody,
} from '@backend/project';
import { store } from '@ui/store';

export class ProjectHandler {
  private getAllLetch = false;
  private baseUrl = '/plugin/bcms-plugin---name/project';

  async getAll(): Promise<ProjectProtected[]> {
    if (this.getAllLetch) {
      return store.project.items();
    }
    const result: {
      projects: ProjectProtected[];
    } = await window.bcms.sdk.send({
      url: `${this.baseUrl}/all`,
      method: 'GET',
      headers: {
        Authorization: '',
      },
    });
    store.project.set([...result.projects]);
    this.getAllLetch = true;
    return result.projects;
  }

  async get(id: string): Promise<ProjectProtected> {
    const cacheHit = store.project.find((e) => e._id === id);
    if (cacheHit) {
      return cacheHit;
    }
    const result: {
      project: ProjectProtected;
    } = await window.bcms.sdk.send({
      url: `${this.baseUrl}/${id}`,
      method: 'GET',
      headers: {
        Authorization: '',
      },
    });
    store.project.set(result.project);
    return result.project;
  }

  async create(data: ProjectCreateBody): Promise<ProjectProtected> {
    const result: {
      project: ProjectProtected;
    } = await window.bcms.sdk.send({
      url: `${this.baseUrl}`,
      method: 'POST',
      headers: {
        Authorization: '',
      },
      data,
    });
    store.project.set(result.project);
    return result.project;
  }

  async update(data: ProjectUpdateBody): Promise<ProjectProtected> {
    const result: {
      project: ProjectProtected;
    } = await window.bcms.sdk.send({
      url: `${this.baseUrl}`,
      method: 'PUT',
      headers: {
        Authorization: '',
      },
      data,
    });
    store.project.set(result.project);
    return result.project;
  }

  async delete(id: string): Promise<void> {
    await window.bcms.sdk.send({
      url: `${this.baseUrl}/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: '',
      },
    });
    store.project.remove(id);
  }
}
