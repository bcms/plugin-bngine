import {
  BCMSButton,
  BCMSCodeEditor,
  BCMSTextInput,
} from '@becomes/cms-ui/components';
import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
import { useApi } from '../../api';
import { BCMSCommandItem, BCMSVariableItem } from '.';
import BCMSProjectSectionWrapper from './section-wrapper';
import type {
  Project,
  ProjectRunCmd,
  ProjectVar,
} from '../../../backend/types';

const component = defineComponent({
  props: {
    project: {
      type: Object as PropType<Project>,
      required: true,
    },
  },
  setup(props) {
    const api = useApi();
    const expanded = ref(false);
    const showJSON = ref(false);

    const projectData = ref({
      name: {
        value: '',
        error: '',
      },
      repo: {
        url: {
          value: '',
          error: '',
        },
        name: {
          value: '',
          error: '',
        },
        branch: {
          value: '',
          error: '',
        },
        sshKey: {
          value: '',
          error: '',
        },
      },
      variables: [] as ProjectVar[],
      commands: [] as ProjectRunCmd[],
    });

    const projectDataJSON = computed(() => {
      const JSONStructure = {
        general: {
          projectName: projectData.value.name.value,
          repo: {
            url: projectData.value.repo.url.value,
            name: projectData.value.repo.name.value,
            branch: projectData.value.repo.branch.value,
            sshKey: projectData.value.repo.sshKey.value,
          },
        },
        variables: projectData.value.variables,
        commands: projectData.value.commands,
      };
      return JSON.stringify(JSONStructure, null, 4);
    });

    function addNewVariable() {
      projectData.value.variables.push({
        key: '',
        value: '',
      });
    }

    function addNewCommand() {
      projectData.value.commands.push({
        command: '',
        title: '',
        ignoreIfFail: false,
      });
    }

    async function removeVariable(variableIndex: number) {
      if (
        await window.bcms.confirm(
          'Remove variable',
          'Are you sure you want to remove this variable?'
        )
      ) {
        projectData.value.variables.splice(variableIndex, 1);
      }
    }

    async function removeCommand(commandIndex: number) {
      if (
        await window.bcms.confirm(
          'Remove command',
          'Are you sure you want to remove this command?'
        )
      ) {
        projectData.value.commands.splice(commandIndex, 1);
      }
    }

    function moveCommandUp(index: number) {
      const command = projectData.value.commands[index];

      projectData.value.commands.splice(index, 1);
      projectData.value.commands.splice(index - 1, 0, command);
    }

    function moveCommandDown(index: number) {
      const command = projectData.value.commands[index];

      projectData.value.commands.splice(index, 1);
      projectData.value.commands.splice(index + 1, 0, command);
    }

    function updateProject() {
      window.bcms.util.throwable(
        async () => {
          return await api.project.update({
            id: props.project._id,
            name: projectData.value.name.value,
            repo: {
              url: projectData.value.repo.url.value,
              name: projectData.value.repo.name.value,
              branch: projectData.value.repo.branch.value,
              sshKey: projectData.value.repo.sshKey.value,
            },
            vars: projectData.value.variables,
            run: projectData.value.commands,
          });
        },
        async () => {
          window.bcms.notification.success('Project successfully updated.');
        }
      );
    }

    async function removeProject() {
      if (
        await window.bcms.confirm(
          'Remove project',
          'Are you sure you want to remove this project?'
        )
      ) {
        window.bcms.util.throwable(
          async () => {
            return await api.project.delete(props.project._id);
          },
          async () => {
            expanded.value = false;
            window.bcms.notification.success('Project successfully removed.');
          }
        );
      }
    }

    onMounted(async () => {
      const propProject = props.project;

      projectData.value.name.value = propProject.name;
      projectData.value.repo.url.value = propProject.repo.url;
      projectData.value.repo.name.value = propProject.repo.name;
      projectData.value.repo.branch.value = propProject.repo.branch;
      projectData.value.repo.sshKey.value = propProject.repo.sshKey;
      projectData.value.variables = propProject.vars;
      projectData.value.commands = propProject.run;
    });

    return () => (
      <div
        class={`flex flex-col border rounded-2.5 transition-colors duration-300 hover:border-green focus-within:border-green ${
          expanded.value ? 'border-green dark:border-yellow' : 'border-grey'
        } dark:hover:border-yellow dark:focus-within:border-yellow`}
      >
        <div class="flex flex-col">
          <button
            class="flex items-center justify-between w-full px-5 py-4 transition-colors duration-300 focus:outline-none"
            onClick={() => {
              expanded.value = !expanded.value;
            }}
          >
            <span class="text-xl capitalize dark:text-light">
              {props.project.name}
            </span>
            <div class="flex items-center gap-4">
              <BCMSButton
                kind="secondary"
                class="text-sm"
                onClick={(event) => {
                  if (expanded.value) {
                    event.stopPropagation();
                  }
                  showJSON.value = !showJSON.value;
                }}
              >
                {showJSON.value ? 'HTML' : 'JSON'}
              </BCMSButton>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 8"
                class={`fill-current w-3.5 h-3.5 ${
                  expanded.value
                    ? 'rotate-180 text-opacity-100 dark:text-light'
                    : 'text-dark text-opacity-50 dark:text-light dark:text-opacity-50'
                } transition-all duration-300`}
              >
                <path
                  fill-rule="evenodd"
                  d="M.293.293a1 1 0 011.414 0L7 5.586 12.293.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </button>
          {expanded.value && (
            <div class="px-5 pb-5">
              {showJSON.value ? (
                <BCMSCodeEditor code={projectDataJSON.value} />
              ) : (
                <>
                  <BCMSProjectSectionWrapper title="General">
                    <div class="grid grid-cols-1 gap-7 sm:grid-cols-2">
                      <BCMSTextInput
                        label="Name"
                        placeholder="Name"
                        invalidText={projectData.value.name.error}
                        v-model={projectData.value.name.value}
                      />
                      <BCMSTextInput
                        label="URL"
                        placeholder="URL"
                        invalidText={projectData.value.repo.url.error}
                        v-model={projectData.value.repo.url.value}
                      />
                    </div>
                    <div class="grid grid-cols-1 gap-7 sm:grid-cols-2">
                      <BCMSTextInput
                        label="Repository Name"
                        placeholder="Repository Name"
                        invalidText={projectData.value.repo.name.error}
                        v-model={projectData.value.repo.name.value}
                      />
                      <BCMSTextInput
                        label="Repository Branch"
                        placeholder="Repository Branch"
                        invalidText={projectData.value.repo.branch.error}
                        v-model={projectData.value.repo.branch.value}
                      />
                    </div>
                    <div class="grid grid-cols-1">
                      <BCMSTextInput
                        label="SSH Key"
                        placeholder="SSH Key"
                        invalidText={projectData.value.repo.sshKey.error}
                        v-model={projectData.value.repo.sshKey.value}
                      />
                    </div>
                  </BCMSProjectSectionWrapper>
                  <BCMSProjectSectionWrapper title="Variables">
                    {projectData.value.variables.map((variable, index) => (
                      <BCMSVariableItem
                        key={index}
                        variable={variable}
                        first={index === 0}
                        last={index === projectData.value.variables.length - 1}
                        v-model:key={projectData.value.variables[index].key}
                        v-model:value={projectData.value.variables[index].value}
                        onRemove={() => {
                          removeVariable(index);
                        }}
                      />
                    ))}
                    <BCMSButton
                      kind="ghost"
                      class="max-w-max mx-auto hover:shadow-none focus:shadow-none"
                      onClick={addNewVariable}
                    >
                      Add{' '}
                      {projectData.value.variables.length === 0
                        ? 'first'
                        : 'new'}{' '}
                      variable
                    </BCMSButton>
                  </BCMSProjectSectionWrapper>
                  <BCMSProjectSectionWrapper title="Commands">
                    {projectData.value.commands.map((command, index) => (
                      <BCMSCommandItem
                        key={index}
                        command={command}
                        first={index === 0}
                        last={index === projectData.value.commands.length - 1}
                        v-model:title={projectData.value.commands[index].title}
                        v-model:command={
                          projectData.value.commands[index].command
                        }
                        v-model:ignoreIfFail={
                          projectData.value.commands[index].ignoreIfFail
                        }
                        onRemove={() => {
                          removeCommand(index);
                        }}
                        onMoveUp={() => {
                          moveCommandUp(index);
                        }}
                        onMoveDown={() => {
                          moveCommandDown(index);
                        }}
                      />
                    ))}
                    <BCMSButton
                      kind="ghost"
                      class="max-w-max mx-auto hover:shadow-none focus:shadow-none"
                      onClick={addNewCommand}
                    >
                      Add{' '}
                      {projectData.value.commands.length === 0
                        ? 'first'
                        : 'new'}{' '}
                      command
                    </BCMSButton>
                  </BCMSProjectSectionWrapper>
                </>
              )}
              <div class="flex justify-end space-x-2">
                <BCMSButton kind="danger" class="mt-8 " onClick={removeProject}>
                  Remove
                </BCMSButton>
                <BCMSButton class="mt-8 " onClick={updateProject}>
                  Update
                </BCMSButton>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
});

export default component;
