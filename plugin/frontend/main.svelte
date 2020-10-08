<script lang="ts">
  import { GeneralService, Layout, sdk } from '@becomes/cms-ui';
  import { onMount } from 'svelte';
  import { BngineNav } from './components';
  import type { Project, JobLite, Job, ProjectModified } from './types';
  import { BuildsView, ProjectsView } from './views';

  let projects: ProjectModified[] = [];
  let jobs: JobLite[] = [];
  let selectedView = 'builds';

  async function getJobs() {
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
    getJobs();
  });
</script>

<Layout>
  <div class="manager-layout bngine--layout">
    <BngineNav
      on:select={(event) => {
        selectedView = event.detail;
      }} />
    <div class="manager-layout--content">
      <div class="manager-layout--content-wrapper">
        {#if selectedView === 'projects'}
          <ProjectsView {projects} />
        {:else if selectedView === 'builds'}
          <BuildsView {projects} {jobs} on:getJobs={getJobs} />
        {/if}
      </div>
    </div>
  </div>
</Layout>
