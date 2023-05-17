import type { BCMSModalServiceItem } from '@bcms-ui/types';
import type {
  TodoAddEditModalInputData,
  TodoAddEditModalOutputData,
} from './components';

export interface CustomModals {
  addEditTodo: BCMSModalServiceItem<
    TodoAddEditModalOutputData,
    TodoAddEditModalInputData
  >;
}

export function registerModals(): void {
  window.bcms.modal.register({ name: 'addEditTodo' });
}
