import type { Project } from '@backend/project';
import { api } from '@ui/api';
import { BCMSButton, BCMSModalWrapper } from '@ui/bcms-ui/components';
import type { BCMSModalInputDefaults } from '@ui/bcms-ui/types';
import { store } from '@ui/store';
import type {
  BCMSOtherProjectsModalInputData,
  BCMSOtherProjectsModalOutputData,
} from '@ui/types';
import { computed, defineComponent, ref } from 'vue';

type Data = BCMSModalInputDefaults<BCMSOtherProjectsModalOutputData>;

const component = defineComponent({
  setup() {
    const show = ref(false);
    const modalData = ref<Data>(getData());

    const projects = computed(() => {
      return store.project.items().slice(1);
    });

    window.bcms.modal.custom.otherProjects = {
      hide() {
        show.value = false;
      },
      show(inputData) {
        modalData.value = getData(inputData);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSOtherProjectsModalInputData): Data {
      const d: Data = {
        title: 'Other Projects',
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
      window.bcms.modal.custom.otherProjects.hide();
    }
    function done() {
      if (modalData.value.onDone) {
        const result = modalData.value.onDone();
        if (result instanceof Promise) {
          result.catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        }
      }
      window.bcms.modal.custom.otherProjects.hide();
    }

    async function startBuild(project: Project) {
      if (
        await window.bcms.confirm(
          'Start build',
          `Are you sure you want to build ${project.name}?`
        )
      ) {
        await window.bcms.util.throwable(
          async () => {
            await api.job.start({
              projectId: project._id,
            });
          },
          async () => {
            done();
          }
        );
      }
    }

    return () => {
      return (
        <BCMSModalWrapper
          title={modalData.value.title}
          show={show.value}
          onDone={cancel}
          onCancel={cancel}
        >
          {projects.value.map((project) => {
            return (
              <div class="flex items-center justify-between mb-3">
                <div class="font-medium dark:text-light">{project.name}</div>
                <BCMSButton
                  kind="secondary"
                  onClick={() => startBuild(project)}
                >
                  Build
                </BCMSButton>
              </div>
            );
          })}
        </BCMSModalWrapper>
      );
    };
  },
});
export default component;
