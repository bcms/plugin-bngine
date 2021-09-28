<script lang="tsx">
import { BCMSLink } from '@becomes/cms-ui/components';
import { defineComponent, PropType } from '@vue/runtime-core';
import { LayoutSideNavItem } from '../types';

const component = defineComponent({
  props: {
    sideNavItems: Array as PropType<LayoutSideNavItem[]>,
  },
  setup(props, ctx) {
    const route = window.bcms.vue.router.currentRoute;

    return () => (
      <div class={`layout${props.sideNavItems ? ' layout--2col' : ''}`}>
        {props.sideNavItems ? (
          <div class="layout--sideNav">
            {props.sideNavItems.map((item) => {
              return (
                <BCMSLink
                  href={`${route.value.path}${item.hash}`}
                  onClick={item.onClick}
                >
                  {item.name}
                </BCMSLink>
              );
            })}
          </div>
        ) : (
          ''
        )}
        <div class="layout--content">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
      </div>
    );
  },
});
export default component;
</script>
