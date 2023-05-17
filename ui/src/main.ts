import { createApp } from 'vue';
import { cy, clickOutside, tooltip } from '@bcms-ui/directives';
import { App } from './app';
import router from './router';
import '@becomes/cms-ui/styles/_main.scss';
import './styles/_main.scss';
import { CustomModals, registerModals } from './modals';
import type { BCMSGlobalScopeMain } from '@bcms-ui/types';

declare global {
  interface Window {
    editorNodeEnter(data: { element: HTMLElement }): void;
    editorNodeLeave(data: { element: HTMLElement }): void;

    bcms: BCMSGlobalScopeMain<CustomModals>;
    pluginName: string;
  }
}

window.pluginName = 'bcms-plugin---name';
window.bcms = window.parent.bcms;

registerModals();

const app = createApp(App);
app.directive('cy', cy);
app.directive('clickOutside', clickOutside);
app.directive('tooltip', tooltip);
app.use(router).mount(`#bcms_plugin_bcms-plugin---name`);
