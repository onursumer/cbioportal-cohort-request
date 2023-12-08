import { Level } from 'level';

export function fetchAllRecords<K, V>(db?: Level<K, V>): Promise<V[]> {
  return db?.values().all() || Promise.resolve([]);
}
