import { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface ProjectGitRepo {
  name: string;
  url: string;
  sshKey: string;
  branch: string;
}
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
    __required: true,
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
