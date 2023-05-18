import type { Job, JobLite } from '@backend/job';
import { api } from '@ui/api';
import { store } from '@ui/store';
import {
  computed,
  defineComponent,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  PropType,
  ref,
} from 'vue';
import { JobInfo } from './info';
import { JobPipe } from './pipe';

export const JobRunning = defineComponent({
  props: {
    job: {
      type: Object as PropType<Job | JobLite>,
      required: true,
    },
  },
  setup(props) {
    let idBuffer = '';

    const job = computed<Job | undefined>(() => {
      return store.job.find((e) => e._id === props.job._id) as Job;
    });
    const duration = ref(
      job.value
        ? Date.now() - job.value.createdAt - (props.job.inQueueFor || 0)
        : 0
    );

    const timeInterval = setInterval(() => {
      if (job.value && job.value.pipe) {
        try {
          duration.value =
            Date.now() - job.value.createdAt - (job.value.inQueueFor || 0);

          if (job.value.pipe.length > 0) {
            job.value.pipe[job.value.pipe.length - 1].timeToExec =
              Date.now() - job.value.pipe[job.value.pipe.length - 1].createdAt;
          }
        } catch (error) {
          // ignore
        }
      }
    }, 1000);

    onMounted(async () => {
      idBuffer = props.job._id;

      if (!(props.job as Job).pipe) {
        await window.bcms.util.throwable(async () => {
          await api.job.get({
            id: props.job._id,
          });
        });
      }
    });

    onBeforeUpdate(() => {
      if (idBuffer !== props.job._id) {
        idBuffer = props.job._id;
        duration.value = 0;
      }
    });

    onUnmounted(() => {
      clearInterval(timeInterval);
    });

    return () => (
      <div>
        {job.value && job.value.pipe && (
          <>
            <div class="mb-7.5">
              <h4 class="text-xl leading-tight mb-7.5 lg:text-2xl 2xl:text-4xl dark:text-light">
                Running Job
              </h4>
              <div class="mt-5">
                <div class="mb-5">
                  <JobInfo job={job.value} duration={duration.value} />
                </div>
                {job.value.pipe.map((pipe, index) => {
                  return (
                    <JobPipe
                      key={index}
                      pipe={pipe}
                      jobId={props.job._id}
                      inRunningJob
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  },
});
