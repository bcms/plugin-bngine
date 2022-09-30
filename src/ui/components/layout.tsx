import { BCMSManagerNav, BCMSSpinner } from '@becomes/cms-ui/components';
import { defineComponent, ref, Teleport } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '../api';
import type { BCMSAddProjectModalOutputData } from '../types';

const component = defineComponent({
  setup(_props, ctx) {
    const api = useApi();
    const route = useRoute();
    const showSpinner = ref(false);

    async function addNewProject(data: BCMSAddProjectModalOutputData) {
      showSpinner.value = true;
      await window.bcms.util.throwable(
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
      showSpinner.value = false;
    }

    return () => (
      <div id={route.hash}>
        <Teleport to="#plugin_nav">
          <BCMSManagerNav
            class="bngineNav"
            style="left: 0 !important;"
            label="Build engine"
            actionText={route.path === '/projects' ? 'Add new project' : ''}
            items={[
              {
                name: 'Builds',
                link: '/',
                selected: route.path === '/',
              },
              {
                name: 'Projects',
                link: '/projects',
                selected: route.path === '/projects',
              },
            ]}
            onAction={() => {
              window.bcms.modal.custom.addProject.show({
                onDone: async (data) => {
                  await addNewProject(data);
                },
              });
            }}
          />
        </Teleport>
        <div class="desktop:relative desktop:pl-[200px] lg:pl-[260px] px-5 desktop:py-10">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
        <BCMSSpinner show={showSpinner.value} />
      </div>
    );
  },
});
export default component;
