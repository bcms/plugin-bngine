import { defineComponent, onUnmounted } from 'vue';
import {
  JobSocketEventName,
  JobSocketEventNew,
  JobSocketEventPipeComplete,
  JobSocketEventPipeCreate,
  api,
} from './api';
import { RouterView } from 'vue-router';
import { store } from './store';
import { BCMSPluginLayout } from './bcms-ui/components';
import {
  JobDetailsModal,
  Layout,
  OtherProjectsModal,
  ProjectAddModal,
} from './components';

export const App = defineComponent({
  setup() {
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
              store.job.set(result);
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
                store.job.set(result);
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
        <div id="plugin_nav" />
        <BCMSPluginLayout>
          <Layout>
            <RouterView />
          </Layout>
          <ProjectAddModal />
          <JobDetailsModal />
          <OtherProjectsModal />
        </BCMSPluginLayout>
      </>
    );
  },
});
