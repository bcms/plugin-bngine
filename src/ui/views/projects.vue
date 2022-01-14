<script lang="tsx">
import { BCMSButton } from '@becomes/cms-ui/components';
import { computed, defineComponent, onMounted } from '@vue/runtime-core';
import { useApi } from '../api';
import { BCMSProjectItem } from '../components';
import { useStore } from '../store';
import { BCMSAddProjectModalOutputData } from '../types';

const component = defineComponent({
  setup() {
    const api = useApi();
    const store = useStore();

    const projects = computed(() => {
      return store.getters.project_items;
    });

    async function addNewProject(data: BCMSAddProjectModalOutputData) {
      window.bcms.util.throwable(
        async () => {
          await api.project.create({
            name: data.projectName,
            repo: data.repo,
            vars: [],
            run: [],
          });
        },
        async () => {
          window.bcms.notification.success('Successfully added new project');
        },
        async (err) => {
          window.bcms.notification.error((err as Error).message);
        }
      );
    }

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
        <BCMSButton
          onClick={() => {
            window.bcms.modal.custom.addProject.show({
              onDone: (data) => {
                addNewProject(data);
              },
            });
          }}
        >
          Add new project
        </BCMSButton>
      </>
    );
  },
});

export default component;
</script>
