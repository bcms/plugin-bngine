<script lang="tsx">
import { computed, DefineComponent, defineComponent } from '@vue/runtime-core';
import { useRoute } from 'vue-router';
import Home from '../views/home.vue';
import Projects from '../views/projects.vue';

interface Route {
  component: DefineComponent<any, any, any>;
  hash: string;
}

const component = defineComponent({
  setup() {
    const routes: Route[] = [
      {
        component: Home,
        hash: '',
      },
      {
        component: Projects,
        hash: 'projects',
      },
    ];
    const route = useRoute();
    const onRoute = computed(() => {
      const hash = route.hash.replace('#', '');
      return routes.find((e) => e.hash === hash);
    });

    return () => (
      <>
        {onRoute.value ? (
          <onRoute.value.component />
        ) : (
          <div>Route does not exist</div>
        )}
      </>
    );
  },
});
export default component;
</script>
