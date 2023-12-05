import { Level } from 'level';

export function fetchAllRecords<K, V>(db?: Level<K, V>) {
  return db?.values().all() || Promise.resolve([]);
}
