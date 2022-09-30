import { defineComponent, onUnmounted, ref } from 'vue';

const component = defineComponent({
  setup(_, ctx) {
    const theme = ref(window.bcms.sdk.storage.get('theme') || 'light');
    const storageUnsub = window.bcms.sdk.storage.subscribe<string>(
      'theme',
      (val) => {
        theme.value = val;
      }
    );

    onUnmounted(() => {
      storageUnsub();
    });

    return () => (
      <div id="test" class={theme.value}>
        {ctx.slots.default ? ctx.slots.default() : <></>}
      </div>
    );
  },
});

export default component;
