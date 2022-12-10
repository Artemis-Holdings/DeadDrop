import IgniteClient from 'apache-ignite-client';

const ObjectType = IgniteClient.ObjectType;
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const CacheConfiguration = IgniteClient.CacheConfiguration;
const SqlFieldsQuery = IgniteClient.SqlFieldsQuery;
const SqlQuery = IgniteClient.SqlQuery;

const endpoint = '20.7.218.203:10800';

export class IgniteAdaptor {
  //
  async read(query: string, cacheName: string) {
    try {
      const igniteClient = new IgniteClient(this.onStateChange.bind(this));

      await igniteClient.connect(new IgniteClientConfiguration(endpoint));
      const igniteCache = igniteClient.getCache(cacheName);

      const conditionedQuery = new SqlFieldsQuery(query);

      const cursor = await igniteCache.query(conditionedQuery);

      const output = await cursor.getAll();

      return output;
    } catch (error: unknown) {
      console.warn('DeadDrop: Query Error within adaptor.');
      console.error(error);
    }
  }

  async create(query: string) {
    const igniteClient = new IgniteClient(this.onStateChange.bind(this));

    try {
      await igniteClient.connect(new IgniteClientConfiguration(endpoint));

      const cache = await igniteClient.getOrCreateCache('DEAD_DROP', new CacheConfiguration().setSqlSchema('PUBLIC'));

      (await cache.query(new SqlFieldsQuery(query))).getAll().then(() => {
        console.log('DeadDrop: DB Item Created');
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
