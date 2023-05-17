import type { BCMSModalInputDefaults } from '@bcms-ui/types';
import {
  BCMSModalWrapper,
  BCMSTextAreaInput,
} from '@bcms-ui/components';
import { defineComponent, ref } from 'vue';

export interface TodoAddEditModalOutputData {
  description: string;
}

export interface TodoAddEditModalInputData
  extends BCMSModalInputDefaults<TodoAddEditModalOutputData> {
  description?: string;
}

interface ValidationType {
  value: string;
  error: string;
}

interface Data extends BCMSModalInputDefaults<TodoAddEditModalOutputData> {
  description: ValidationType;
}

export const TodoAddEditModal = defineComponent({
  setup() {
    const show = ref(false);
    const modalData = ref<Data>(getData());

    window.bcms.modal.custom.addEditTodo = {
      hide() {
        show.value = false;
      },
      show(data) {
        console.log(data);
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: TodoAddEditModalInputData): Data {
      const d: Data = {
        title: 'Add todo',
        description: {
          value: '',
          error: '',
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
        if (inputData.description) {
          d.description.value = inputData.description;
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
      window.bcms.modal.custom.addEditTodo.hide();
    }
    function done() {
      if (modalData.value.onDone) {
        if (!modalData.value.description.value) {
          modalData.value.description.error = 'Description is required';
          return;
        }
        modalData.value.description.error = '';

        const result = modalData.value.onDone({
          description: modalData.value.description.value,
        });
        if (result instanceof Promise) {
          result.catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        }
      }
      window.bcms.modal.custom.addEditTodo.hide();
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
            <BCMSTextAreaInput
              label="Description"
              placeholder="Description"
              invalidText={modalData.value.description.error}
              value={modalData.value.description.value}
              onInput={(value) => {
                modalData.value.description.value = value;
              }}
            />
          </div>
        </BCMSModalWrapper>
      );
    };
  },
});
