<script lang="tsx">
import { defineComponent, onUnmounted } from 'vue';
import {
  JobSocketEventName,
  JobSocketEventNew,
  JobSocketEventPipeComplete,
  JobSocketEventPipeCreate,
  useApi,
} from './api';
import RouterView from './router/view.vue';
import { Layout } from './components';
import { useStore } from './store';
import { StoreMutationTypes } from './types';
import Home from './views/home.vue';
import Projects from './views/projects.vue';
import { useRoute } from 'vue-router';

const component = defineComponent({
  setup() {
    const api = useApi();
    const store = useStore();
    const route = useRoute();
    const routes = [
      {
        name: 'Builds',
        path: '',
        component: Home,
      },
      {
        name: 'Projects',
        path: '#projects',
        component: Projects,
      },
    ];

    const jobEventUnsub = window.bcms.sdk.socket.subscribe(
      JobSocketEventName.JOB,
      async (event) => {
        const data = event as JobSocketEventNew;
        await window.bcms.util.throwable(async () => {
          await api.job.get({ id: data.j, skipCache: true });
        });
      }
    );
    const newPipeEventUnsub = window.bcms.sdk.socket.subscribe(
      JobSocketEventName.JOB_PIPE_CREATE,
      async (event) => {
        const data = event as JobSocketEventPipeCreate;
        await window.bcms.util.throwable(
          async () => {
            return await api.job.get({ id: data.j });
          },
          async (result) => {
            if (result) {
              result.pipe.push(data.p);
              store.commit(StoreMutationTypes.job_set, result);
            }
          }
        );
      }
    );
    const completePipeEventUnsub = window.bcms.sdk.socket.subscribe(
      JobSocketEventName.JOB_PIPE_COMPLETE,
      async (event) => {
        const data = event as JobSocketEventPipeComplete;
        await window.bcms.util.throwable(
          async () => {
            return await api.job.get({ id: data.j });
          },
          async (result) => {
            if (result) {
              const pipeIndex = result.pipe.findIndex(
                (e) => e.id === data.p.id
              );
              if (pipeIndex !== -1) {
                const pipe = result.pipe[pipeIndex];
                pipe.timeToExec = data.p.timeToExec;
                pipe.status = data.p.status;
                store.commit(StoreMutationTypes.job_set, result);
              }
            }
          }
        );
      }
    );

    onUnmounted(() => {
      jobEventUnsub();
      newPipeEventUnsub();
      completePipeEventUnsub();
    });

    return () => (
      <>
        <Layout sideNavItems={routes}>
          <RouterView route={route} routes={routes} />
        </Layout>
        {/*<BCMSAddProjectModal />
        <BCMSJobDetailsModal />
        <BCMSOtherProjectsModal />*/}
        <div id="plugin_nav" />
      </>
    );
  },
});
export default component;
</script>
