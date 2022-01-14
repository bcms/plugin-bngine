import { createApp } from 'vue';
import type { BCMSGlobalScopeMain } from '@becomes/cms-ui/types';
import { cy, clickOutside, tooltip } from '@becomes/cms-ui/directives';
import { store } from './ui/store';
import App from './ui/app.vue';
import router from './ui/router';
import { CustomModals, registerModals } from './ui/modals';

declare global {
  interface Window {
    // Is declared in components/content/node-nav.vue
    editorNodeEnter(data: { element: HTMLElement }): void;
    editorNodeLeave(data: { element: HTMLElement }): void;

    bcms: BCMSGlobalScopeMain<CustomModals>;
    pluginName: string;
  }
}

window.pluginName = 'bcms-plugin---name';

registerModals();

const app = createApp(App);
app.directive('cy', cy);
app.directive('clickOutside', clickOutside);
app.directive('tooltip', tooltip);
app.use(store).use(router).mount(`#bcms_plugin_bcms-plugin---name`);
