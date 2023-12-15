import { Level } from 'level';

export function fetchAllRecords<K, V>(db?: Level<K, V>): Promise<V[]> {
  return db?.values().all() || Promise.resolve([]);
}

export function insertRecord<K, V>(
  record: V,
  primaryKeyGenerator: (record: V) => K,
  db?: Level<K, V>
) {
  const primaryKey = primaryKeyGenerator(record);
  return db?.put(primaryKey, record) || Promise.resolve();
}
