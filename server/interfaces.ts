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
  client = 'sqlite3';
  connection = {
    database: '',
    user: '',
    password: '',
  } as IKnexConfigDeployment;
}

export enum Actions {
  MSG = 1, // edit message
  PSW = 2, // change password
  TITLE = 3, // edit title
  READ = 4, // read only
  NEW = 5, // create a dead drop
}

export interface IUserRequest {
  id: Promise<string> | string;
  title: string;
  password: string;
  payload: string;
  action: Actions;
}

export interface IDeadDrop {
  title: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}
