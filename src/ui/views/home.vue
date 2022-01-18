<script lang="tsx">
import { BCMSButton, BCMSEmptyView } from '@becomes/cms-ui/components';
import { computed, defineComponent, onMounted } from '@vue/runtime-core';
import { JobStatus } from '../../backend/types';
import { useApi } from '../api';
import { BCMSJobsList, BCMSRunningJob } from '../components';
import { useStore } from '../store';

const component = defineComponent({
  setup() {
    const api = useApi();
    const store = useStore();

    const jobs = computed(() => {
      return store.getters.job_items;
    });
    const projects = computed(() => store.getters.project_items);

    const runningJob = computed(() => {
      return store.getters.job_findOne(
        (e) => e.status === JobStatus.RUNNING || e.status === JobStatus.QUEUE
      );
    });

    async function buildProduction() {
      await api.job.start({
        projectId: projects.value[0]._id,
      });
    }

    onMounted(async () => {
      if (jobs.value.length === 0) {
        await window.bcms.util.throwable(async () => {
          await api.job.getAll();
        });
      }
      if (projects.value.length === 0) {
        await window.bcms.util.throwable(async () => {
          await api.project.getAll();
        });
      }
    });

    return () => (
      <div>
        <header class="flex items-center justify-between mb-15">
          {projects.value[0] ? (
            <BCMSButton onClick={buildProduction}>
              {projects.value[0].name}
            </BCMSButton>
          ) : (
            ''
          )}
          {projects.value.length > 1 ? (
            <BCMSButton kind="secondary">Other</BCMSButton>
          ) : (
            ''
          )}
        </header>
        {runningJob.value ? <BCMSRunningJob job={runningJob.value} /> : 'HERE'}
        <div>
          {jobs.value.length === 0 ? (
            <BCMSEmptyView message="There are no active or logged jobs." />
          ) : (
            <>
              <h1 class="text-3xl leading-tight mb-7.5">Completed Jobs</h1>
              <BCMSJobsList jobs={jobs.value} />
            </>
          )}
        </div>
      </div>
    );
  },
});
export default component;
</script>
