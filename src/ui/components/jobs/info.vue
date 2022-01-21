<script lang="tsx">
import { computed, defineComponent, PropType } from '@vue/runtime-core';
import { useStore } from '../../store';
import { Job, JobStatus } from '../../../backend/types';

const component = defineComponent({
  props: {
    job: {
      type: Object as PropType<Job>,
      required: true,
    },
    duration: Number,
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
        const duration =
          props.job.finishedAt -
          props.job.createdAt -
          (props.job.inQueueFor || 0);

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
            <h3 class="text-xl leading-tight capitalize truncate mr-3 lg:text-2xl xl:text-[28px]">
              {projectById(props.job.project).value?.name}
            </h3>
            <div
              class={`font-semibold h-full py-2 leading-normal text-sm rounded-sm ${
                props.job.status === JobStatus.SUCCESS
                  ? 'text-green'
                  : props.job.status === JobStatus.FAIL
                  ? 'text-red'
                  : props.job.status === JobStatus.QUEUE
                  ? 'text-pink'
                  : 'text-dark'
              }`}
            >
              {props.job.status}
            </div>
          </div>
          <h5 class="mb-5 leading-tight font-semibold">
            {props.job.repo.branch}
          </h5>
          <div class="flex items-center justify-between">
            <div>
              Duration:{' '}
              <span class="font-semibold">
                {props.duration
                  ? parseMillis(props.duration)
                  : getDuration().value}
              </span>
            </div>
            <div class="text-sm leading-normal tracking-wide">
              {new Date(props.job.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  },
});

export default component;
</script>
