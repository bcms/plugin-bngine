import {
  Project,
  ProjectGitRepo,
  ProjectVar,
  ProjectRunCmd,
} from '../../backend/types';
import { Store, StoreMutationTypes } from '../types';

export interface ProjectHandler {
  getAll(): Promise<Project[]>;
  get(id: string): Promise<Project>;
  create(data: {
    name: string;
    repo: ProjectGitRepo;
    vars: ProjectVar[];
    run: ProjectRunCmd[];
  }): Promise<Project>;
  update(data: {
    id: string;
    name?: string;
    repo?: ProjectGitRepo;
    vars?: ProjectVar[];
    run?: ProjectRunCmd[];
  }): Promise<Project>;
  delete(id: string): Promise<void>;
}

export function createProjectHandler({
  store,
}: {
  store: Store;
}): ProjectHandler {
  let getAllLetch = false;
  const baseUrl = '/plugin/bcms-plugin---name/project';

  return {
    async getAll() {
      if (getAllLetch) {
        return store.getters.project_items;
      }

      const result: {
        projects: Project[];
      } = await window.bcms.sdk.send({
        url: `${baseUrl}/all`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });

      store.commit(StoreMutationTypes.project_set, result.projects);

      getAllLetch = true;

      return result.projects;
    },
    async get(id) {
      const cacheHit = store.getters.project_findOne((e) => e._id === id);

      if (cacheHit) {
        return cacheHit;
      }

      const result: {
        project: Project;
      } = await window.bcms.sdk.send({
        url: `${baseUrl}/${id}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });

      store.commit(StoreMutationTypes.project_set, result.project);

      return result.project;
    },
    async create(data) {
      const result: {
        project: Project;
      } = await window.bcms.sdk.send({
        url: `${baseUrl}`,
        method: 'POST',
        headers: {
          Authorization: '',
        },
        data,
      });

      store.commit(StoreMutationTypes.project_set, result.project);

      return result.project;
    },
    async update(data) {
      const result: {
        project: Project;
      } = await window.bcms.sdk.send({
        url: `${baseUrl}`,
        method: 'PUT',
        headers: {
          Authorization: '',
        },
        data,
      });

      store.commit(StoreMutationTypes.project_set, result.project);

      return result.project;
    },
    async delete(id) {
      await window.bcms.sdk.send({
        url: `${baseUrl}/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: '',
        },
      });
    },
  };
}
