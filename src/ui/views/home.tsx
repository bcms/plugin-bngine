import { BCMSButton } from '@becomes/cms-ui/components';
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { JobStatus } from '../../backend/types';
import { useApi } from '../api';
import { BCMSJobsList, BCMSRunningJob } from '../components';
import { useStore } from '../store';

const component = defineComponent({
  setup() {
    const api = useApi();
    const store = useStore();
    const CHUNK_SIZE = 20;
    const jobCount = ref(0);
    let atChunk = 0;

    const jobs = computed(() => {
      return store.getters.job_items;
    });
    const projects = computed(() => store.getters.project_items);
    const firstProject = computed(() => projects.value[0]);
    const runningJob = computed(() => {
      const test = store.getters.job_findOne(
        (e) => e.status === JobStatus.RUNNING || e.status === JobStatus.QUEUE
      );
      return test;
    });

    async function buildFirstProject() {
      if (
        await window.bcms.confirm(
          `Start build`,
          `Are you sure you want to build ${firstProject.value.name}?`
        )
      ) {
        await window.bcms.util.throwable(
          async () => {
            await api.job.start({
              projectId: projects.value[0]._id,
            });
          },
          async () => {
            jobCount.value = jobCount.value + 1;
          }
        );
      }
    }

    async function nextChunk() {
      atChunk--;
      if (atChunk >= 0) {
        await window.bcms.util.throwable(async () => {
          await api.job.getAll({
            page: atChunk,
            itemsPerPage: CHUNK_SIZE,
          });
        });
      }
    }

    function onScroll(event: Event) {
      const target = event.target as HTMLBodyElement;

      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight) {
        nextChunk();
      }
    }

    onMounted(async () => {
      document.body.addEventListener('scroll', onScroll);
      await window.bcms.util.throwable(async () => {
        jobCount.value = await api.job.count();
      });
      atChunk = parseInt(`${jobCount.value / CHUNK_SIZE}`) + 1;

      nextChunk();
      nextChunk();
      if (projects.value.length === 0) {
        await window.bcms.util.throwable(async () => {
          await api.project.getAll();
        });
      }
    });

    onUnmounted(() => {
      document.body.removeEventListener('scroll', onScroll);
    });

    return () => (
      <div>
        <header class="flex items-center justify-between mb-[70px]">
          {firstProject.value ? (
            <BCMSButton onClick={buildFirstProject}>
              {firstProject.value.name}
            </BCMSButton>
          ) : (
            ''
          )}
          {projects.value.length > 1 ? (
            <BCMSButton
              kind="secondary"
              onClick={() =>
                window.bcms.modal.custom.otherProjects.show({
                  onDone: () => {
                    jobCount.value = jobCount.value + 1;
                  },
                })
              }
            >
              Other
            </BCMSButton>
          ) : (
            ''
          )}
        </header>
        {runningJob.value ? <BCMSRunningJob job={runningJob.value} /> : ''}
        <div>
          {jobs.value.length === 0 ? (
            <div class="text-center text-grey text-2xl mb-10">
              There are no active or logged jobs.
            </div>
          ) : (
            <>
              <h1 class="text-3xl leading-tight mb-7.5 dark:text-light">Completed Jobs</h1>
              <BCMSJobsList jobs={jobs.value} jobCount={jobCount.value} />
            </>
          )}
        </div>
      </div>
    );
  },
});
export default component;
