import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export const ProjectGitRepoFSDBSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  url: {
    __type: 'string',
    __required: true,
  },
  sshKey: {
    __type: 'string',
    __required: false,
  },
  branch: {
    __type: 'string',
    __required: true,
  },
};
export const ProjectGitRepoMongoDBSchema = new Schema({
  name: String,
  url: String,
  sshKey: String,
  branch: String,
});
