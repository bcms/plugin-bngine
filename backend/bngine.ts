import * as path from 'path';
import { BCMSConfig } from '@becomes/cms-backend/config';
import { useFS, useLogger } from '@becomes/purple-cheetah';
import { useSocket } from '@becomes/purple-cheetah-mod-socket';
import { Job, JobPipe, JobStatus } from './job';
import type { Project, ProjectVar } from './project';
import { Repo } from './repo';
import { createQueue, IDUtil, System } from './util';

class Bngine {
  private fs = useFS({
    base: BCMSConfig.local
      ? path.join(process.cwd(), 'storage', 'bngine')
      : '/bcms-share/bngine',
  });
  private logger = useLogger({ name: 'Bngine' });
  private queue = createQueue({ name: 'Bngine' });

  private async runPipe(
    job: Job,
    _project: Project,
    pipe: JobPipe
  ): Promise<void> {
    const socketManager = useSocket();
    socketManager.emitToScope({
      scope: 'global',
      eventName: 'JOB_PIPE_CREATE',
      eventData: {
        j: job._id,
        p: pipe,
      },
    });
    const exo = {
      stdout: '',
      stderr: '',
    };
    try {
      await System.exec(pipe.cmd, (_type, chunk) => {
        exo.stdout += chunk;
        socketManager.emitToScope({
          scope: 'global',
          eventName: 'JOB_PIPE_UPDATE',
          eventData: {
            j: job._id,
            stdout: chunk,
            stderr: '',
            pid: pipe.id,
          },
        });
      });
      pipe.status = JobStatus.SUCCESS;
    } catch (error) {
      pipe.status = JobStatus.FAIL;
    }
    await this.fs.save(pipe.stdout.split('/'), exo.stdout);
    await this.fs.save(pipe.stderr.split('/'), exo.stderr);
    pipe.timeToExec = Date.now() - pipe.createdAt;
    job.pipe.push(pipe);
    socketManager.emitToScope({
      scope: 'global',
      eventName: 'JOB_PIPE_COMPLETE',
      eventData: {
        j: job._id,
        p: pipe,
      },
    });
  }

  private async initRepo(job: Job, project: Project, logsBasePath: string[]) {
    // Checkout to branch
    {
      const pipe: JobPipe = {
        id: IDUtil.create(),
        title: `Checkout to ${project.repo.branch}`,
        cmd: `cd ${path.join(
          process.cwd(),
          'bngine-workspace',
          project._id,
          'git'
        )} && \
        git checkout ${project.repo.branch}`,
        stderr: '',
        stdout: '',
        createdAt: Date.now(),
        ignoreIfFail: true,
        status: JobStatus.RUNNING,
        timeToExec: -1,
      };
      pipe.stdout = `${logsBasePath.join('/')}/${pipe.id}_out`;
      pipe.stderr = `${logsBasePath.join('/')}/${pipe.id}_err`;
      await this.runPipe(job, project, pipe);
      if (pipe.status === JobStatus.FAIL && pipe.ignoreIfFail === false) {
        job.status = JobStatus.FAIL;
        return false;
      }
    }
    // Pull branch changes
    {
      const pipe: JobPipe = {
        id: IDUtil.create(),
        title: `Pull changes`,
        cmd: `cd ${path.join(
          process.cwd(),
          'bngine-workspace',
          project._id,
          'git'
        )} && \
        git pull`,
        createdAt: Date.now(),
        stderr: '',
        stdout: '',
        ignoreIfFail: false,
        status: JobStatus.RUNNING,
        timeToExec: -1,
      };
      pipe.stdout = `${logsBasePath.join('/')}/${pipe.id}_out`;
      pipe.stderr = `${logsBasePath.join('/')}/${pipe.id}_err`;
      await this.runPipe(job, project, pipe);
      if (pipe.status === JobStatus.FAIL && pipe.ignoreIfFail === false) {
        job.status = JobStatus.FAIL;
        return false;
      }
    }
    return true;
  }

  public start(job: Job, _project: Project, vars?: ProjectVar[]): void {
    const project: Project = JSON.parse(JSON.stringify(_project));
    project.vars.push({
      key: 'cwd',
      value: process.cwd(),
    });

    // Add custom variable to project
    if (vars) {
      for (let i = 0; i < vars.length; i++) {
        let found = false;
        const variable = vars[i];
        const projectVarIndex = project.vars.findIndex(
          (e) => e.key === variable.key
        );
        if (projectVarIndex !== -1) {
          found = true;
          project.vars[projectVarIndex].value = variable.value;
        }
        if (!found) {
          project.vars.push(variable);
        }
      }
    }
    this.queue({
      name: `${project.name}_${job._id}`,
      handler: async () => {
        const socketManager = useSocket();
        const date = new Date();
        const dateString = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
        const logsBasePath = ['logs', `${dateString}`];
        if (!(await this.fs.exist(logsBasePath))) {
          await this.fs.mkdir(logsBasePath);
        }
        job.inQueueFor = Date.now() - job.createdAt;
        job.status = JobStatus.RUNNING;
        let internalJob = await Repo.job.update(job);
        socketManager.emitToScope({
          scope: 'global',
          eventName: 'JOB',
          eventData: {
            j: job._id,
          },
        });
        try {
          if (await this.initRepo(job, project, logsBasePath)) {
            const workspace = path.join(
              process.cwd(),
              'bngine-workspace',
              project._id,
              'git'
            );
            for (let i = 0; i < project.run.length; i++) {
              const run = project.run[i];
              // Inject project variables into command
              for (let j = 0; j < project.vars.length; j++) {
                const variable = project.vars[j];
                const key = '${' + variable.key + '}';
                let loop = true;
                while (loop) {
                  if (run.command.indexOf(key) === -1) {
                    loop = false;
                  } else {
                    run.command = run.command.replace(key, variable.value);
                  }
                }
              }
              const pipe: JobPipe = {
                id: IDUtil.create(),
                title: run.title ? run.title : `Job pipe ${i + 1}`,
                cmd: `cd ${workspace} && ` + run.command,
                createdAt: Date.now(),
                stderr: '',
                stdout: '',
                ignoreIfFail: run.ignoreIfFail ? true : false,
                status: JobStatus.RUNNING,
                timeToExec: -1,
              };
              pipe.stderr = `${logsBasePath.join('/')}/${pipe.id}_err.log`;
              pipe.stdout = `${logsBasePath.join('/')}/${pipe.id}_out.log`;
              await this.runPipe(internalJob, project, pipe);

              if (
                pipe.status === JobStatus.FAIL &&
                pipe.ignoreIfFail === false
              ) {
                internalJob.status = JobStatus.FAIL;
                break;
              }
            }
          }
        } catch (error) {
          internalJob.status = JobStatus.FAIL;
          internalJob.finishedAt = Date.now();
        }
        internalJob.finishedAt = Date.now();
        internalJob.running = false;
        if (internalJob.status !== JobStatus.FAIL) {
          internalJob.status = JobStatus.SUCCESS;
        }
        internalJob = await Repo.job.update(internalJob);
        socketManager.emitToScope({
          scope: 'global',
          eventName: 'JOB',
          eventData: {
            j: job._id,
          },
        });
      },
    }).wait.catch((err) => {
      this.logger.error(project._id, { project, job, vars, err });
    });
  }
}

export const bngine = new Bngine();
