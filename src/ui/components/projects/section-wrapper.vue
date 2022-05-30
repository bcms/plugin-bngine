<script lang="tsx">
import { defineComponent } from 'vue';

const component = defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    return () => (
      <div class="mt-5 flex flex-col">
        <div class="text-2xl font-normal text-grey mb-2.5">{props.title}</div>
        <div class="rounded-2.5 p-4 border border-grey border-opacity-50 flex flex-col gap-y-7 desktop:p-7">
          {ctx.slots.default ? ctx.slots.default() : null}
        </div>
      </div>
    );
  },
});

export default component;
</script>
