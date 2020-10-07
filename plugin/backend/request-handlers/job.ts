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
} from '@becomes/purple-cheetah';
import {
  BngineStartJobData,
  BngineStartJobDataSchema,
  JobLite,
} from '../interfaces';
import { ResponseCode } from '@becomes/cms-backend';
import { JobRepo, ProjectRepo } from '../repository';
import type { Job, JobFS } from '../models';
import { JobFactory } from '../factory';
import { BuildEngine } from '../engine';

ResponseCode.register([
  {
    name: 'bnginej001',
    msg: 'This is error "%%test%".',
  },
  {
    name: 'bnginej002',
    msg: 'Invalid ID "%id%" was provided.',
  },
  {
    name: 'bnginej003',
    msg: '%msg%',
  },
  {
    name: 'bnginej004',
    msg: 'Job with ID "%id%" does not exist.',
  },
]);

export class JobRequestHandler {
  private static logger = new Logger('BngineJobRequestHandler');

  public static async getAllLite(authorization: string): Promise<JobLite[]> {
    const error = HttpErrorFactory.instance('getAllLite', this.logger);
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
    return await JobRepo.findAllLite();
  }

  public static async getAllLiteByProject(
    authorization: string,
    project: string,
  ): Promise<JobLite[]> {
    const error = HttpErrorFactory.instance('getAllLiteByProject', this.logger);
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
    return await JobRepo.findAllLiteByProject(project);
  }

  public static async getLiteById(
    authorization: string,
    id: string,
  ): Promise<JobLite> {
    const error = HttpErrorFactory.instance('getLiteById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('bnginej002', {
          id,
        }),
      );
    }
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
    const job = await JobRepo.findLiteById(id);
    if (!job) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('bnginej004', {
          id,
        }),
      );
    }
    return job;
  }

  public static async getById(
    authorization: string,
    id: string,
  ): Promise<Job | JobFS> {
    const error = HttpErrorFactory.instance('getById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('bnginej002', {
          id,
        }),
      );
    }
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
    const job = await JobRepo.findById(id);
    if (!job) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('bnginej004', {
          id,
        }),
      );
    }
    return job;
  }

  public static async startJob(
    authorization: string,
    projectName: string,
    data: BngineStartJobData,
  ): Promise<Job | JobFS> {
    const error = HttpErrorFactory.instance('startJob', this.logger);
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
    try {
      ObjectUtility.compareWithSchema(data, BngineStartJobDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('bnginej003', {
          msg: e.message,
        }),
      );
    }
    const project = await ProjectRepo.findByName(projectName);
    if (!project) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('bnginep002', {
          name: projectName,
        }),
      );
    }
    const job = JobFactory.instance;
    job.project = project.name;
    job.repo = {
      name: project.repo.name,
      branch: project.repo.branch,
    };
    if (typeof data.branch === 'string') {
      job.repo.branch = data.branch;
    }
    await JobRepo.add(job as Job & JobFS);
    BuildEngine.start(job, project, data.vars).catch((error) => {
      console.error(error);
      this.logger.error(`job_${job._id}`, error);
    });
    return job;
  }
}
