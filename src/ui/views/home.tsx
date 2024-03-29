import {
  BCMSJwtRoleName,
  BCMSUser,
  BCMSUserPolicyPlugin,
} from '@becomes/cms-sdk/types';
import { BCMSButton } from '@becomes/cms-ui/components';
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { JobStatus, Project } from '../../backend/types';
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
    const user = ref<BCMSUser | undefined>();

    const jobs = computed(() => {
      return store.getters.job_items;
    });
    const projects = computed(() =>
      store.getters.project_items.filter((project) =>
        checkProjectAccess(project)
      )
    );
    const firstProject = computed(() => {
      if (checkProjectAccess(projects.value[0])) {
        return projects.value[0];
      }
      return undefined;
    });
    const runningJob = computed(() => {
      const test = store.getters.job_findOne(
        (e) => e.status === JobStatus.RUNNING || e.status === JobStatus.QUEUE
      );
      return test;
    });
    const policy = ref<BCMSUserPolicyPlugin | undefined>();

    function checkProjectAccess(project?: Project): boolean {
      return (
        user.value?.roles[0].name === BCMSJwtRoleName.ADMIN ||
        policy.value?.fullAccess ||
        policy.value?.options.find(
          (e) => e.name === `Run project ${project?.name}`
        )?.value[0] === 'true'
      );
    }

    async function buildFirstProject() {
      if (
        await window.bcms.confirm(
          `Start build`,
          `Are you sure you want to build ${firstProject.value?.name}?`
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
        await window.bcms.sdk.user.getAll();
      });
      await window.bcms.util.throwable(
        async () => {
          return await window.bcms.sdk.user.get();
        },
        async (result) => {
          user.value = result;
          policy.value = result.customPool.policy.plugins?.find(
            (e) => e.name === window.pluginName
          );
        }
      );
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
          {firstProject.value && (
            <BCMSButton onClick={buildFirstProject}>
              {firstProject.value.name}
            </BCMSButton>
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
              <h1 class="text-3xl leading-tight mb-7.5 dark:text-light">
                Completed Jobs
              </h1>
              <BCMSJobsList jobs={jobs.value} jobCount={jobCount.value} />
            </>
          )}
        </div>
      </div>
    );
  },
});
export default component;
