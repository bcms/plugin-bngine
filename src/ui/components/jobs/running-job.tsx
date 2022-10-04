import {
  computed,
  defineComponent,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  PropType,
  ref,
} from 'vue';
import { useApi } from '../../api';
import { useStore } from '../../store';
import type { Job, JobLite } from '../../../backend/types';
import { BCMSJobsInfo, BCMSJobsPipe } from '.';

const component = defineComponent({
  props: {
    job: {
      type: Object as PropType<Job | JobLite>,
      required: true,
    },
  },
  setup(props) {
    const api = useApi();
    const store = useStore();
    let idBuffer = '';

    const job = computed<Job | undefined>(() => {
      return store.getters.job_findOne((e) => e._id === props.job._id) as Job;
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
                  <BCMSJobsInfo job={job.value} duration={duration.value} />
                </div>
                {job.value.pipe.map((pipe, index) => {
                  return (
                    <BCMSJobsPipe
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

export default component;
