import IgniteClient from 'apache-ignite-client';
import pg from 'pg';
import { Client } from 'pg';
import { IRepository } from './interfaces';

export class PostgresAdapter {
  connectionObject: { host: string; port: number; user: string; password: string; database: string };
  bootstrapObject: { host: string; port: number; user: string; password: string };
  pool: pg.Pool;

  constructor() {
    this.connectionObject = {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'dead_drop',
    };

    this.bootstrapObject = {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
    };

    this.pool = new pg.Pool(this.connectionObject);
  }

  public async read(query: string): Promise<unknown> {
    try {
      return new Promise((resolve) => {
        this.pool
          .query(query)
          .then((answer) => {
            resolve(answer.rows[0] as unknown);
          })
          .catch((error) => {
            console.error('Error: ', error);
            resolve(error);
          });
      });
    } catch {
      return new Promise((resolve) => {
        const blank = '';
        resolve(blank);
      });
    }
  }

  // returns pass or fail boolean
  public async write(query: string): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        this.pool
          .query(query)
          .then(() => {
            resolve(true);
          })
          .catch((error) => {
            console.error('Error: ', error);
            resolve(false);
          });
      });
    } catch {
      return new Promise((resolve) => {
        resolve(false);
      });
    }
  }

  public async migrate(query: string) {
    try {
      this.bootstrap().then(() => {
        this.createTable(query);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log('Catastrophic failiure.');
      console.error(error);
    }
  }

  private async createTable(query: string): Promise<boolean> {
    const bootstrap = new pg.Client(this.connectionObject);
    bootstrap.connect();

    return new Promise((resolve) => {
      bootstrap
        .query(query)
        .then(() => {
          console.log('DeadDrop :: Adapter created table created.');
          resolve(true);
        })
        .catch(() => {
          console.log('DeadDrop :: Adapter found table already existed.');
          resolve(false);
        })
        .then(() => bootstrap.end());
    });
  }

  private async bootstrap(): Promise<boolean> {
    const bootstrap = new pg.Client(this.bootstrapObject);
    bootstrap.connect();

    return new Promise((resolve) => {
      bootstrap
        .query(`CREATE DATABASE ${this.connectionObject.database};`)
        .then(() => {
          console.log(`DeadDrop :: Adapter created DB titled ${this.connectionObject.database}`);
          resolve(true);
        })
        .catch(() => {
          console.log(`DeadDrop :: Adapter found an existing DB called ${this.connectionObject.database}`);
          resolve(false);
        })
        .then(() => bootstrap.end());
    });
  }
}

// IGNITE
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const CacheConfiguration = IgniteClient.CacheConfiguration;
const SqlFieldsQuery = IgniteClient.SqlFieldsQuery;
const ObjectType = IgniteClient.ObjectType;
const SqlQuery = IgniteClient.SqlQuery;
const endpoint = '127.0.0.1:10800';
const cacheName = 'DEAD_DROP';
// TODO: Add authentication to DB from adapter.
export class IgniteAdaptor {
  async read(query: string): Promise<void> {
    try {
      const igniteClient = new IgniteClient(this.onStateChange.bind(this));
      await igniteClient.connect(new IgniteClientConfiguration(endpoint));

      const igniteCache = igniteClient.getCache(cacheName);
      const conditionedQuery = new SqlFieldsQuery(query);
      const cursor = await igniteCache.query(conditionedQuery);
      await cursor.getAll().then(() => {
        // console.log('query complete: ');
      });
    } catch (error: unknown) {
      console.warn('DeadDrop: Query Error within adaptor.');
      console.error(error);
    }
  }

  async create(query: string): Promise<void> {
    const igniteClient = new IgniteClient(this.onStateChange.bind(this));

    try {
      await igniteClient.connect(new IgniteClientConfiguration(endpoint));

      const cache = await igniteClient.getOrCreateCache(cacheName, new CacheConfiguration().setSqlSchema('PUBLIC'));

      (await cache.query(new SqlFieldsQuery(query))).getAll().then(() => {
        // console.log('query complete');
      });
    } catch (error: unknown) {
      console.warn('DeadDrop: Query Error within adaptor.');
      console.error(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onStateChange(state: any, reason: any) {
    if (state === IgniteClient.STATE.CONNECTED) {
      console.log('DeadDrop: DB Connection Started');
    } else if (state === IgniteClient.STATE.DISCONNECTED) {
      console.log('DeadDrop: DB Connection Halted');
      if (reason) {
        console.log(reason);
      }
    }
  }
}
