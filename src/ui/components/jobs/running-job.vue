<script lang="tsx">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
} from '@vue/runtime-core';
import { useApi } from '../../api';
import { useStore } from '../../store';
import { Job, JobLite } from '../../../backend/types';
import { BCMSJobsPipe } from '.';

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
    const job = computed<Job | undefined>(() => {
      return store.getters.job_findOne((e) => e._id === props.job._id) as Job;
    });

    onMounted(async () => {
      if (!(props.job as Job).pipe) {
        await window.bcms.util.throwable(async () => {
          await api.job.get({
            id: props.job._id,
          });
        });
      }
    });

    return () => (
      <div class="pipe">
        {job.value && (
          <div>
            {job.value.pipe.map((pipe) => {
              return <BCMSJobsPipe pipe={pipe} jobId={props.job._id} />;
            })}
          </div>
        )}
      </div>
    );
  },
});

export default component;
</script>
