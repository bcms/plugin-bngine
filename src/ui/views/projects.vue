<script lang="tsx">
import { BCMSButton } from '@becomes/cms-ui/components';
import { computed, defineComponent, onMounted } from '@vue/runtime-core';
import { useApi } from '../api';
import { BCMSProjectItem } from '../components';
import { useStore } from '../store';

const component = defineComponent({
  setup() {
    const api = useApi();
    const store = useStore();

    const projects = computed(() => {
      return store.getters.project_items;
    });

    onMounted(async () => {
      if (projects.value.length === 0) {
        await window.bcms.util.throwable(async () => {
          return await api.project.getAll();
        });
      }
    });

    return () => (
      <>
        <div class="grid grid-cols-1 gap-5 mb-5">
          {projects.value.map((project) => (
            <BCMSProjectItem project={project} />
          ))}
        </div>
        <BCMSButton>Add new</BCMSButton>
      </>
    );
  },
});

export default component;
</script>
