import { BCMSConfig } from '@becomes/cms-backend/config';
import { useFS, useLogger } from '@becomes/purple-cheetah';
import { useSocket } from '@becomes/purple-cheetah-mod-socket';
import type { Socket } from '@becomes/purple-cheetah-mod-socket/types';
import type { FS, Logger } from '@becomes/purple-cheetah/types';
import * as path from 'path';
import { Repo } from './repo';
import { Bngine, Job, JobPipe, JobStatus, Project } from './types';
import { createQueue, IDUtil, System } from './util';

let bngine: Bngine = null as never;
let socketManager: Socket;
let logger: Logger;
let fs: FS;

export function useBngine(): Bngine {
  return bngine;
}

export async function createBngine(): Promise<Bngine> {
  async function runPipe(
    job: Job,
    _project: Project,
    pipe: JobPipe
  ): Promise<void> {
    // TODO: Inform clients that new pipe was created
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
        // exo[type] += chunk;
        // if (type === 'stderr') {
        //   exo.stdout += chunk;
        // }
        // TODO: Trigger pipe socket event update
        // TODO: Improve implementation
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
    await fs.save(pipe.stdout.split('/'), exo.stdout);
    await fs.save(pipe.stderr.split('/'), exo.stderr);
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
  async function initRepo(job: Job, project: Project, logsBasePath: string[]) {
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
      await runPipe(job, project, pipe);
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
      await runPipe(job, project, pipe);
      if (pipe.status === JobStatus.FAIL && pipe.ignoreIfFail === false) {
        job.status = JobStatus.FAIL;
        return false;
      }
    }
    return true;
  }
  if (!bngine) {
    const queue = createQueue({ name: 'Bngine' });
    fs = useFS({
      base: BCMSConfig.local
        ? path.join(process.cwd(), 'storage', 'bngine')
        : '/bcms-share/bngine',
    });
    logger = useLogger({ name: 'Bngine' });
    socketManager = useSocket();

    bngine = {
      start(job, _project, vars) {
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
        queue({
          name: `${project.name}_${job._id}`,
          async handler() {
            const date = new Date();
            const dateString = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
            const logsBasePath = ['logs', `${dateString}`];
            if (!(await fs.exist(logsBasePath))) {
              await fs.mkdir(logsBasePath);
            }
            job.inQueueFor = Date.now() - job.createdAt;
            job.status = JobStatus.RUNNING;
            let internalJob = await Repo.job.update(job);
            // TODO: IMPROVE THIS!
            socketManager.emitToScope({
              scope: 'global',
              eventName: 'JOB',
              eventData: {
                j: job._id,
              },
            });
            try {
              if (await initRepo(job, project, logsBasePath)) {
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
                  await runPipe(internalJob, project, pipe);

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
          logger.error(project._id, { project, job, vars, err });
        });
      },
    };
  }
  return bngine;
}
