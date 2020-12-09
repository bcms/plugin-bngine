<script lang="ts">
  import {
    Button,
    GeneralService,
    NotificationService,
    PasswordInput,
    sdk,
    TextArea,
    TextInput,
    ToggleInput,
  } from '@becomes/cms-ui';
  import { TrashIcon } from '@becomes/cms-ui/src/components/icons';
  import type { ProjectModified } from '../types';

  export let projects: ProjectModified[] = [];

  let sshKey: string = '';
  async function updateProject(projectIndex: number) {
    const projectToUpdate: ProjectModified & {
      repo: {
        sshKey?: string;
      };
    } = JSON.parse(JSON.stringify(projects[projectIndex]));
    projectToUpdate.show = undefined;
    if (sshKey !== '') {
      projectToUpdate.repo.sshKey = sshKey;
    }
    const proj: ProjectModified = await GeneralService.errorWrapper(
      async () => {
        return await sdk.send({
          url: '/plugin/bngine/project',
          method: 'PUT',
          headers: {
            Authorization: '',
          },
          data: projectToUpdate,
        });
      },
      async (result: { project: ProjectModified }) => {
        return result.project;
      },
    );
    if (!proj) {
      return;
    }
    sshKey = '';
    projects = projects.map((e, i) => {
      if (projectIndex === i) {
        return { ...proj, show: true };
      }
      return e;
    });
    NotificationService.success('Project successfully updated.');
  }

  function addVar(projectIndex: number) {
    projects[projectIndex].vars = [
      ...projects[projectIndex].vars,
      {
        key: '',
        value: '',
      },
    ];
  }
  function addCommand(projectIndex: number) {
    projects[projectIndex].run = [
      ...projects[projectIndex].run,
      {
        command: '',
        ignoreIfFail: false,
        title: '',
      },
    ];
  }
  function removeCommand(projectIndex: number, commandIndex: number) {
    projects[projectIndex].run = projects[projectIndex].run.filter(
      (e, i) => i !== commandIndex,
    );
  }
  function removeVar(projectIndex: number, varIndex: number) {
    projects[projectIndex].vars = projects[projectIndex].vars.filter(
      (e, i) => i !== varIndex,
    );
  }
</script>

<div class="bngine--projects">
  {#if projects}
    {#each projects as project, projectIndex}
      <div class="bngine--project">
        <div class="bngine--project-toggle">
          <button
            on:click={() => {
              project.show = project.show === true ? false : true;
            }}>
            <span class="bngine--project-toggle-title">{project.name} </span>
            <p class="fas fa-{project.show ? 'minus' : 'plus'}" />
          </button>
        </div>
        {#if project.show}
          <div class="bngine--project-section">
            <h4>General</h4>
            <div class="vars">
              <div class="var">
                <TextInput
                  class="name mr-10"
                  label="Name"
                  placeholder="Name"
                  value={project.name}
                  on:input={(event) => {
                    project.name = event.detail;
                  }} />
                <TextInput
                  class="url ml-10"
                  label="URL"
                  placeholder="URL"
                  value={project.repo.url}
                  on:input={(event) => {
                    project.repo.url = event.detail;
                  }} />
              </div>
              <div class="var">
                <TextInput
                  class="repo mr-10"
                  label="Repository name"
                  placeholder="Repository name"
                  value={project.repo.name}
                  on:input={(event) => {
                    project.repo.name = event.detail;
                  }} />
                <TextInput
                  class="branch ml-10"
                  label="Repository branch"
                  placeholder="Repository branch"
                  value={project.repo.branch}
                  on:input={(event) => {
                    project.repo.branch = event.detail;
                  }} />
              </div>
              <TextArea
                label="SSH key"
                placeholder="SSH key"
                on:input={(event) => {
                  sshKey = event.detail;
                }} />
            </div>
          </div>
          <div class="bngine--project-section">
            <h4>Variables</h4>
            <div class="vars">
              {#each project.vars as v, varIndex}
                <div class="var">
                  <TextInput
                    placeholder="Key"
                    value={v.key}
                    on:input={(event) => {
                      v.key = event.detail;
                    }} />
                  <span style="margin: auto 10px; font-size: 24px;">=</span>
                  <PasswordInput
                    placeholder="Value"
                    value={v.value}
                    on:input={(event) => {
                      v.value = event.detail;
                    }} />
                  <button
                    class="remove fas fa-times"
                    on:click={() => {
                      removeVar(projectIndex, varIndex);
                    }} />
                </div>
              {/each}
              <Button
                kind="ghost"
                on:click={() => {
                  addVar(projectIndex);
                }}>
                Add variable
              </Button>
            </div>
          </div>
          <div class="bngine--project-section">
            <h4>Commands</h4>
            <div class="commands">
              {#each project.run as run, commandIndex}
                <div class="command">
                  <div class="top">
                    <TextInput
                      class="title"
                      label="Title"
                      placeholder="Title"
                      value={run.title}
                      on:input={(event) => {
                        run.title = event.detail;
                      }} />
                    <ToggleInput
                      class="ignore"
                      label="Ignore if fail"
                      value={run.ignoreIfFail}
                      on:input={(event) => {
                        run.ignoreIfFail = event.detail;
                      }} />
                    <button
                      class="remove"
                      on:click={() => {
                        removeCommand(projectIndex, commandIndex);
                      }}>
                      <TrashIcon />
                    </button>
                  </div>
                  <TextInput
                    class="mt-20"
                    label="Command"
                    placeholder="Command"
                    value={run.command}
                    on:input={(event) => {
                      run.command = event.detail;
                    }} />
                </div>
              {/each}
              <Button
                kind="ghost"
                on:click={() => {
                  addCommand(projectIndex);
                }}>
                Add command
              </Button>
            </div>
          </div>
          <Button
            class="bngine--project-update"
            on:click={() => {
              updateProject(projectIndex);
            }}>
            Update project
          </Button>
        {/if}
      </div>
    {/each}
  {/if}
</div>
