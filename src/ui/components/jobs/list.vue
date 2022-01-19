<script lang="tsx">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
} from '@vue/runtime-core';
import { BCMSJobItem } from '.';
import { JobLite } from '../../../backend/types';
import { useApi } from '../../api';
import { useStore } from '../../store';

const component = defineComponent({
  props: {
    jobs: {
      type: Array as PropType<JobLite[]>,
      required: true,
    },
    jobCount: {
      type: Number,
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
      const output: JobLite[] = JSON.parse(JSON.stringify(props.jobs));

      return output.sort((a, b) => b.createdAt - a.createdAt);
    });

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
            <BCMSJobItem
              key={index}
              job={job}
              jobCount={props.jobCount}
              index={index}
            />
          );
        })}
      </ul>
    );
  },
});

export default component;
</script>
