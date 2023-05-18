import { computed, defineComponent, onUnmounted, PropType, ref } from 'vue';
import { escape } from 'html-escaper';
import AnsiToHtml from 'ansi-to-html';
import type { JobPipe as JobPipeType } from '@backend/job';
import { api, JobSocketEventName, JobSocketEventPipeUpdate } from '@ui/api';
import { BCMSIcon } from '@ui/bcms-ui/components';

const converter = new AnsiToHtml();

export const JobPipe = defineComponent({
  props: {
    pipe: {
      type: Object as PropType<JobPipeType>,
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    inRunningJob: Boolean,
  },
  setup(props) {
    let isFirstLogFetch = true;
    const showOutput = ref(false);

    const output = computed(
      () =>
        `${
          log.value.stdout
            ? `<pre>${converter.toHtml(escape(log.value.stdout))}</pre>`
            : // ? log.value.stdout
              //     .split('\n')
              //     .map((txt) => parseText(txt, 'out'))
              //     .join('')
              ''
        } ${
          log.value.stderr
            ? `<div style="color: red; font-weight: bold; margin: ${
                log.value.stdout ? '30px' : '0'
              } 0 10px 0;">
                  ➤ ERRORS ↴↴↴
              </div>
              <pre style="border-left: 1px solid red; padding-left: 13px">${converter.toHtml(
                escape(log.value.stderr)
              )}</pre>`
            : // ? log.value.stderr
              //     .split('\n')
              //     .map((txt) => parseText(txt, 'err'))
              //     .join('')
              ''
        }`
    );

    const log = ref({
      stdout: '',
      stderr: '',
    });

    const pipeUpdateEventUnsub = window.bcms.sdk.socket.subscribe(
      JobSocketEventName.JOB_PIPE_UPDATE,
      async (event) => {
        const data = event as JobSocketEventPipeUpdate;
        if (data.pid === props.pipe.id) {
          if (data.stdout) {
            log.value.stdout += data.stdout;
          } else if (data.stderr) {
            log.value.stderr += data.stderr;
          }
        }
      }
    );

    // function parseText(txt: string, type: 'err' | 'out') {
    //   return `
    //   <span class="whitespace-nowrap ${type === 'err' ? 'text-red' : ''}">
    //     ${escape(txt).replace(/ /g, '&nbsp;')}
    //   </span>
    //   <br />
    // `;
    // }

    function parseMillis(millis: number) {
      if (millis > 60000) {
        return `${parseInt('' + millis / 1000 / 60)}m ${
          parseInt('' + millis / 1000) - parseInt('' + millis / 1000 / 60) * 60
        }s`;
      } else {
        return `${parseInt(`${millis / 1000}`, 10)}s`;
      }
    }

    async function getLogs() {
      if (isFirstLogFetch && !props.inRunningJob) {
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
            showOutput.value = true;
          }
        );
      } else {
        showOutput.value = !showOutput.value;
      }
    }

    onUnmounted(() => {
      pipeUpdateEventUnsub();
    });

    return () => (
      <div
        class={`mb-2.5 ${
          showOutput.value ? 'shadow-cardLg rounded-2xl overflow-hidden' : ''
        }`}
      >
        <button
          class={`text-dark flex items-center text-left w-full p-4 font-medium ${
            showOutput.value
              ? 'bg-light rounded-t-2xl dark:bg-dark dark:bg-opacity-20'
              : 'bg-white rounded-2xl shadow-cardLg dark:bg-dark dark:bg-opacity-20'
          } dark:text-light ${
            props.inRunningJob ? 'dark:bg-grey dark:bg-opacity-20' : ''
          }`}
          onClick={getLogs}
        >
          <div
            class={`transition-transform duration-300 mr-2.5 ${
              showOutput.value ? 'rotate-45' : ''
            }`}
          >
            <BCMSIcon
              src="/plus"
              class={`w-6 h-6 fill-current leading-normal`}
            />
          </div>
          <span
            class={`mr-auto ${
              props.pipe.status === 'SUCCESS'
                ? 'text-green'
                : props.pipe.status === 'FAIL' && props.pipe.ignoreIfFail
                ? 'text-yellow dark:text-grey'
                : props.pipe.status === 'FAIL'
                ? 'text-red'
                : props.pipe.status === 'QUEUE'
                ? 'text-pink dark:text-yellow'
                : 'text-dark dark:text-light'
            }`}
          >
            {props.pipe.title}
          </span>
          <span class="ml-2.5">{parseMillis(props.pipe.timeToExec)}</span>
        </button>
        {showOutput.value && (
          <div
            class="max-h-[500px] overflow-auto text-[10px] leading-normal tracking-widest p-5 bg-white font-mono dark:bg-grey dark:bg-opacity-30 dark:text-light"
            v-html={output.value}
          />
        )}
      </div>
    );
  },
});
