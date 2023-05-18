import type { Job } from '@backend/job';
import { store } from '@ui/store';
import { computed, defineComponent, PropType } from 'vue';

export const JobInfo = defineComponent({
  props: {
    job: {
      type: Object as PropType<Job>,
      required: true,
    },
    duration: Number,
  },
  setup(props) {
    const projects = computed(() => {
      return store.project.items();
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
            <h3 class="text-xl leading-tight capitalize truncate mr-3 lg:text-2xl xl:text-[28px] dark:text-light">
              {projectById(props.job.project).value?.name}
            </h3>
            <div
              class={`font-semibold h-full py-2 leading-normal text-sm rounded-sm ${
                props.job.status === 'SUCCESS'
                  ? 'text-green'
                  : props.job.status === 'FAIL'
                  ? 'text-red'
                  : props.job.status === 'QUEUE'
                  ? 'text-pink dark:text-yellow'
                  : 'text-dark dark:text-light'
              }`}
            >
              {props.job.status}
            </div>
          </div>
          <h5 class="mb-5 leading-tight font-semibold dark:text-light">
            {props.job.repo?.branch}
          </h5>
          <div class="flex items-center justify-between dark:text-light">
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
