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
  client = 'mysql';
  connection = {
    database: '',
    user: '',
    password: '',
  } as IKnexConfigDeployment;
}
