<script lang="tsx">
import { escape } from 'html-escaper';
import { BCMSIcon } from '@becomes/cms-ui/components';
import {
  computed,
  defineComponent,
  onUnmounted,
  PropType,
  ref,
} from 'vue';
import {
  JobSocketEventName,
  JobSocketEventPipeUpdate,
  useApi,
} from '../../api';
import { JobPipe, JobStatus } from '../../../backend/types';

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
    inRunningJob: Boolean,
  },
  setup(props) {
    const api = useApi();

    let isFirstLogFetch = true;
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

    function parseText(txt: string, type: 'err' | 'out') {
      return `
      <span class="whitespace-nowrap ${type === 'err' ? 'text-red' : ''}">
        ${escape(txt).replace(/ /g, '&nbsp;')}
      </span>
      <br />
    `;
    }

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
              ? 'bg-light rounded-t-2xl'
              : 'bg-white rounded-2xl shadow-cardLg'
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
              props.pipe.status === JobStatus.SUCCESS
                ? 'text-green'
                : props.pipe.status === JobStatus.FAIL &&
                  props.pipe.ignoreIfFail
                ? 'text-yellow'
                : props.pipe.status === JobStatus.FAIL
                ? 'text-red'
                : props.pipe.status === JobStatus.QUEUE
                ? 'text-pink'
                : 'text-dark'
            }`}
          >
            {props.pipe.title}
          </span>
          <span class="ml-2.5">{parseMillis(props.pipe.timeToExec)}</span>
        </button>
        {showOutput.value && (
          <div
            class="max-h-[500px] overflow-auto text-[10px] leading-normal tracking-widest p-5 bg-white font-mono"
            v-html={output.value}
          />
        )}
      </div>
    );
  },
});

export default component;
</script>
