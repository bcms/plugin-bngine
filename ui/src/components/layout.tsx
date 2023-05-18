import { BCMSJwtRoleName } from '@becomes/cms-sdk/types';
import { BCMSManagerNav, BCMSSpinner } from '@becomes/cms-ui/components';
import { api } from '@ui/api';
import type { BCMSAddProjectModalOutputData } from '@ui/types';
import { defineComponent, onMounted, ref, Teleport } from 'vue';
import { useRoute } from 'vue-router';

export const Layout = defineComponent({
  setup(_props, ctx) {
    const route = useRoute();
    const showSpinner = ref(false);
    const showProjects = ref(false);

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

    onMounted(async () => {
      showSpinner.value = true;
      await window.bcms.util.throwable(
        async () => {
          return await window.bcms.sdk.user.get();
        },
        async (result) => {
          if (result.roles[0].name === BCMSJwtRoleName.ADMIN) {
            showProjects.value = true;
          } else {
            const policy = result.customPool.policy.plugins?.find(
              (e) => e.name === window.pluginName
            );
            console.log(policy);
            if (policy && policy.fullAccess) {
              showProjects.value = true;
            }
          }
        }
      );
      showSpinner.value = false;
    });

    return () => (
      <div id={route.hash}>
        <Teleport to="#plugin_nav">
          <BCMSManagerNav
            class="bngineNav"
            style="left: 0 !important;"
            label="Build engine"
            actionText={route.path === '/projects' ? 'Add new project' : ''}
            items={
              showProjects.value
                ? [
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
                  ]
                : [
                    {
                      name: 'Builds',
                      link: '/',
                      selected: route.path === '/',
                    },
                  ]
            }
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
