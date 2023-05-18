import type { Job, JobLite } from '@backend/job';
import { BCMSButton, BCMSIcon } from '@ui/bcms-ui/components';
import { store } from '@ui/store';
import { computed, defineComponent, PropType, ref } from 'vue';

export const JobItem = defineComponent({
  props: {
    job: {
      type: Object as PropType<Job | JobLite>,
      required: true,
    },
    jobCount: {
      type: Number,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const projects = computed(() => {
      return store.project.items();
    });

    const user = computed(() =>
      window.bcms.vue.store.getters.user_findOne(
        (e) => e._id === props.job.userId
      )
    );

    const duration = ref(
      props.job && props.job.finishedAt > 0
        ? props.job.finishedAt -
            props.job.createdAt -
            (props.job.inQueueFor || 0)
        : 0
    );

    const projectById = (id: string) =>
      computed(() => {
        return projects.value.find((project) => project._id === id);
      });

    function parseMillis(millis: number) {
      if (millis > 60000) {
        return `${parseInt('' + millis / 1000 / 60)}m ${
          parseInt('' + millis / 1000) - parseInt('' + millis / 1000 / 60) * 60
        }s`;
      } else {
        return `${parseInt(`${millis / 1000}`, 10)}s`;
      }
    }

    const timeInterval = setInterval(() => {
      if (props.job.status === 'RUNNING') {
        try {
          duration.value =
            Date.now() - props.job.createdAt - (props.job.inQueueFor || 0);
          if (props.job.status !== 'RUNNING') {
            clearInterval(timeInterval);

            duration.value =
              props.job.finishedAt -
              props.job.createdAt -
              (props.job.inQueueFor || 0);
          }
        } catch (error) {
          // ignore
        }
      } else if (props.job.status === 'QUEUE') {
        duration.value = 0;
      }
    }, 1000);

    // onMounted(async () => {
    //   await window.bcms.util.throwable(async () => {
    //     return await window.bcms.sdk.user.get(props.job.userId);
    //   });
    // });

    return () => (
      <li class="grid grid-cols-1 gap-5 leading-tight -tracking-wider items-center justify-between relative py-5 border-b border-dark border-opacity-20 desktop:grid-cols-[50px,80px,80px,100px,100px,80px,80px] desktop:py-3 xl:grid-cols-[50px,80px,80px,100px,100px,80px,80px,80px,80px] dark:text-light">
        <div
          class="col-start-1 col-end-2 desktop:pl-2.5 desktop:col-start-auto desktop:col-end-auto"
          title={`${props.jobCount - props.index}.`}
        >
          <span>{props.jobCount - props.index}.</span>
        </div>
        <div
          class={`col-start-1 col-end-2 ${
            props.job.status === 'SUCCESS'
              ? 'text-green'
              : props.job.status === 'FAIL'
              ? 'text-red'
              : props.job.status === 'QUEUE'
              ? 'text-pink dark:text-yellow'
              : 'text-dark dark:text-light'
          } font-medium before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight desktop:before:hidden desktop:col-start-auto desktop:col-end-auto`}
          data-column-name="Status"
          title={props.job.status}
        >
          {props.job.status}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium min-w-max before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight desktop:before:hidden desktop:col-start-auto desktop:col-end-auto desktop:font-normal"
          data-column-name="Duration"
          title={
            props.job.status === 'QUEUE' ? '0s' : parseMillis(duration.value)
          }
        >
          {props.job.status === 'QUEUE' ? '0s' : parseMillis(duration.value)}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium italic before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight desktop:before:hidden desktop:col-start-auto desktop:col-end-auto desktop:font-normal"
          data-column-name="Branch"
          title={props.job.repo?.branch}
        >
          {props.job.repo?.branch}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium truncate before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight desktop:before:hidden desktop:col-start-auto desktop:col-end-auto desktop:font-normal"
          data-column-name="Project"
          title={projectById(props.job.project).value?.name}
        >
          {projectById(props.job.project).value?.name}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium min-w-max before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight desktop:before:hidden desktop:col-start-auto desktop:col-end-auto desktop:font-normal"
          data-column-name="Date"
          title={new Date(props.job.createdAt).toLocaleDateString()}
        >
          {new Date(props.job.createdAt).toLocaleDateString()}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium min-w-max before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight desktop:hidden desktop:before:hidden desktop:col-start-auto desktop:col-end-auto desktop:font-normal xl:block"
          data-column-name="Time"
          title={new Date(props.job.createdAt).toLocaleTimeString()}
        >
          {new Date(props.job.createdAt).toLocaleTimeString()}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium min-w-max truncate before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight desktop:hidden desktop:before:hidden desktop:col-start-auto desktop:col-end-auto desktop:font-normal xl:block"
          data-column-name="User"
          title={user.value ? user.value.username : 'Loading...'}
        >
          {user.value ? user.value.username : 'Loading...'}
        </div>
        <div
          class={`flex justify-end col-start-2 col-end-3 row-start-1 desktop:col-start-auto desktop:col-end-auto desktop:row-start-auto desktop:justify-center ${
            props.job.status === 'RUNNING'
              ? 'opacity-0 pointer-events-none'
              : ''
          }`}
        >
          {props.job.status !== 'QUEUE' ? (
            <BCMSButton
              kind="ghost"
              size="s"
              class="group hover:shadow-none focus:shadow-none"
              onClick={() => {
                window.bcms.modal.custom.jobDetails.show({
                  jobId: props.job._id,
                });
              }}
            >
              <BCMSIcon
                src="/eye/show"
                class="w-6 h-6 text-grey fill-current transition-colors duration-300 group-hover:text-dark group-focus-visible:text-dark dark:group-hover:text-light dark:group-focus-visible:text-light"
              />
            </BCMSButton>
          ) : (
            <BCMSButton
              kind="danger"
              size="s"
              onClick={() => {
                // TODO: Implement job abort
              }}
            >
              Abort
            </BCMSButton>
          )}
        </div>
      </li>
    );
  },
});
