import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import {
  HttpErrorFactory,
  HttpStatus,
  JWTConfigService,
  JWTSecurity,
  Logger,
  ObjectUtility,
  PermissionName,
  RoleName,
  StringUtility,
  FSUtil,
} from '@becomes/purple-cheetah';
import { ResponseCode } from '@becomes/cms-backend';
import type { Project, ProjectFS, ProjectProtected } from '../models';
import { ProjectRepo } from '../repository';
import { ProjectFactory } from '../factory/project';
import {
  CreateProjectData,
  CreateProjectDataSchema,
  UpdateProjectData,
  UpdateProjectDataSchema,
} from '../interfaces';
import { GeneralUtil } from '../util';

ResponseCode.register([
  {
    name: 'bnginep001',
    msg: 'Project with ID "%id%" does not exist.',
  },
  {
    name: 'bnginep002',
    msg: 'Project with name "%name%" already exist.',
  },
  {
    name: 'bnginep003',
    msg: 'Failed to add a Project to the database.',
  },
  {
    name: 'bnginep004',
    msg: 'Failed to update a Project in the database.',
  },
  {
    name: 'bnginep005',
    msg: 'Failed to remove a Project from the database.',
  },
  {
    name: 'bnginep006',
    msg: 'Project with name "%name%" does not exist.',
  },
  {
    name: 'bnginep007',
    msg: 'Preview with name "%name%" does not exist.',
  },
]);

export class ProjectRequestHandler {
  private static logger = new Logger('BngineProjectRequestHandler');

