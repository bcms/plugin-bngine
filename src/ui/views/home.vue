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

    const runningJob = computed(() => {
      return store.getters.job_findOne(
        (e) => e.status === JobStatus.RUNNING || e.status === JobStatus.QUEUE
      );
    });

    async function buildProduction() {
      await api.job.start({
        projectId: '61cc7f97e4dc3ea2c937c2aa',
      });
    }

    onMounted(async () => {
      if (jobs.value.length === 0) {
        await window.bcms.util.throwable(async () => {
          return await api.job.getAll();
        });
      }
    });

    return () => (
      <div>
        <header class="flex items-center justify-between mb-15">
          <BCMSButton onClick={buildProduction}>
            TODO: PRVI PROJECT - CONFIMR MODAL{' '}
          </BCMSButton>
          <BCMSButton kind="secondary">Other</BCMSButton>
        </header>
        {runningJob.value && <BCMSRunningJob job={runningJob.value} />}
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
