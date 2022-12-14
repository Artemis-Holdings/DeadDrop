import IgniteAdaptor from './adapter';
import { KnexConfig } from './interfaces';
import knex from 'knex';

const knexConfig = new KnexConfig();
const adapter = new IgniteAdaptor();

const orm = knex(knexConfig);

export default class Service {
  static async migratePrimary(): Promise<void> {
    const query: string = orm.schema
      .createTable('dead_drop', (table) => {
        table.uuid('id_local').primary();
        table.string('id_dd');
        table.string('pass_hash');
        table.text('message');
        table.timestamp('created_at');
        table.timestamp('updated_at');
      })
      .toString();
    console.log('migrate query: ', query);
    adapter.create(query);
  }
  // static async migrateMessage(): Promise<void> {
  //   const query: string = orm.schema
  //     .createTable('messages', (table) => {
  //       table.uuid('id_local').primary();
  //       table.text('message');
  //       table.string('id_dd').references('id_dd');
  //       table.timestamp('created_at');
  //       table.timestamp('updated_at');
  //     })
  //     .toString();
  //   adapter.create(query);
  // }

  async drop(): Promise<void> {
    const queryDD: string = orm.schema.dropTableIfExists('dead_drop').toString();

    const queryMS: string = orm.schema.dropTableIfExists('messages').toString();
    // console.log('delete query: ', query);
    adapter.read(queryDD);
    adapter.read(queryMS);
  }
}
