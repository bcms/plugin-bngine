import {
  BCMSModalWrapper,
  BCMSTextAreaInput,
  BCMSTextInput,
} from '@ui/bcms-ui/components';
import type { BCMSModalInputDefaults } from '@ui/bcms-ui/types';
import type {
  BCMSAddProjectModalInputData,
  BCMSAddProjectModalOutputData,
} from '@ui/types';
import { defineComponent, ref } from 'vue';

interface ValidationType {
  value: string;
  error: string;
}

interface Data extends BCMSModalInputDefaults<BCMSAddProjectModalOutputData> {
  projectName: ValidationType;
  repo: {
    name: ValidationType;
    branch: ValidationType;
    url: ValidationType;
    sshKey: ValidationType;
  };
}

const component = defineComponent({
  setup() {
    const show = ref(false);
    const modalData = ref<Data>(getData());

    window.bcms.modal.custom.addProject = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSAddProjectModalInputData): Data {
      const d: Data = {
        title: 'Add new project',
        projectName: {
          value: '',
          error: '',
        },
        repo: {
          url: {
            value: '',
            error: '',
          },
          name: {
            value: '',
            error: '',
          },
          branch: {
            value: '',
            error: '',
          },
          sshKey: {
            value: '',
            error: '',
          },
        },
        onCancel() {
          // ...
        },
        onDone() {
          // ...
        },
      };
      if (inputData) {
        if (inputData.title) {
          d.title = inputData.title;
        }
        if (inputData.onDone) {
          d.onDone = inputData.onDone;
        }
        if (inputData.onCancel) {
          d.onCancel = inputData.onCancel;
        }
      }
      return d;
    }
    function cancel() {
      if (modalData.value.onCancel) {
        const result = modalData.value.onCancel();
        if (result instanceof Promise) {
          result.catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        }
      }
      window.bcms.modal.custom.addProject.hide();
    }
    function done() {
      if (modalData.value.onDone) {
        if (!modalData.value.projectName.value) {
          modalData.value.projectName.error = 'Project name is required';
          return;
        }
        modalData.value.projectName.error = '';
        if (
          !modalData.value.repo.url.value ||
          (!modalData.value.repo.url.value.startsWith('http') &&
            !modalData.value.repo.url.value.startsWith('git@'))
        ) {
          modalData.value.repo.url.error =
            'Valid Git repository URL is required';
          return;
        }
        modalData.value.repo.url.error = '';
        if (!modalData.value.repo.name.value) {
          modalData.value.repo.name.error = 'Git repository name is required';
          return;
        }
        modalData.value.repo.name.error = '';
        if (!modalData.value.repo.branch.value) {
          modalData.value.repo.branch.error =
            'Git repository branch is required';
          return;
        }
        modalData.value.repo.branch.error = '';

        const result = modalData.value.onDone({
          projectName: modalData.value.projectName.value,
          repo: {
            name: modalData.value.repo.name.value,
            branch: modalData.value.repo.branch.value,
            url: modalData.value.repo.url.value,
            sshKey: modalData.value.repo.sshKey.value,
          },
        });
        if (result instanceof Promise) {
          result.catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        }
      }
      window.bcms.modal.custom.addProject.hide();
    }

    return () => {
      return (
        <BCMSModalWrapper
          title={modalData.value.title}
          show={show.value}
          onDone={done}
          onCancel={cancel}
        >
          <div class="grid grid-cols-1 gap-6">
            <BCMSTextInput
              label="Project Name"
              placeholder="Project name"
              invalidText={modalData.value.projectName.error}
              v-model={modalData.value.projectName.value}
            />
            <BCMSTextInput
              label="Git Repository URL"
              placeholder="Git repository URL"
              invalidText={modalData.value.repo.url.error}
              helperText="ex: git@github.com:user/repo.git"
              v-model={modalData.value.repo.url.value}
            />
            <BCMSTextInput
              label="Git Repository Name"
              placeholder="Git repository name"
              invalidText={modalData.value.repo.name.error}
              v-model={modalData.value.repo.name.value}
            />
            <BCMSTextInput
              label="Git Repository Branch"
              placeholder="Git repository branch"
              invalidText={modalData.value.repo.branch.error}
              v-model={modalData.value.repo.branch.value}
            />
            <BCMSTextAreaInput
              label="Private SSH Key"
              placeholder="Private SSH Key"
              invalidText={modalData.value.repo.sshKey.error}
              helperText="SSH key which have read access to the repository."
              onInput={(value) => {
                modalData.value.repo.sshKey.value = value;
              }}
            />
          </div>
        </BCMSModalWrapper>
      );
    };
  },
});
export default component;
