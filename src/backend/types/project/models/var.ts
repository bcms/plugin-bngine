import { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface ProjectVar {
  key: string;
  value: string;
}
export const ProjectVarFSDBSchema: ObjectSchema = {
  key: {
    __type: 'string',
    __required: true,
  },
  value: {
    __type: 'string',
    __required: true,
  },
};
export const ProjectVarMongoDBSchema = new Schema({
  key: String,
  value: String,
});
