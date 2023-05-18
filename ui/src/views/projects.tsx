import { api } from '@ui/api';
import { ProjectItem } from '@ui/components';
import { store } from '@ui/store';
import { computed, defineComponent, onMounted } from 'vue';

const component = defineComponent({
  setup() {
    const projects = computed(() => {
      return store.project.items();
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
            <ProjectItem project={project} />
          ))}
        </div>
      </>
    );
  },
});

export default component;
