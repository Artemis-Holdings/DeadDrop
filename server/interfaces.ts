import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';

interface IKnexConfig {
  client: string;
  connection: IKnexConfigDeployment;
}

interface IKnexConfigDeployment {
  database: string;
  user: string;
  password: string;
}

export class KnexConfig implements IKnexConfig {
  client = 'pg';
  connection = {
    database: '',
    user: '',
    password: '',
  } as IKnexConfigDeployment;
}

// The reason we use the action code to number translation is for ease of update in furture releases.
// New actions can be modified here, and a new switch is added on the controller.
// This reduces the overhead.
export enum Actions {
  MSG = 1, // edit message
  PSW = 2, // change password
  TITLE = 3, // edit title
  READ = 4, // read only
  CREATE = 5, // create a dead drop
  DELETE = 6, // delete a dead drop
}

export interface IUserRequest {
  id?: Promise<string> | string;
  title: string;
  password: string;
  payload: string;
  action: Actions;
}

export interface IDeadDrop {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRepository {
  id_local?: string;
  id_dd: string | Promise<string>;
  pass_hash: string;
  payload: string;
  created_at: Date;
  updated_at: Date;
}
