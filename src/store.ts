import { MongoClient, type Db, type ClientSession } from 'mongodb';
import { blank, collections, seed, type State, type Entity } from './domain.js';

export interface Store { read(): Promise<State>; mutate<T>(fn: (state: State) => T | Promise<T>): Promise<T>; close(): Promise<void> }
// Memory storage is injected by unit tests only. Normal application startup uses MongoDB.
export class MemoryStore implements Store {
  private state = seed(); private tail: Promise<unknown> = Promise.resolve();
  async read() { await this.tail; return structuredClone(this.state); }
  mutate<T>(fn: (state: State) => T | Promise<T>): Promise<T> {
    const operation = this.tail.then(async () => { const draft = structuredClone(this.state); const result = await fn(draft); this.state = draft; return structuredClone(result); });
    this.tail = operation.catch(() => undefined); return operation;
  }
  async close() {}
}
export class MongoStore implements Store {
  constructor(private client: MongoClient, public db: Db) {}
  static async connect(uri: string) {
    const client = new MongoClient(uri); await client.connect(); const db = client.db();
    const store = new MongoStore(client, db);
    await db.collection('control').updateOne({ _id: 'writer' as never }, { $setOnInsert: { revision: 0 } }, { upsert:true });
    for (const name of collections) await db.collection(name).createIndex({ id:1 }, { unique:true });
    await db.collection('users').createIndex({ phone:1, role:1 }, { unique:true });
    await db.collection('orders').createIndex({ publicOrderId:1 }, { unique:true });
    await db.collection('orders').createIndex({ customerId:1, createdAt:-1 });
    await db.collection('idempotency').createIndex({ actorId:1, route:1, key:1 }, { unique:true });
    await db.collection('events').createIndex({ aggregateId:1, seq:1 });
    await db.collection('webhooks').createIndex({ providerEventId:1 }, { unique:true });
    await store.mutate(state => { if (!state.categories.length) Object.assign(state, seed());if(!state.promotions.length)state.promotions=seed().promotions; });
    return store;
  }
  private async load(session?: ClientSession) {
    const state = blank();
    // Sequential operations within a Mongo transaction are intentional.
    for (const name of collections) (state[name] as Entity[]) = await this.db.collection(name).find({}, { session, projection:{ _id:0 } }).toArray() as unknown as Entity[];
    return state;
  }
  async read() { return this.client.withSession(session => session.withTransaction(() => this.load(session), { readConcern:{ level:'snapshot' } })) as Promise<State>; }
  async mutate<T>(fn: (state: State) => T | Promise<T>): Promise<T> {
    return this.client.withSession(session => session.withTransaction(async () => {
      // Serializing the small pilot's mutations prevents write skew across assignment/ledger collections.
      await this.db.collection('control').updateOne({ _id:'writer' as never }, { $inc:{ revision:1 } }, { session });
      const state = await this.load(session); const before = structuredClone(state); const result = await fn(state);
      for (const name of collections) {
        const previous = new Map((before[name] as Entity[]).map(row => [row.id, JSON.stringify(row)]));
        const current = state[name] as Entity[];
        for (const row of current) if (previous.get(row.id) !== JSON.stringify(row)) await this.db.collection(name).replaceOne({ id:row.id }, row, { session, upsert:true });
        const ids = new Set(current.map(row=>row.id));
        for (const row of before[name]) if (!ids.has(row.id)) await this.db.collection(name).deleteOne({ id:row.id }, { session });
      }
      return result;
    }, { readConcern:{level:'snapshot'}, writeConcern:{w:'majority'} })) as Promise<T>;
  }
  async close() { await this.client.close(); }
}
