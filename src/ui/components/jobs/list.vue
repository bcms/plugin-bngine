<script lang="tsx">
import { BCMSButton, BCMSIcon } from '@becomes/cms-ui/components';
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
} from '@vue/runtime-core';
import { JobLite, JobStatus } from '../../../backend/types';
import { useApi } from '../../api';
import { useStore } from '../../store';

const component = defineComponent({
  props: {
    jobs: {
      type: Array as PropType<JobLite[]>,
      required: true,
    },
  },
  setup(props) {
    const api = useApi();
    const store = useStore();

    const projects = computed(() => {
      return store.getters.project_items;
    });
    const jobs = computed(() => {
      const output: JobLite[] = [];
      for (let i = props.jobs.length - 1; i > -1; i--) {
        output.push(props.jobs[i]);
      }
      return output;
    });

    const projectById = (id: string) =>
      computed(() => {
        return projects.value.find((project) => project._id === id);
      });

    const getDuration = (id: string) => {
      return computed(() => {
        const job = props.jobs.find((e) => e._id === id);

        if (!job) {
          return '0s';
        }

        const duration = job.finishedAt - job.createdAt;

        if (duration < 0) {
          return '0s';
        }

        return parseMillis(duration);
      });
    };

    function parseMillis(millis: number) {
      if (millis > 60000) {
        return `${parseInt('' + millis / 1000 / 60)}m ${
          parseInt('' + millis / 1000) - parseInt('' + millis / 1000 / 60) * 60
        }s`;
      } else {
        return `${parseInt(`${millis / 1000}`, 10)}s`;
      }
    }

    onMounted(async () => {
      if (projects.value.length === 0) {
        api.project.getAll();
      }
    });

    return () => (
      <ul>
        <li class="hidden border-b border-grey border-opacity-50 py-4 relative font-semibold gap-5 leading-tight -tracking-0.01 items-center justify-between 2xl:grid 2xl:grid-cols-[50px,80px,80px,100px,100px,80px,80px,80px]">
          <div></div>
          <div>Status</div>
          <div>Duration</div>
          <div>Branch</div>
          <div>Project</div>
          <div>Date</div>
          <div>Time</div>
          <div></div>
        </li>
        {jobs.value.map((job, index) => {
          return (
            <li class="grid grid-cols-1 gap-5 leading-tight -tracking-wider items-center justify-between relative py-5 border-b border-dark border-opacity-20 2xl:grid-cols-[50px,80px,80px,100px,100px,80px,80px,80px] 2xl:py-3">
              <div
                class="col-start-1 col-end-2 2xl:pl-2.5 2xl:col-start-auto 2xl:col-end-auto"
                title={`${props.jobs.length - index}.`}
              >
                <span>{props.jobs.length - index}.</span>
              </div>
              <div
                class={`col-start-1 col-end-2 ${
                  job.status === JobStatus.SUCCESS
                    ? 'text-green'
                    : job.status === JobStatus.FAIL
                    ? 'text-red'
                    : 'text-pink'
                } font-medium before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto`}
                data-column-name="Status"
                title={job.status}
              >
                {job.status}
              </div>
              <div
                class="col-start-1 col-end-2 font-medium min-w-max before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto 2xl:font-normal"
                data-column-name="Duration"
                title={getDuration(job._id).value}
              >
                {getDuration(job._id).value}
              </div>
              <div
                class="col-start-1 col-end-2 font-medium italic before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto 2xl:font-normal"
                data-column-name="Branch"
                title={job.repo.branch}
              >
                {job.repo.branch}
              </div>
              <div
                class="col-start-1 col-end-2 font-medium before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto 2xl:font-normal"
                data-column-name="Project"
                title={projectById(job.project).value?.name}
              >
                {projectById(job.project).value?.name}
              </div>
              <div
                class="col-start-1 col-end-2 font-medium min-w-max before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto 2xl:font-normal"
                data-column-name="Date"
                title={new Date(job.createdAt).toLocaleDateString()}
              >
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
              <div
                class="col-start-1 col-end-2 font-medium min-w-max before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-medium before:text-grey before:text-xs before:leading-tight 2xl:before:hidden 2xl:col-start-auto 2xl:col-end-auto 2xl:font-normal"
                data-column-name="Time"
                title={new Date(job.createdAt).toLocaleTimeString()}
              >
                {new Date(job.createdAt).toLocaleTimeString()}
              </div>
              <div class="col-start-2 col-end-3 row-start-1 2xl:col-start-auto 2xl:col-end-auto 2xl:row-start-auto 2xl:justify-center">
                <BCMSButton
                  kind="ghost"
                  size="s"
                  class="group hover:shadow-none focus:shadow-none"
                  onClick={() => {
                    window.bcms.modal.custom.jobDetails.show({
                      jobId: job._id,
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
        })}
      </ul>
    );
  },
});

export default component;
</script>
