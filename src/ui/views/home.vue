<script lang="tsx">
import { BCMSTemplate, BCMSStoreMutationTypes } from '@becomes/cms-sdk/types';
import { BCMSButton } from '@becomes/cms-ui/components';
import { computed, defineComponent, onUnmounted, ref } from '@vue/runtime-core';
import { useStore } from '../store';
import { StoreMutationTypes } from '../types';

const component = defineComponent({
  setup() {
    const templates = ref<BCMSTemplate[]>(
      Object.assign([], window.bcms.sdk.store.getters.template_items)
    );
    const bcmsStoreUnsub = window.bcms.sdk.store.subscribe(
      (mutation, state) => {
        if (mutation.type === BCMSStoreMutationTypes.template_set) {
          templates.value = Object.assign({}, state.template);
        }
      }
    );

    onUnmounted(() => {
      bcmsStoreUnsub();
    });

    return () => (
      <>
        <pre>{JSON.stringify(templates.value, null, '  ')}</pre>
      </>
    );
  },
});
export default component;
</script>
