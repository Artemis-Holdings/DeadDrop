import { IgniteAdaptor } from './adapter';
import { KnexConfig } from './interfaces';
import knex from 'knex';

const knexConfig = new KnexConfig();
const adapter = new IgniteAdaptor();

const orm = knex(knexConfig);

export class Service {
  async migrate(): Promise<void> {
    const query: string = orm.schema
      .createTable('dead_drop', (table) => {
        table.uuid('id').primary();
        table.string('dd_hash').notNullable();
        table.string('pass_hash').notNullable();
      })
      .toString();
    console.log('migration query: ', query);
    adapter.create(query);
    // const result: string | PromiseLike<string> = new Promise((resolve) => {
    //   timeoutId = setTimeout(() => {
    //     resolve(query);
    //   }, 10);
  }

  async drop(): Promise<void> {
    const query: string = orm.schema.dropTableIfExists('dead_drop').toString();
    console.log('delete query: ', query);
    adapter.read(query);
    // const result: string | PromiseLike<string> = new Promise((resolve) => {
    //   timeoutId = setTimeout(() => {
    //     resolve(query);
    //   }, 10);
  }
}
