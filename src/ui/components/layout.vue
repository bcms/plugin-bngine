<script lang="tsx">
import { BCMSManagerNav } from '@becomes/cms-ui/components';
import { defineComponent, PropType, Teleport } from '@vue/runtime-core';
import { useRoute, useRouter } from 'vue-router';
import { LayoutSideNavItem } from '../types';

const component = defineComponent({
  props: {
    sideNavItems: Array as PropType<LayoutSideNavItem[]>,
  },
  setup(_props, ctx) {
    const route = useRoute();
    const router = useRouter();

    return () => (
      <div id={route.hash}>
        <Teleport to="#managerNav">
          <BCMSManagerNav
            label="Build engine"
            actionText=""
            items={[
              {
                name: 'Builds',
                link: '/dashboard/plugin/bcms-plugin---name',
                selected: route.hash === '',
                onClick() {
                  router.push('');
                },
              },
              {
                name: 'Projects',
                link: '/dashboard/plugin/bcms-plugin---name#projects',
                selected: route.hash === '#projects',
                onClick() {
                  router.push('#projects');
                },
              },
            ]}
            onAction={() => {
              // Do nothing
            }}
          />
        </Teleport>
        <div>{ctx.slots.default ? ctx.slots.default() : ''}</div>
      </div>
    );
  },
});
export default component;
</script>
