export interface ProjectRepo {
  name: string;
  url: string;
  branch: string;
}

export interface ProjectVar {
  key: string;
  value: string;
}

export interface ProjectRunCmd {
  title?: string;
  command: string;
  ignoreIfFail?: boolean;
}

export interface Project {
  _id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  repo: ProjectRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}

export interface ProjectModified {
  _id: string;
  createdAt: number;
  updatedAt: number;
  show: boolean;
  name: string;
  repo: ProjectRepo;
  vars: ProjectVar[];
  run: ProjectRunCmd[];
}
