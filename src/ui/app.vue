<script lang="tsx">
import { defineComponent } from 'vue';
import RouterView from './router/view.vue';
import { Layout } from './components';

const component = defineComponent({
  setup() {
    return () => (
      <Layout
        sideNavItems={[
          {
            name: 'Home',
            hash: '',
          },
          {
            name: 'Page 2',
            hash: '#page-2',
          },
        ]}
      >
        <RouterView />
      </Layout>
    );
  },
});
export default component;
</script>
