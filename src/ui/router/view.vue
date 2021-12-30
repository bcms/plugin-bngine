<script lang="tsx">
import { computed, defineComponent, PropType } from 'vue';
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router';

const component = defineComponent({
  props: {
    route: {
      type: Object as PropType<RouteLocationNormalizedLoaded>,
      required: true,
    },
    routes: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const onRoute = computed(() => {
      const hash = route.hash.replace('#', '');
      return props.routes.find((e) => e.path === hash);
    });

    return () => (
      <div>
        {onRoute.value ? (
          <onRoute.value.component />
        ) : (
          <div>Route does not exist</div>
        )}
      </div>
    );
  },
});
export default component;
</script>
