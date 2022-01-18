<script lang="tsx">
import { computed, defineComponent, PropType } from '@vue/runtime-core';
import { useStore } from '../../store';
import { JobLite, JobStatus } from '../../../backend/types';

const component = defineComponent({
  props: {
    job: {
      type: Object as PropType<JobLite>,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();

    const projects = computed(() => {
      return store.getters.project_items;
    });

    const projectById = (id: string) =>
      computed(() => {
        return projects.value.find((project) => project._id === id);
      });

    const getDuration = () => {
      return computed(() => {
        const duration = props.job.finishedAt - props.job.createdAt;

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

    return () => (
      <div class="flex mb-5">
        <div class="w-full">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-xl leading-tight capitalize font-medium truncate mr-3 lg:text-2xl xl:text-[28px]">
              {projectById(props.job.project).value?.name}
            </h3>
            <div
              class={`font-semibold h-full py-2 px-4 capitalize leading-normal text-light text-sm rounded-sm ${
                props.job.status === JobStatus.SUCCESS
                  ? 'bg-green'
                  : props.job.status === JobStatus.FAIL
                  ? 'bg-red'
                  : 'bg-pink'
              }`}
            >
              {props.job.status}
            </div>
          </div>
          <h5 class="mb-5 leading-tight font-semibold">
            {props.job.repo.branch}
          </h5>
          <div class="text-sm leading-normal tracking-wide mb-2.5">
            {new Date(props.job.createdAt).toLocaleString()}
          </div>
          <div>
            Duration: <span class="font-semibold">{getDuration().value}</span>
          </div>
        </div>
      </div>
    );
  },
});

export default component;
</script>
