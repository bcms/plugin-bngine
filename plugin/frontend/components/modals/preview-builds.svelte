<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import {
    GeneralService,
    Modal,
    sdk,
    StoreService,
    Select,
    Button,
    NotificationService,
  } from '@becomes/cms-ui';

  type Data = {
    branch: {
      value: string;
      error: string;
    };
  };

  const dispatch = createEventDispatcher();
  const modalName = 'BnginePreviewBuildsModal';
  let branches: string[] = [];
  let previews: string[] = [];
  let data: Data = getData();
  let closing = false;

  function getData(): Data {
    return {
      branch: {
        value: '',
        error: '',
      },
    };
  }

  function close() {
    closing = true;
    StoreService.update(modalName, false);
    data = getData();
  }
  function cancel() {
    dispatch('cancel');
    close();
  }
  function done() {
    if (data.branch.value === '') {
      data.branch.error = 'Please select branch';
      return;
    }
    data.branch.error = '';
    dispatch('done', {
      branch: data.branch.value,
    });
    if (
      !previews.find((e) => {
        return e === `prev-${data.branch.value}.pink.becomes.co`;
      })
    ) {
      previews = [...previews, `prev-${data.branch.value}.pink.becomes.co`];
    }
    close();
  }

  async function removePreview(name: string) {
    if (confirm('Are you sure you want to delete the preview.')) {
      const p = await GeneralService.errorWrapper(
        async () => {
          return await sdk.send({
            url: `/plugin/bngine/project/preview/${name}`,
            method: 'DELETE',
            headers: {
              Authorization: '',
            },
          });
        },
        async () => {
          return true;
        },
      );
      if (!p) {
        return;
      }
      previews = previews.filter((e) => e !== name);
      NotificationService.success('Preview successfully delete.');
    }
  }

  onMount(async () => {
    previews = await GeneralService.errorWrapper(
      async () => {
        return await sdk.send({
          url: `/plugin/bngine/project/preview/previews`,
          method: 'GET',
          headers: {
            Authorization: '',
          },
        });
      },
      async (result: { previews: string[] }) => {
        return result.previews;
      },
    );
    branches = await GeneralService.errorWrapper(
      async () => {
        return await sdk.send({
          url: '/plugin/bngine/project/preview/branches',
          method: 'GET',
          headers: {
            Authorization: '',
          },
        });
      },
      async (result: { branches: string[] }) => {
        return result.branches;
      },
    );
  });
</script>

<Modal
  title="Previews"
  name={modalName}
  on:animationDone={() => {
    closing = false;
  }}
  on:cancel={cancel}
  on:done={done}>
  <div class="bngine--previews">
    <div class="bngine--previews-build">
      <Select
        label="Branches"
        invalidText={data.branch.error}
        options={branches.map((e) => {
          return { label: e, value: e };
        })}
        on:change={(event) => {
          data.branch.value = event.detail;
          if (data.branch.value !== '') {
            data.branch.error = '';
          }
        }} />
      <Button
        disabled={closing}
        on:click={() => {
          done();
        }}>
        Build
      </Button>
    </div>
    <div class="bngine--previews-active">
      <h4 class="bngine--previews-active-title">Active Previews</h4>
      {#if previews.length > 0}
        <table class="bngine--previews-active-table">
          <thead>
            <tr>
              <th />
              <th>URL</th>
              <th class="remove" />
            </tr>
          </thead>
          <tbody>
            {#each previews as preview, i}
              <tr>
                <td class="number">{i + 1}.</td>
                <td>
                  <a
                    href={`http://${preview}`}
                    target="_blank"
                    rel="noopener noreferrer">http://{preview}</a>
                </td>
                <td class="remove">
                  <Button
                    on:click={() => {
                      removePreview(preview);
                    }} />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No active previews</p>
      {/if}
    </div>
  </div>
</Modal>
