import { createApp } from 'vue';
import type { BCMSGlobalScopeMain } from '@becomes/cms-ui/types';
import { cy, clickOutside, tooltip } from '@becomes/cms-ui/directives';
import { store } from './ui/store';
import router from './ui/router';
import App from './ui/app.vue';
import './ui/assets/styles/main.scss';

declare global {
  interface Window {
    bcms: BCMSGlobalScopeMain;
    pluginName: string;
  }
}

window.pluginName = 'bcms-plugin---name';

const app = createApp(App);
app.directive('cy', cy);
app.directive('clickOutside', clickOutside);
app.directive('tooltip', tooltip);
app.use(store).use(router).mount(`#bcms_plugin_bcms-plugin---name`);
