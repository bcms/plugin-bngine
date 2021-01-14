<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '@becomes/cms-ui';
  import type { JobModified } from '../../types';

  export { className as class };
  export let job: JobModified;
  export let disableDetails: boolean = false;

  const dispatch = createEventDispatcher();
  let className = '';
</script>

{#if job}
  <div class="{className} bngine--job-details">
    <div class="bngine--job-details-basic">
      <div class="bngine--job-details-basic-top">
        <h3 class="bngine--job-details-project">{job.project}</h3>
        <div
          class="bngine--job-details-status bngine--job-details-status-{job.status.toLowerCase()}">
          {job.status.toLowerCase()}
        </div>
      </div>
      <h5 class="bngine--job-details-branch">{job.repo.branch}</h5>
      <div class="bngine--job-details-date">
        {new Date(job.createdAt).toLocaleString()}
      </div>
      <div class="bngine--job-details-basic-time">
        Duration:
        <strong>{job.time ? job.time : '0s'}</strong>
      </div>
      {#if disableDetails === false}
        <Button
          kind="ghost"
          on:click={async () => {
            dispatch('details');
          }}>
          Show details
        </Button>
      {/if}
    </div>
  </div>
{/if}
