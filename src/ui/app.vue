<script lang="tsx">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { BCMSAddProjectModal, BCMSJobDetailsModal, Layout } from './components';
import BCMSPluginRouter from './router/view.vue';
import Home from './views/home.vue';
import Projects from './views/projects.vue';

const component = defineComponent({
  setup() {
    const route = useRoute();
    const routes = [
      {
        name: 'Builds',
        path: '',
        component: Home,
      },
      {
        name: 'Projects',
        path: 'projects',
        component: Projects,
      },
    ];

    return () => (
      <>
        <Layout sideNavItems={routes}>
          <BCMSPluginRouter route={route} routes={routes} />
        </Layout>
        <BCMSAddProjectModal />
        <BCMSJobDetailsModal />
      </>
    );
  },
});
export default component;
</script>
