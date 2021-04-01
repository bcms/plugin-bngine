<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    GeneralService,
    Modal,
    StoreService,
    TextInput,
    TextArea,
  } from '@becomes/cms-ui';

  type Data = {
    name: {
      value: string;
      error: string;
    };
    repo: {
      name: {
        value: string;
        error: string;
      };
      url: {
        value: string;
        error: string;
      };
      branch: {
        value: string;
        error: string;
      };
      sshKey: {
        value: string;
        error: string;
      };
    };
  };

  const dispatch = createEventDispatcher();
  const modalName = 'BngineAddProjectModal';
  let data: Data = getData();

  function getData(): Data {
    return {
      name: {
        error: '',
        value: '',
      },
      repo: {
        name: {
          error: '',
          value: '',
        },
        url: {
          error: '',
          value: '',
        },
        branch: {
          error: '',
          value: '',
        },
        sshKey: {
          error: '',
          value: '',
        },
      },
    };
  }
  function close() {
    StoreService.update(modalName, false);
    setTimeout(() => {
      data = getData();
    }, 300);
  }
  function cancel() {
    dispatch('cancel');
    close();
  }
  function done() {
    if (data.name.value.replace(/ /g, '') === '') {
      data.name.error = 'Project name is required and must be unique.';
      return;
    }
    data.name.error = '';
    if (data.repo.name.value.replace(/ /g, '') === '') {
      data.repo.name.error = 'Repository name is required.';
      return;
    }
    data.repo.name.error = '';
    if (data.repo.branch.value.replace(/ /g, '') === '') {
      data.repo.branch.error = 'Repository branch is required.';
      return;
    }
    data.repo.branch.error = '';
    if (data.repo.url.value.replace(/ /g, '') === '') {
      data.repo.url.error = 'Repository URL is required.';
      return;
    } else if (data.repo.url.value.startsWith('git@') === false) {
      data.repo.url.error =
        'SSH URL is required (ex. git@github.com:user/repo).';
      return;
    }
    data.repo.url.error = '';
    if (data.repo.sshKey.value.replace(/ /g, '') === '') {
      data.repo.sshKey.error = 'Private SSH key is required.';
      return;
    }
    data.repo.branch.error = '';
    dispatch('done', {
      name: data.name.value,
      repo: {
        name: data.repo.name.value,
        branch: data.repo.branch.value,
        url: data.repo.url.value,
        sshKey: data.repo.sshKey.value,
      },
    });
    close();
  }
</script>

<Modal
  title="Add new project"
  name={modalName}
  on:cancel={cancel}
  on:done={done}>
  <TextInput
    label="Project name"
    placeholder="Project name"
    invalidText={data.name.error}
    on:input={(event) => {
      data.name.value = GeneralService.string.toUri(event.detail);
    }} />
  <TextInput
    class="mt-20"
    label="Git repository name"
    placeholder="Git repository name"
    invalidText={data.repo.name.error}
    on:input={(event) => {
      data.repo.name.value = event.detail;
    }} />
  <TextInput
    class="mt-20"
    label="Git repository branch"
    placeholder="Git repository branch"
    invalidText={data.repo.branch.error}
    on:input={(event) => {
      data.repo.branch.value = event.detail;
    }} />
  <TextInput
    class="mt-20"
    label="Git repository URL"
    helperText="ex. git@github.com:user/repo.git"
    placeholder="Git repository URL"
    invalidText={data.repo.url.error}
    on:input={(event) => {
      data.repo.url.value = event.detail;
    }} />
  <TextArea
    class="mt-20"
    label="Private SSH Key"
    helperText="SSH key which have read access to repo."
    invalidText={data.repo.sshKey.error}
    on:input={(event) => {
      data.repo.sshKey.value = event.detail;
    }} />
</Modal>
