<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Modal, StoreService } from '@becomes/cms-ui';
  import type { JobModified } from '../../types';
  import { BngineJobInfo, BngineJobPipe } from '../job';

  export let job: JobModified;

  const dispatch = createEventDispatcher();
  const modalName = 'BngineJobDetailsModal';
  function close() {
    StoreService.update(modalName, false);
  }
  function cancel() {
    dispatch('cancel');
    close();
  }
  function done() {
    dispatch('done', {});
    close();
  }
</script>

<Modal title="Job details" name={modalName} on:cancel={cancel} on:done={done}>
  {#if job}
    <div>
      <BngineJobInfo {job} disableDetails={true} />
      <BngineJobPipe jobPipe={job.pipe} />
    </div>
  {/if}
</Modal>
