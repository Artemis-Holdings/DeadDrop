import { PostgresAdapter } from './adapter';
import { IRepository, KnexConfig } from './interfaces';
import knex from 'knex';
import { RequestTicket } from './factory';
import { request } from 'http';
import { randomUUID } from 'crypto';

const adapter = new PostgresAdapter();
const orm = knex(new KnexConfig());

export default class Service {
  static async newDeadDrop(requestTicket: RequestTicket): Promise<void> {
    const repository: IRepository = {
      id_local: randomUUID(),
      id_dd: requestTicket.id,
      pass_hash: requestTicket.password,
      payload: requestTicket.password,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const query: string = orm('dead_drop').insert(repository).toString();
    adapter.write(query).then(async (passState: boolean) => {
      if (passState){

        const readQ: string = orm.select('payload').from('dead_drop').where('id_dd', requestTicket.id).toString();
        const x = await adapter.read(readQ);
        console.log('read response:  ', x);
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

    // console.log('delete query: ', query);
    adapter.read(queryDD);
    // adapter.read(queryMS);
  }
}
