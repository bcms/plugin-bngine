import type { Job } from '@backend/job';
import { api } from '@ui/api';
import { BCMSModalWrapper } from '@ui/bcms-ui/components';
import type { BCMSModalInputDefaults } from '@ui/bcms-ui/types';
import type {
  BCMSJobDetailsModalInputData,
  BCMSJobDetailsModalOutputData,
} from '@ui/types';
import { defineComponent, ref } from 'vue';
import { JobInfo, JobPipe } from '../jobs';

interface Data extends BCMSModalInputDefaults<BCMSJobDetailsModalOutputData> {
  job?: Job;
  jobId: string;
}

export const JobDetailsModal = defineComponent({
  setup() {
    const show = ref(false);
    const modalData = ref<Data>(getData());

    window.bcms.modal.custom.jobDetails = {
      hide() {
        show.value = false;
      },
      show({ jobId }) {
        window.bcms.util.throwable(
          async () => {
            return await api.job.get({ id: jobId });
          },
          async (result) => {
            modalData.value.job = result;
          }
        );
        show.value = true;
      },
    };

    function getData(inputData?: BCMSJobDetailsModalInputData): Data {
      const d: Data = {
        title: 'Job details',
        job: undefined,
        jobId: '',
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
        if (inputData.jobId) {
          d.jobId = inputData.jobId;
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
      window.bcms.modal.custom.jobDetails.hide();
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
      window.bcms.modal.custom.jobDetails.hide();
    }

    return () => {
      return (
        <>
          <BCMSModalWrapper
            title={modalData.value.title}
            show={show.value}
            class="bcmsModal_jobDetailsModal"
            onDone={done}
            onCancel={cancel}
          >
            {
              // TODO: Add spinner
            }
            {modalData.value.job ? (
              <>
                <JobInfo job={modalData.value.job} />
                <div class="pb-5">
                  {modalData.value.job.pipe.map((pipe) => {
                    const job = modalData.value.job as Job;

                    return <JobPipe pipe={pipe} jobId={job._id} />;
                  })}
                </div>
              </>
            ) : (
              ''
            )}
          </BCMSModalWrapper>
        </>
      );
    };
  },
});
