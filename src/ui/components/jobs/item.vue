<script lang="tsx">
import { BCMSButton, BCMSIcon } from '@becomes/cms-ui/components';
import { computed, defineComponent, PropType, ref } from '@vue/runtime-core';
import { JobLite, JobStatus } from '../../../backend/types';
import { useStore } from '../../store';

const component = defineComponent({
  props: {
    job: {
      type: Object as PropType<JobLite>,
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
    const store = useStore();

    const projects = computed(() => {
      return store.getters.project_items;
    });

    const duration = ref(
      props.job && props.job.finishedAt > 0
        ? props.job.finishedAt - props.job.createdAt
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
      if (
        props.job.status === JobStatus.RUNNING ||
        props.job.status === JobStatus.QUEUE
      ) {
        try {
          // TODO: For QUEUE remove queue time and prevent interval tick
          duration.value = Date.now() - props.job.createdAt;
          if (
            props.job.status !== JobStatus.RUNNING &&
            props.job.status !== JobStatus.QUEUE
          ) {
            duration.value = props.job.finishedAt - props.job.createdAt;

            clearInterval(timeInterval);
          }
        } catch (error) {
          // ignore
        }
      }
    }, 1000);

    return () => (
      <li class="grid grid-cols-1 gap-5 leading-tight -tracking-wider items-center justify-between relative py-5 border-b border-dark border-opacity-20 2xl:grid-cols-[50px,80px,80px,100px,100px,80px,80px,80px] 2xl:py-3">
        <div
          class="col-start-1 col-end-2 2xl:pl-2.5 2xl:col-start-auto 2xl:col-end-auto"
          title={`${props.jobCount - props.index}.`}
        >
          <span>{props.jobCount - props.index}.</span>
        </div>
        <div
          class={`col-start-1 col-end-2 ${
            props.job.status === JobStatus.SUCCESS
              ? 'text-green'
              : props.job.status === JobStatus.FAIL
              ? 'text-red'
              : props.job.status === JobStatus.QUEUE
              ? 'text-pink'
              : 'text-dark'
          } font-medium before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto`}
          data-column-name="Status"
          title={props.job.status}
        >
          {props.job.status}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium min-w-max before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto 2xl:font-normal"
          data-column-name="Duration"
          title={parseMillis(duration.value)}
        >
          {parseMillis(duration.value)}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium italic before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto 2xl:font-normal"
          data-column-name="Branch"
          title={props.job.repo.branch}
        >
          {props.job.repo.branch}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto 2xl:font-normal"
          data-column-name="Project"
          title={projectById(props.job.project).value?.name}
        >
          {projectById(props.job.project).value?.name}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium min-w-max before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto 2xl:font-normal"
          data-column-name="Date"
          title={new Date(props.job.createdAt).toLocaleDateString()}
        >
          {new Date(props.job.createdAt).toLocaleDateString()}
        </div>
        <div
          class="col-start-1 col-end-2 font-medium min-w-max before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto 2xl:font-normal"
          data-column-name="Time"
          title={new Date(props.job.createdAt).toLocaleTimeString()}
        >
          {new Date(props.job.createdAt).toLocaleTimeString()}
        </div>
        <div
          class={`flex justify-end col-start-2 col-end-3 row-start-1 2xl:col-start-auto 2xl:col-end-auto 2xl:row-start-auto 2xl:justify-center ${
            props.job.status === JobStatus.RUNNING ||
            props.job.status === JobStatus.QUEUE
              ? 'opacity-0 pointer-events-none'
              : ''
          }`}
        >
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
              class="w-6 h-6 text-grey fill-current transition-colors duration-300 group-hover:text-dark group-focus-visible:text-dark"
            />
          </BCMSButton>
        </div>
      </li>
    );
  },
});

export default component;
</script>
