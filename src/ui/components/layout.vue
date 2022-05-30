<script lang="tsx">
import { BCMSManagerNav} from '@becomes/cms-ui/components';
import { defineComponent, PropType, Teleport, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LayoutSideNavItem } from '../types';

const component = defineComponent({
  props: {
    sideNavItems: Array as PropType<LayoutSideNavItem[]>,
  },
  setup(props, ctx) {
    const route = useRoute();
    const router = useRouter();
    const loaded = ref(false);

    onMounted(() => {
      loaded.value = true;
    });

    return () => (
      <>
        {loaded.value ? (
          <div id={route.hash}>
            <Teleport to="#plugin_nav">
              <BCMSManagerNav
                label="Build engine"
                actionText=""
                items={
                  props.sideNavItems
                    ? props.sideNavItems.map((item) => {
                        return {
                          name: item.name,
                          link: `/dashboard/plugin/bcms-plugin---name${item.path}`,
                          selected: route.hash === item.path,
                          onClick() {
                            router.push(item.path);
                          },
                        };
                      })
                    : []
                  // [
                  //   {
                  //     name: 'Builds',
                  //     link: '/dashboard/plugin/bcms-plugin---name',
                  //     selected: route.hash === '',
                  //     onClick() {
                  //       router.push('');
                  //     },
                  //   },
                  //   {
                  //     name: 'Projects',
                  //     link: '/dashboard/plugin/bcms-plugin---name#projects',
                  //     selected: route.hash === '#projects',
                  //     onClick() {
                  //       router.push('#projects');
                  //     },
                  //   },
                  // ]
                }
                onAction={() => {
                  // Do nothing
                }}
              />
            </Teleport>
            <div>{ctx.slots.default ? ctx.slots.default() : ''}</div>
          </div>
        ) : (
          <div>Loading</div>
        )}
      </>
    );
  },
});
export default component;
</script>
