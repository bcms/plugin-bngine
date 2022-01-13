<script lang="tsx">
import {
  BCMSTextInput,
  BCMSPasswordInput,
  BCMSIcon,
} from '@becomes/cms-ui/components';
import { defineComponent, PropType } from '@vue/runtime-core';
import { ProjectVar } from 'src/backend/types';

const component = defineComponent({
  props: {
    variable: {
      type: Object as PropType<ProjectVar>,
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
      <div class="flex">
        <BCMSTextInput
          value={props.variable.key}
          label="Key"
          placeholder="Key"
          class="flex-1"
        />
        <span class="self-end mx-2.5 mb-1.5 text-2xl flex-shrink-0">=</span>
        <BCMSPasswordInput
          label="Value"
          value={props.variable.value}
          placeholder="Value"
          class="flex-1"
        />
        <button class="self-end flex mb-3 ml-2.5 flex-shrink-0">
          <BCMSIcon
            src="/trash"
            class="w-6 h-6 text-dark opacity-50 fill-current transition-all duration-300 group-hover:opacity-100 group-hover:text-red group-focus-visible:opacity-100 group-focus-visible:text-red"
          />
        </button>
      </div>
    );
  },
});

export default component;
</script>
