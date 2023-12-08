import { Level } from 'level';
import { Job } from '@cbioportal-cohort-request/cohort-request-utils';
import { fetchAllRecords, insertRecord } from './repository';

export type JobDB = Level<string, Job>;

export function initJobDB(location = 'leveldb/jobs'): JobDB {
  return new Level<string, Job>(location, { valueEncoding: 'json' });
}

export function fetchAllJobs(jobDB?: JobDB): Promise<Job[]> {
  return fetchAllRecords(jobDB);
}

export function fetchJobById(
  jobId: string,
  jobDB?: JobDB
): Promise<Job | undefined> {
  return jobDB?.get(jobId) || Promise.resolve(undefined);
}

export function insertJob(job: Job, jobDB?: JobDB) {
  return insertRecord(job, (job) => job.jobId, jobDB);
}
