import { PostgresAdapter } from './adapter';
import { IRepository, KnexConfig } from './interfaces';
import knex from 'knex';
import { RequestTicket, DeadDrop } from './factory';
import { randomUUID } from 'crypto';

const adapter = new PostgresAdapter();
const orm = knex(new KnexConfig());
const repoBlank: IRepository = {
  id_local: '',
  id_dd: '',
  pass_hash: '',
  payload: '',
  updated_at: new Date(),
};

export default class Service {
  static async deleteDeadDrop(requestTicket: RequestTicket): Promise<DeadDrop | string> {
    const blankDeadDrop = new DeadDrop(requestTicket, repoBlank);
    const query: string = orm<IRepository>('dead_drop').where('id_dd', requestTicket.id).del().toString();
    const output = await adapter.write(query).then(async (status: boolean) => {
      if (status) {
        console.log(`DeadDrop: Object deleted.`);
        return 'Deaddrop destroyed.';
      } else {
        console.log(`DeadDrop: Error in deleting object ${requestTicket.id}`);
        return blankDeadDrop;
      }
    });

    return output;
  }

  static async editPayloadDeadDrop(requestTicket: RequestTicket, password: string): Promise<DeadDrop> {
    const repository: IRepository = {
      id_local: randomUUID(),
      id_dd: requestTicket.id,
      pass_hash: requestTicket.password,
      payload: requestTicket.payload,
      updated_at: new Date(),
    };

    const query: string = orm<IRepository>('dead_drop').where('id_dd', requestTicket.id).update(repository).toString();
    const output = await adapter.write(query).then(async () => {
      // TODO: add error handling here
      return await this.readDeadDrop(requestTicket, password);
    });

    return output;
  }

  static async readDeadDrop(requestTicket: RequestTicket, password: string): Promise<DeadDrop> {
    const query: string = orm.select().from<IRepository>('dead_drop').where('id_dd', requestTicket.id).toString();
    const raw = await adapter.read(query);
    const repo = raw ? (raw as IRepository) : repoBlank;

    const deadDrop = new DeadDrop(requestTicket, repo);
    await deadDrop.decryptDeadDrop(password);
    return deadDrop;
  }
  // TODO: Refactor newDeadDrop to return a Promise<bool> instead of void.
  static async newDeadDrop(requestTicket: RequestTicket, password: string): Promise<DeadDrop> {
    const repository: IRepository = {
      id_local: randomUUID(),
      id_dd: requestTicket.id,
      pass_hash: requestTicket.password,
      payload: requestTicket.payload,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const query: string = orm('dead_drop').insert(repository).toString();
    return adapter.write(query).then(async (passState: boolean) => {
      if (passState) {
        return this.readDeadDrop(requestTicket, password);
      } else {
        console.log('DeadDrop: Database Service error.');
        return new DeadDrop(requestTicket, repoBlank);
      }
    });
  }

  static async migratePrimary(): Promise<void> {
    const query: string = orm.schema
      .createTable('dead_drop', (table) => {
        table.uuid('id_local').primary();
        table.string('id_dd');
        table.string('pass_hash');
        table.text('payload');
        table.timestamp('created_at');
        table.timestamp('updated_at');
      })
      .toString();
    adapter.migrate(query);
  }

  static async drop(): Promise<void> {
    const queryDD: string = orm.schema.dropTableIfExists('dead_drop').toString();
    adapter.read(queryDD);
  }
}
