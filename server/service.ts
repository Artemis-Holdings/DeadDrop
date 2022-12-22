import { PostgresAdapter } from './adapter';
import { IRepository, KnexConfig } from './interfaces';
import knex from 'knex';
import { RequestTicket, DeadDrop } from './factory';
import { randomUUID } from 'crypto';

const adapter = new PostgresAdapter();
const orm = knex(new KnexConfig());

export default class Service {
  static async readDeadDrop(requestTicket: RequestTicket, password: string): Promise<DeadDrop> {
    const query: string = orm.select().from<IRepository>('dead_drop').where('id_dd', requestTicket.id).toString();

    const repo = (await adapter.read(query)) as IRepository;
    const deadDrop = new DeadDrop(requestTicket, repo);
    console.log('DeadDrop-Dev DeadDrop Object: ', deadDrop);
    await deadDrop.decryptDeadDrop(password);
    return deadDrop;
  }

  static async newDeadDrop(requestTicket: RequestTicket): Promise<void> {
    const repository: IRepository = {
      id_local: randomUUID(),
      id_dd: requestTicket.id,
      pass_hash: requestTicket.password,
      payload: requestTicket.payload,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const query: string = orm('dead_drop').insert(repository).toString();
    adapter.write(query).then(async (passState: boolean) => {
      if (passState) {
        const readQ: string = orm.select('payload').from('dead_drop').where('id_dd', requestTicket.id).toString();
        // TODO: each successfull write needs to respond back to the client`
        await adapter.read(readQ);
        // const x: any = await adapter.read(readQ);
        // console.log('DeadDrop-Dev: read response:  ', x.rows[0]);
      } else {
        console.log('DeadDrop: Database Service error.');
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
