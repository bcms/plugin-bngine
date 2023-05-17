import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import { BCMSPluginLayout } from './bcms-ui/components';
import { TodoAddEditModal } from './components';
import { Layout } from './layout';

export const App = defineComponent({
  setup() {
    return () => (
      <>
        <div id="plugin_nav" />
        <BCMSPluginLayout>
          <Layout>
            <RouterView />
          </Layout>

          <TodoAddEditModal />
          <div id="bcmsSelectList" />
          <div id="bcmsOverflowList" />
        </BCMSPluginLayout>
      </>
    );
  },
});
