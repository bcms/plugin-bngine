<script lang="tsx">
import { escape } from 'html-escaper';
import { BCMSIcon } from '@becomes/cms-ui/components';
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  ref,
} from '@vue/runtime-core';
import { useApi } from '../../api';
import { JobPipe, JobStatus } from '../../../backend/types';
import { useStore } from '../../store';
import { StoreMutationTypes } from '../../types';

const component = defineComponent({
  props: {
    pipe: {
      type: Object as PropType<JobPipe>,
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const api = useApi();
    const store = useStore();
    const showOutput = ref(false);
    const output = computed(
      () =>
        `${
          log.value.stdout
            ? log.value.stdout
                .split('\n')
                .map((txt) => parseText(txt, 'out'))
                .join('')
            : ''
        } ${
          log.value.stderr
            ? log.value.stderr
                .split('\n')
                .map((txt) => parseText(txt, 'err'))
                .join('')
            : ''
        }`
    );
    const log = ref({
      stdout: '',
      stderr: '',
    });
    let isFirstLogFetch = true;

    function parseText(txt: string, type: 'err' | 'out') {
      return `
      <span class="whitespace-nowrap ${type === 'err' ? 'text-red' : ''}">
        ${escape(txt).replace(/ /g, '&nbsp;')}
      </span>
      <br />
    `;
    }

    onMounted(() => {
      // if (window.bcms.sdk.socket.self) {
      //   window.bcms.sdk.socket.self.on(
      //     'JOB_PIPE_UPDATE',
      //     async (data: {
      //       j: string;
      //       pid: string;
      //       stdout?: string;
      //       stderr?: string;
      //     }) => {
      //       if (data.pid === props.pipe.id) {
      //         if (data.stdout) {
      //           log.value.stdout += data.stdout;
      //         } else {
      //           log.value.stderr += data.stderr;
      //         }
      //       }
      //     }
      //   );
      //   window.bcms.sdk.socket.self.on(
      //     'JOB_PIPE_COMPLETE',
      //     async (data: { j: string; p: JobPipe }) => {
      //       if (data.p.id === props.pipe.id) {
      //         await window.bcms.util.throwable(
      //           async () => {
      //             return await api.job.get({
      //               id: data.j,
      //               skipCache: true,
      //             });
      //           },
      //           async (result) => {
      //             store.commit(StoreMutationTypes.job_set, result);
      //           }
      //         );
      //       }
      //     }
      //   );
      // }
    });

    async function getLogs() {
      if (isFirstLogFetch) {
        isFirstLogFetch = false;
        await window.bcms.util.throwable(
          async () => {
            return await api.job.getPipeLogs({
              jobId: props.jobId,
              pipeId: props.pipe.id,
            });
          },
          async (result) => {
            log.value = result;
            showOutput.value = true;
          },
          async (error) => {
            const err = error as Error;

            log.value = {
              stdout: '',
              stderr: 'Failed to get logs: ' + err.message,
            };
          }
        );
      } else {
        showOutput.value = !showOutput.value;
      }
    }

    return () => (
      <div class="pipe">
        <div
          class={`mb-2.5 ${
            props.pipe.status === JobStatus.SUCCESS ? 'bg-green' : 'bg-yellow'
          }`}
        >
          <button
            class="text-light flex items-center text-left w-full p-1.5 pr-5"
            onClick={getLogs}
          >
            <BCMSIcon
              src="/plus"
              class={`w-6 h-6 text-light fill-current mr-1.5 transition-transform duration-300 ${
                showOutput.value ? 'rotate-45' : ''
              }`}
            />
            <span class="mr-auto leading-normal font-medium">
              {props.pipe.title}
            </span>
            <span class="leading-normal font-medium ml-2.5">
              {props.pipe.timeToExec}
            </span>
          </button>
          {showOutput.value && (
            <div
              class={`max-h-[500px] overflow-auto text-[10px] leading-normal tracking-widest p-5 border bg-light font-mono border-b-0 ${
                props.pipe.status === JobStatus.SUCCESS
                  ? 'border-green'
                  : props.pipe.status === JobStatus.FAIL &&
                    props.pipe.ignoreIfFail
                  ? 'bg-yellow'
                  : props.pipe.status === JobStatus.FAIL
                  ? 'border-red'
                  : 'border-pink'
              }`}
              v-html={output.value}
            />
          )}
        </div>
      </div>
    );
  },
});

export default component;
</script>
