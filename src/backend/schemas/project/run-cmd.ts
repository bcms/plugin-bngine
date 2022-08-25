import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export const ProjectRunCmdFSDBSchema: ObjectSchema = {
  title: {
    __type: 'string',
    __required: false,
  },
  command: {
    __type: 'string',
    __required: true,
  },
  ignoreIfFail: {
    __type: 'boolean',
    __required: false,
  },
};

export const ProjectRunCmdMongoDBSchema = new Schema({
  title: String,
  command: String,
  ignoreIfFail: Boolean,
});