  static async getAllProtected(
    authorization: string,
  ): Promise<ProjectProtected[]> {
    const error = HttpErrorFactory.instance('getAllProtected', this.logger);
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.READ,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    const projects: Array<Project | ProjectFS> = await ProjectRepo.findAll();
    if (projects.length < 3) {
      const ps = ['production', 'staging', 'preview'];
      for (const i in ps) {
        const e = ps[i];
        if (!projects.find((p) => p.name === e)) {
          const project = ProjectFactory.instance;
          project.name = e;
          await ProjectRepo.add(project);
          projects.push(project);
        }
      }
    }
    return projects.map((e) => {
      return ProjectFactory.toProtected(e);
    });
  }
  static async getByIdProtected(
    authorization: string,
    id: string,
  ): Promise<ProjectProtected> {
    const error = HttpErrorFactory.instance('getByIdProtected', this.logger);
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.READ,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', {
          id,
        }),
      );
    }
    const project = await ProjectRepo.findById(id);
    if (!project) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('bnginep001', {
          id,
        }),
      );
    }
    return ProjectFactory.toProtected(project);
  }
  static async getBranches(
    authorization: string,
    projectName: string,
  ): Promise<string[]> {
    const error = HttpErrorFactory.instance('getBranches', this.logger);
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.READ,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    const project = await ProjectRepo.findByName(projectName);
    if (!project) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('bnginep006', {
          name: projectName,
        }),
      );
    }
    if (
      (await util.promisify(fs.exists)(
        path.join(process.cwd(), 'workspace', project.repo.name),
      )) === false
    ) {
      return [];
    }
    try {
      await GeneralUtil.exec(
        `cd ${path.join(
          process.cwd(),
          'workspace',
          project.repo.name,
        )} && git pull`,
        () => {},
      );
    } catch (e) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to pull repository.',
      );
    }
    let data = '';
    let err = '';
    try {
      await GeneralUtil.exec(
        `cd ${path.join(
          process.cwd(),
          'workspace',
          project.repo.name,
        )}  && git branch -a | grep "origin"`,
        (chunk, type) => {
          if (type === 'stderr') {
            err += chunk;
          } else {
            data += chunk;
          }
        },
      );
    } catch (e) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to list branches: ' + err,
      );
    }
    const branches = data
      .replace(/remotes\/origin\//g, '')
      .replace(/  /g, '')
      .split('\n')
      .filter(
        (e) =>
          e !== '' &&
          !e.includes('HEAD') &&
          !e.includes('master') &&
          !e.includes('staging'),
      );
    return branches;
  }
  static async getPreviews(
    authorization: string,
    projectName: string,
  ): Promise<string[]> {
    const error = HttpErrorFactory.instance('getPreviews', this.logger);
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.READ,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    const project = await ProjectRepo.findByName(projectName);
    if (!project) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('bnginep006', {
          name: projectName,
        }),
      );
    }
    if (
      await util.promisify(fs.exists)(
        path.join(process.cwd(), 'uploads', 'bngine', 'previews'),
      )
    ) {
      return util.promisify(fs.readdir)(
        path.join(process.cwd(), 'uploads', 'bngine', 'previews'),
      );
    }
    return [];
  }
  static async create(
    authorization: string,
    data: CreateProjectData,
  ): Promise<ProjectProtected> {
    const error = HttpErrorFactory.instance('create', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, CreateProjectDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.WRITE,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    const project = ProjectFactory.instance;
    project.name = data.name;
    project.repo = data.repo;
    project.vars = data.vars;
    project.run = data.run;
    const projectWithSameName = await ProjectRepo.findByName(project.name);
    if (projectWithSameName) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('bnginep002', {
          name: project.name,
        }),
      );
    }
    const addResult = await ProjectRepo.add(project as ProjectFS & Project);
    if (addResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('bnginep003'),
      );
    }
    return ProjectFactory.toProtected(project);
  }
  static async update(
    authorization: string,
    data: UpdateProjectData,
  ): Promise<ProjectProtected> {
    const error = HttpErrorFactory.instance('update', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, UpdateProjectDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    if (StringUtility.isIdValid(data._id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', {
          id: data._id,
        }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.WRITE,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    const project = await ProjectRepo.findById(data._id);
    if (!project) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('bnginep001', {
          id: data._id,
        }),
      );
    }
    let changeDetected = false;
    if (data.name && project.name !== data.name) {
      changeDetected = true;
      const projectWithSameName = await ProjectRepo.findByName(data.name);
      if (projectWithSameName) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          ResponseCode.get('bnginep002', {
            name: project.name,
          }),
        );
      }
      project.name = data.name;
    }
    if (data.repo) {
      if (data.repo.name) {
        changeDetected = true;
        project.repo.name = data.repo.name;
      }
      if (data.repo.url) {
        changeDetected = true;
        project.repo.url = data.repo.url;
      }
      if (data.repo.branch) {
        changeDetected = true;
        project.repo.branch = data.repo.branch;
      }
      if (data.repo.sshKey) {
        changeDetected = true;
        project.repo.sshKey = data.repo.sshKey;
      }
    }
    if (data.run) {
      changeDetected = true;
      project.run = data.run;
    }
    if (data.vars) {
      project.vars = data.vars;
    }
    if (changeDetected) {
      const updateResult = await ProjectRepo.update(
        project as Project & ProjectFS,
      );
      if (updateResult === false) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ResponseCode.get('bnginep004'),
        );
      }
    }
    return ProjectFactory.toProtected(project);
  }
  static async deleteById(authorization: string, id: string): Promise<void> {
    const error = HttpErrorFactory.instance('deleteById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', {
          id: id,
        }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.DELETE,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    const project = await ProjectRepo.findById(id);
    if (!project) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('bnginep001', {
          id: id,
        }),
      );
    }
    const deleteResult = await ProjectRepo.deleteById(id);
    if (deleteResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('bnginep005'),
      );
    }
  }
  static async deletePreview(
    authorization: string,
    name: string,
  ): Promise<void> {
    const error = HttpErrorFactory.instance('deletePreview', this.logger);
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.DELETE,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    if (
      (await util.promisify(fs.exists)(
        path.join(
          process.cwd(),
          'uploads',
          'bngine',
          'previews',
          name.replace(/\.\./g, '').replace(/\/\//g, '/'),
        ),
      )) === false
    ) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('bnginep007', {
          name,
        }),
      );
    }
    await FSUtil.deleteDir(
      path.join(
        process.cwd(),
        'uploads',
        'bngine',
        'previews',
        name.replace(/\.\./g, '').replace(/\/\//g, '/'),
      ),
    );
  }
}
