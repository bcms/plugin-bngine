<script lang="tsx">
import { defineComponent, onMounted } from '@vue/runtime-core';
import { useApi } from '../api';

const component = defineComponent({
  setup() {
    const api = useApi();

    async function startJob() {
      await window.bcms.util.throwable(
        async () => {
          return await api.job.start({
            projectId: '61cc820121888d3e0fed932b',
            branch: 'next',
          });
        },
        async (result) => {
          console.log(result);
        }
      );
    }

    onMounted(async () => {
      await window.bcms.util.throwable(async () => {
        return await api.job.get('61cc87d592954ad146a2c9b0');
      });
    });

    return () => (
      <div>
        <button onClick={startJob}>CLICK</button>
      </div>
    );
  },
});
export default component;
</script>
