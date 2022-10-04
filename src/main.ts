import { createApp } from 'vue';
import type { BCMSGlobalScopeMain } from '@becomes/cms-ui/types';
import { cy, clickOutside, tooltip } from '@becomes/cms-ui/directives';
import { store } from './ui/store';
import App from './ui/app';
import router from './ui/router';
import { CustomModals, registerModals } from './ui/modals';
import type { BCMSBngineCustomSocketEvents } from './ui/api';
import './ui/assets/styles/_main.scss';

declare global {
  interface Window {
    // Is declared in components/content/node-nav.vue
    editorNodeEnter(data: { element: HTMLElement }): void;
    editorNodeLeave(data: { element: HTMLElement }): void;

    bcms: BCMSGlobalScopeMain<CustomModals, BCMSBngineCustomSocketEvents>;
    pluginName: string;
  }
}

window.pluginName = 'bcms-plugin---name';
window.bcms = window.parent.bcms;

registerModals();

const app = createApp(App, {
  namespace: 'plugin',
});
app.directive('cy', cy);
app.directive('clickOutside', clickOutside);
app.directive('tooltip', tooltip);
app.use(store).use(router).mount(`#bcms_plugin_bcms-plugin---name`);
