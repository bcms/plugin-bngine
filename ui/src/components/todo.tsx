import type { Todo } from '@backend/todo';
import { BCMSIcon } from '@bcms-ui/components';
import { defineComponent, PropType } from 'vue';

export const TodoItems = defineComponent({
  props: {
    title: String,
  },
  setup(props, ctx) {
    return () => (
      <div>
        <div class="text-xl font-medium mb-4">{props.title}</div>
        <ul class="grid grid-cols-1 gap-4">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </ul>
      </div>
    );
  },
});

export const TodoItem = defineComponent({
  props: {
    item: {
      type: Object as PropType<Todo>,
      required: true,
    },
  },
  emits: {
    done() {
      return true;
    },
    edit() {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <li class="dark:bg-darkGrey bg-white border-grey border rounded-3.5 p-4">
        <div class="flex items-start">
          <button
            class={`flex-shrink-0 w-4 h-4 border-2 mt-1 mr-2 rounded-full p-0.5`}
            onClick={() => {
              ctx.emit('done');
            }}
          >
            <div
              class={`w-full h-full rounded-full ${
                props.item.done ? 'bg-green' : ''
              }`}
            />
          </button>
          <div class="mr-4">{props.item.description}</div>
          <button
            class="ml-auto mt-1"
            onClick={() => {
              ctx.emit('edit');
            }}
          >
            <BCMSIcon
              src="/edit"
              class="w-6 h-6 flex-shrink-0 text-white fill-current"
            />
          </button>
        </div>
      </li>
    );
  },
});
