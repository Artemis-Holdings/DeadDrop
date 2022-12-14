import IgniteClient from 'apache-ignite-client';

const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const CacheConfiguration = IgniteClient.CacheConfiguration;
const SqlFieldsQuery = IgniteClient.SqlFieldsQuery;
const ObjectType = IgniteClient.ObjectType;
const SqlQuery = IgniteClient.SqlQuery;

const endpoint = '127.0.0.1:10800';
const cacheName = 'DEAD_DROP';

// TODO: Add authentication to DB from adapter.
export default class IgniteAdaptor {
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
