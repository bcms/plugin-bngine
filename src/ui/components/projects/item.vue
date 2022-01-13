<script lang="tsx">
import { BCMSButton, BCMSTextInput } from '@becomes/cms-ui/components';
import { defineComponent, PropType, ref } from '@vue/runtime-core';
import { Project } from 'src/backend/types';
import { BCMSCommandItem, BCMSVariableItem } from '.';
import BCMSProjectSectionWrapper from './section-wrapper.vue';

const component = defineComponent({
  props: {
    project: {
      type: Object as PropType<Project>,
      required: true,
    },
  },
  setup(props) {
    const expanded = ref(false);

    return () => (
      <div
        class={`flex flex-col border rounded-2.5 transition-colors duration-300 hover:border-green focus-within:border-green ${
          expanded.value ? 'border-green' : 'border-grey'
        }`}
      >
        <div class="flex flex-col">
          <button
            class="flex items-center justify-between w-full px-5 py-4 transition-colors duration-300 focus:outline-none"
            onClick={() => {
              expanded.value = !expanded.value;
            }}
          >
            <span class="text-xl capitalize">{props.project.name}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 8"
              class={`fill-current w-3.5 h-3.5 ${
                expanded.value
                  ? 'rotate-180 text-opacity-100'
                  : 'text-dark text-opacity-50'
              } transition-all duration-300`}
            >
              <path
                fill-rule="evenodd"
                d="M.293.293a1 1 0 011.414 0L7 5.586 12.293.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
          {expanded.value && (
            <div class="px-5 pb-5">
              <BCMSProjectSectionWrapper title="General">
                <div class="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <BCMSTextInput
                    label="Name"
                    value={props.project.name}
                    placeholder="Name"
                  />
                  <BCMSTextInput
                    label="URL"
                    value={props.project.repo.url}
                    placeholder="URL"
                  />
                </div>
                <div class="grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <BCMSTextInput
                    label="Repository Name"
                    value={props.project.repo.name}
                    placeholder="Repository Name"
                  />
                  <BCMSTextInput
                    label="Repository Branch"
                    value={props.project.repo.branch}
                    placeholder="Repository Branch"
                  />
                </div>
                <div class="grid grid-cols-1">
                  <BCMSTextInput
                    label="SSH Key"
                    value={props.project.repo.sshKey}
                    placeholder="SSH Key"
                  />
                </div>
              </BCMSProjectSectionWrapper>
              <BCMSProjectSectionWrapper title="Variables">
                {props.project.vars.map((variable, index) => (
                  <BCMSVariableItem
                    variable={variable}
                    first={index === 0}
                    last={index === props.project.vars.length - 1}
                  />
                ))}
                <BCMSButton
                  kind="ghost"
                  class="max-w-max mx-auto hover:shadow-none focus:shadow-none"
                >
                  Add {props.project.vars.length === 0 ? 'first' : 'new'}{' '}
                  variable
                </BCMSButton>
              </BCMSProjectSectionWrapper>
              <BCMSProjectSectionWrapper title="Commands">
                {props.project.run.map((command, index) => (
                  <BCMSCommandItem
                    command={command}
                    first={index === 0}
                    last={index === props.project.run.length - 1}
                  />
                ))}
                <BCMSButton
                  kind="ghost"
                  class="max-w-max mx-auto hover:shadow-none focus:shadow-none"
                >
                  Add {props.project.run.length === 0 ? 'first' : 'new'} command
                </BCMSButton>
              </BCMSProjectSectionWrapper>
              <div class="flex justify-end">
                <BCMSButton class="mt-8 ">Update project</BCMSButton>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
});

export default component;
</script>
