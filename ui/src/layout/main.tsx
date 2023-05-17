import { BCMSManagerNav } from '@bcms-ui/components';
import { defineComponent, Teleport } from 'vue';
import { useRoute } from 'vue-router';

const component = defineComponent({
  setup(_props, ctx) {
    const route = useRoute();

    return () => (
      <div id={route.path}>
        <Teleport to="#plugin_nav">
          <BCMSManagerNav
            class="pluginNav"
            style="left: 0 !important;"
            label="bcms-plugin---name"
            items={[
              {
                name: 'Home',
                link: '/',
                selected: route.path === '/',
              },
              {
                name: 'Todo',
                link: '/todo',
                selected: route.path === '/todo',
              },
              {
                name: 'Todo from entries',
                link: '/todo-from-entries',
                selected: route.path === '/todo-from-entries',
              },
            ]}
          />
        </Teleport>
        <div class="desktop:relative desktop:pl-[200px] lg:pl-[260px] px-5 desktop:py-10">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
      </div>
    );
  },
});
export default component;
