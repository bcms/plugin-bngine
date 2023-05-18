import type { Job, JobLite } from '@backend/job';
import { api } from '@ui/api';
import { store } from '@ui/store';
import { computed, defineComponent, onMounted, PropType } from 'vue';
import { JobItem } from './item';

export const JobList = defineComponent({
  props: {
    jobs: {
      type: Array as PropType<Job[] | JobLite[]>,
      required: true,
    },
    jobCount: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const projects = computed(() => {
      return store.project.items();
    });
    const jobs = computed(() => {
      const output: Job[] = JSON.parse(JSON.stringify(props.jobs));

      return output.sort((a, b) => b.createdAt - a.createdAt);
    });

    onMounted(async () => {
      if (projects.value.length === 0) {
        await window.bcms.util.throwable(async () => {
          await api.project.getAll();
        });
      }
    });

    return () => (
      <ul>
        <li class="hidden border-b border-grey border-opacity-50 py-4 relative font-semibold gap-5 leading-tight -tracking-0.01 items-center justify-between desktop:grid desktop:grid-cols-[50px,80px,80px,100px,100px,80px,80px] xl:grid-cols-[50px,80px,80px,100px,100px,80px,80px,80px,80px] dark:text-light">
          <div></div>
          <div>Status</div>
          <div>Duration</div>
          <div>Branch</div>
          <div>Project</div>
          <div>Date</div>
          <div class="desktop:hidden xl:block">Time</div>
          <div class="desktop:hidden xl:block">User</div>
          <div></div>
        </li>
        {jobs.value.map((job, index) => {
          return (
            <JobItem
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
