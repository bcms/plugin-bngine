<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Modal, StoreService, Button } from '@becomes/cms-ui';
  import type { Project } from '../../types';

  export let projects: Project[] = [];

  const dispatch = createEventDispatcher();
  const modalName = 'BngineOtherProjectsModal';

  function close() {
    StoreService.update(modalName, false);
  }
  function cancel() {
    dispatch('cancel');
    close();
  }
  function done(name: string) {
    dispatch('done', name);
    close();
  }
</script>

<Modal
  title="Other projects"
  name={modalName}
  on:cancel={cancel}
  on:done={cancel}
>
  <div class="otherProjectsModal">
    {#each projects as project}
      <Button
        on:click={() => {
          done(project.name);
        }}>{project.name}</Button
      >
    {/each}
  </div>
</Modal>
