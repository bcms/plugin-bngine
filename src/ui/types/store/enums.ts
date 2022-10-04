// eslint-disable-next-line no-shadow
export enum StoreMutationTypes {
  project_set = 'project_set',
  project_remove = 'project_remove',

  job_set = 'job_set',
  job_remove = 'job_remove',
}

// eslint-disable-next-line no-shadow
export enum StoreGetterTypes {
  project_items = 'project_items',
  project_find = 'project_find',
  project_findOne = 'project_findOne',

  job_items = 'job_items',
  job_find = 'job_find',
  job_findOne = 'job_findOne',
}
