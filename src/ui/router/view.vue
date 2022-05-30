<script lang="tsx">
import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
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
      const hash = route.hash;
      return props.routes.find((e) => e.path === hash);
    });
    const loaded = ref(false)

    onMounted(() => {
      loaded.value = true;
    })

    return () => (
      <div>
        {onRoute.value && loaded.value ? (
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
