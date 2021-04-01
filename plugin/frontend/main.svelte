<script lang="ts">
  import { GeneralService, Layout, ManagerLayout, sdk } from '@becomes/cms-ui';
  import { onMount } from 'svelte';
  import type { Project, JobLite, Job, ProjectModified } from './types';
  import { BuildsView, ProjectsView } from './views';

  const navItems = [
    {
      link: '',
      name: 'Builds',
      selected: false,
    },
    {
      link: '',
      name: 'Projects',
      selected: false,
    },
  ];
  let projects: ProjectModified[] = [];
  let jobs: JobLite[] = [];
  let selectedView = 'Builds';

  async function getNewJob(jobId: string) {
    const newJob: JobLite = await GeneralService.errorWrapper(
      async () => {
        return sdk.send({
          url: `/plugin/bngine/job/lite/${jobId}`,
          method: 'GET',
          headers: {
            Authorization: '',
          },
        });
      },
      async (result: { job: JobLite }) => {
        return result.job;
      },
    );
    if (!newJob) {
      return;
    }
    jobs = [newJob, ...jobs.filter((e) => e._id !== jobId)];
  }

  onMount(async () => {
    const p: Project[] = await GeneralService.errorWrapper(
      async () => {
        return sdk.send({
          url: '/plugin/bngine/project/all',
          method: 'GET',
          headers: {
            Authorization: '',
          },
        });
      },
      async (result: { projects: Project[] }) => {
        return result.projects;
      },
    );
    if (!p) {
      return;
    }
    projects = p.map((e) => {
      return {
        ...e,
        show: false,
      };
    });
    const j = await GeneralService.errorWrapper(
      async () => {
        return sdk.send({
          url: '/plugin/bngine/job/all/lite',
          method: 'GET',
          headers: {
            Authorization: '',
          },
        });
      },
      async (result: { jobs: Job[] }) => {
        return result.jobs;
      },
    );
    if (!j) {
      return;
    }
    jobs = j;
    jobs.sort((a, b) => b.createdAt - a.createdAt);
  });
</script>

<ManagerLayout
  label="Bngine"
  on:openItem={(event) => {
    selectedView = event.detail.name;
  }}
  items={navItems.map((e) => {
    if (e.name === selectedView) {
      e.selected = true;
    } else {
      e.selected = false;
    }
    return e;
  })}
>
  {#if selectedView === 'Projects'}
    <ProjectsView
      {projects}
      on:remove={(event) => {
        projects = projects.filter((e) => e._id !== event.detail);
      }}
      on:project={(event) => {
        projects = [...projects, { ...event.detail, show: false }];
      }}
    />
  {:else if selectedView === 'Builds'}
    <BuildsView
      {projects}
      {jobs}
      on:new={(event) => {
        getNewJob(event.detail);
      }}
    />
  {/if}
</ManagerLayout>

<style global lang="scss">
  @import './styles/main.scss';
</style>
