<script lang="tsx">
import {
  BCMSIcon,
  BCMSTextInput,
  BCMSToggleInput,
} from '@becomes/cms-ui/components';
import { defineComponent, PropType } from 'vue';
import type { ProjectRunCmd } from '../../../backend/types';

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
  emits: {
    remove: () => {
      return true;
    },
    'update:title': (_: string) => {
      return true;
    },
    'update:command': (_: string) => {
      return true;
    },
    'update:ignoreIfFail': (_: boolean) => {
      return true;
    },
    moveUp: () => {
      return true;
    },
    moveDown: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <div class="pb-7.5 border-b border-grey border-opacity-50">
        <div class="flex flex-col gap-4 sm:flex-row">
          <BCMSTextInput
            label="Title"
            value={props.command.title}
            placeholder="Title"
            onInput={(event) => {
              ctx.emit('update:title', event);
            }}
            class="w-full"
          />
          <div class="flex">
            <BCMSToggleInput
              key={+(props.command.ignoreIfFail as boolean)}
              label="Ignore if fail"
              v-model={props.command.ignoreIfFail}
              onInput={(event) => {
                ctx.emit('update:ignoreIfFail', event);
              }}
              class="mr-5 ml-2.5 min-w-[100px] w-max"
            />
            <div class="flex items-start">
              {!props.first && (
                <button
                  class="group flex mr-3.5"
                  onClick={() => ctx.emit('moveUp')}
                >
                  <BCMSIcon
                    src="/arrow/up"
                    class="w-6 h-6 text-dark opacity-50 fill-current transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </button>
              )}
              {!props.last && (
                <button
                  class="group flex mr-3.5"
                  onClick={() => ctx.emit('moveDown')}
                >
                  <BCMSIcon
                    src="/arrow/down"
                    class="w-6 h-6 text-dark opacity-50 fill-current transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </button>
              )}
              <button class="group flex" onClick={() => ctx.emit('remove')}>
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
          onInput={(event) => {
            ctx.emit('update:command', event);
          }}
          class="mt-5"
        />
      </div>
    );
  },
});

export default component;
</script>
