import { useFS } from '@becomes/purple-cheetah';
import * as path from 'path';
import { Repo } from './repo';
import { Bngine, Job, JobCross, JobPipe, JobStatus, Project } from './types';
import { createQueue, IDUtil, System } from './util';

export async function createBngine(): Promise<Bngine> {
  const date = new Date().toLocaleDateString('en-CA');
  const queue = createQueue({ name: 'Bngine' });
  async function logPipe(
    pipe_id: string,
    type: 'stdout' | 'stderr',
    chunk: string
  ): Promise<void> {
    const fs = useFS();

    if (!(await fs.exist(path.join(process.cwd(), `storage/bngine/${date}`)))) {
      await fs.mkdir(path.join(process.cwd(), `storage/bngine/${date}`));
    }
    if (type === 'stdout') {
      await fs.save(
        path.join(process.cwd(), `storage/bngine/${date}/${pipe_id}_out`),
        chunk
      );
    } else {
      await fs.save(
        path.join(process.cwd(), `storage/bngine/${date}/${pipe_id}_err`),
        chunk
      );
    }
  }

  async function runPipe(
    job: Job,
    _project: Project,
    pipe: JobPipe
  ): Promise<void> {
    // TODO: Inform clients that new pipe was created
    try {
      await System.exec(pipe.cmd, (type, chunk) => {
        logPipe(pipe.id, type, chunk);
        // TODO: Trigger pipe socket event update
      });
      pipe.status = JobStatus.SUCCESS;
    } catch (error) {
      pipe.status = JobStatus.FAIL;
    }
    pipe.timeToExec = Date.now() - pipe.createdAt;
    const pipeIndex = job.pipe.push(pipe) - 1;
    // TODO: Trigger socket for new completed pipe in job
  }
  async function initRepo(job: Job, project: Project) {
    // Checkout to branch
    {
      const pipe: JobPipe = {
        id: IDUtil.create(),
        title: `Checkout to ${project.repo.branch}`,
        cmd: `cd ${path.join(
          process.cwd(),
          'bngine-workspace',
          `${project._id}`,
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
      (pipe.stderr = `storage/bngine/${date}/${pipe.id}_err`),
        (pipe.stdout = `storage/bngine/${date}/${pipe.id}_out`),
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
          `${project._id}`,
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
      (pipe.stderr = `storage/bngine/${date}/${pipe.id}_err`),
        (pipe.stdout = `storage/bngine/${date}/${pipe.id}_out`),
        await runPipe(job, project, pipe);
      if (pipe.status === JobStatus.FAIL && pipe.ignoreIfFail === false) {
        job.status = JobStatus.FAIL;
        return false;
      }
    }
    return true;
  }

  return {
    start(job, project, vars) {
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
          job.inQueueFor = Date.now() - job.createdAt;
          job.status = JobStatus.RUNNING;
          let internalJob = await Repo.job.update(job as JobCross);
          // TODO: Trigger socket event
          try {
            if (await initRepo(job, project)) {
              const workspace = path.join(
                process.cwd(),
                'bngine-workspace',
                `${project._id}`,
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
                (pipe.stderr = `storage/bngine/${date}/${pipe.id}_err`),
                  (pipe.stdout = `storage/bngine/${date}/${pipe.id}_out`),
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
            internalJob = await Repo.job.update(job as JobCross);
            // TODO: Trigger socket event
          }
          internalJob.finishedAt = Date.now();
          internalJob.running = false;
          if (internalJob.status !== JobStatus.FAIL) {
            internalJob.status = JobStatus.SUCCESS;
          }
          internalJob = await Repo.job.update(internalJob as JobCross);
          // TODO: Trigger socket event for job completed
        },
      });
    },
  };
}
