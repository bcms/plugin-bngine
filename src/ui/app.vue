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
            name: 'Builds',
            hash: '',
          },
          {
            name: 'Projects',
            hash: '#projects',
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
