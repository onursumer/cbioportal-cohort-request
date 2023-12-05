import { Level } from 'level';
import { Job } from '@cbioportal-cohort-request/cohort-request-utils';
import { fetchAllRecords } from './repository';

export type JobDB = Level<string, Job>;

export function initJobDB(location = 'leveldb/jobs'): JobDB {
  return new Level<string, Job>(location, { valueEncoding: 'json' });
}

export function fetchAllJobs(jobDB: JobDB) {
  return fetchAllRecords(jobDB);
}

export function fetchJobById(jobDB: JobDB, jobId: string) {
  return jobDB.get(jobId);
}
