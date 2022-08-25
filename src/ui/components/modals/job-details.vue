<script lang="tsx">
import type { BCMSModalInputDefaults } from '@becomes/cms-ui/types';
import type {
  BCMSJobDetailsModalInputData,
  BCMSJobDetailsModalOutputData,
} from '../../types';
import { BCMSModalWrapper } from '@becomes/cms-ui/components';
import { defineComponent, ref } from 'vue';
import { BCMSJobsInfo, BCMSJobsPipe } from '../jobs';
import type { Job } from '../../../backend/types';
import { useApi } from '../../api';

interface Data extends BCMSModalInputDefaults<BCMSJobDetailsModalOutputData> {
  job?: Job;
  jobId: string;
}

const component = defineComponent({
  setup() {
    const api = useApi();
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
                <BCMSJobsInfo job={modalData.value.job} />
                <div class="pb-5">
                  {modalData.value.job.pipe.map((pipe) => {
                    const job = modalData.value.job as Job;

                    return <BCMSJobsPipe pipe={pipe} jobId={job._id} />;
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
export default component;
</script>
