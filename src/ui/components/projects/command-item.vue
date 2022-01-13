<script lang="tsx">
import {
  BCMSIcon,
  BCMSTextInput,
  BCMSToggleInput,
} from '@becomes/cms-ui/components';
import { defineComponent, PropType } from '@vue/runtime-core';
import { ProjectRunCmd } from 'src/backend/types';

const component = defineComponent({
  props: {
    command: {
      type: Object as PropType<ProjectRunCmd>,
      required: true,
    },
    first: {
      type: Boolean,
      required: false,
      default: false,
    },
    last: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    return () => (
      <div class="pb-7.5 border-b border-grey border-opacity-50">
        <div class="flex flex-col gap-4 sm:flex-row">
          <BCMSTextInput
            label="Title"
            value={props.command.title}
            placeholder="Title"
            class="w-full"
          />
          <div class="flex">
            <BCMSToggleInput
              label="Ignore if fail"
              value={props.command.ignoreIfFail}
              class="mr-5 ml-2.5 min-w-[100px] w-max"
            />
            <div class="flex items-start">
              {!props.first && (
                <button class="group flex mr-3.5">
                  <BCMSIcon
                    src="/arrow/up"
                    class="w-6 h-6 text-dark opacity-50 fill-current transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </button>
              )}
              {!props.last && (
                <button class="group flex mr-3.5">
                  <BCMSIcon
                    src="/arrow/down"
                    class="w-6 h-6 text-dark opacity-50 fill-current transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </button>
              )}
              <button class="group flex">
                <BCMSIcon
                  src="/trash"
                  class="w-6 h-6 text-dark opacity-50 fill-current transition-all duration-300 group-hover:opacity-100 group-hover:text-red group-focus-visible:opacity-100 group-focus-visible:text-red"
                />
              </button>
            </div>
          </div>
        </div>
        <BCMSTextInput
          label="Command"
          value={props.command.command}
          placeholder="Command"
          class="mt-5"
        />
      </div>
    );
  },
});

export default component;
</script>
