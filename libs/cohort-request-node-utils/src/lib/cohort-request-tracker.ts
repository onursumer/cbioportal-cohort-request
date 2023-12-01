import { Level } from 'level';
import { Dictionary } from 'lodash';
import {
  CohortRequest,
  CohortRequestStatus,
  Event,
  getRequestStatusFromEvents,
  Job,
  QueueItem,
} from '@cbioportal-cohort-request/cohort-request-utils';
import { persistFiles } from './cohort-request-process';
import { ExecResult } from './execute-command';

type JobDB = Level<string, Job>;
type EventDB = Level<number, Event>;

export async function initRequestStatus(eventDB: EventDB) {
  const events = await fetchAllRecords(eventDB);
  return getRequestStatusFromEvents(events);
}

function fetchAllRecords<K, V>(db?: Level<K, V>) {
  return db?.values().all() || Promise.resolve([]);
}

function initJobDB(location = 'leveldb/jobs'): JobDB {
  return new Level<string, Job>(location, { valueEncoding: 'json' });
}

function initEventDB(location = 'leveldb/events'): EventDB {
  return new Level<number, Event>(location, { valueEncoding: 'json' });
}

function updateJob(item: QueueItem<ExecResult>, jobDB: JobDB) {
  jobDB
    .put(item.uniqueId, initJob(item))
    .catch((error) => console.log(JSON.stringify(error)));
}

export type JobCompleteHandler = (
  item: QueueItem<ExecResult>,
  status: CohortRequestStatus,
  result: ExecResult,
  userDataPersistencePath?: string
) => void;
export type JobErrorHandler = (
  item: QueueItem<ExecResult>,
  status: CohortRequestStatus,
  error: ExecResult | string
) => void;

export function defaultJobCompleteHandler(
  item: QueueItem<ExecResult>,
  status: CohortRequestStatus,
  result: ExecResult,
  userDataPersistencePath?: string
) {
  // if successful, persist additionalData
  if (userDataPersistencePath && status === CohortRequestStatus.Complete) {
    persistFiles(
      item.request.additionalData,
      userDataPersistencePath,
      item.uniqueId
    );
  }

  const summary = {
    ...initJob(item),
    status,
    result,
  };
  // TODO send an email/notification to subscribers
  console.log(JSON.stringify(summary, null, 2));
}

export function defaultJobErrorHandler(
  item: QueueItem<ExecResult>,
  status: CohortRequestStatus,
  error: ExecResult | string
) {
  const summary = {
    ...initJob(item),
    status,
    error,
  };
  // TODO send an email/notification to subscribers
  console.log(JSON.stringify(summary, null, 2));
}

function initJob(item: QueueItem<ExecResult>): Job {
  return {
    jobId: item.uniqueId,
    requestDate: item.date,
    requesterId: item.request.id,
    requesterName: item.request.name,
    studyIds: item.request.studyIds,
    caseIds: item.request.caseIds,
    users: item.request.users,
    additionalData: getAdditionalDataSummary(item.request),
  };
}

function getAdditionalDataSummary(request: CohortRequest) {
  return request.additionalData?.map((d) => ({
    filename: d.filename,
    size: d.content.length,
  }));
}

function logEvent(
  item: QueueItem<ExecResult>,
  status: CohortRequestStatus,
  eventDB?: EventDB
) {
  let event: Event = {
    jobId: item.uniqueId,
    status,
    eventDate: new Date(),
  };

  // for duplicate request for the same unique job id,
  // log additional info since we only keep one job object per key
  if (status === CohortRequestStatus.Duplicate) {
    const { requesterId, requesterName, users, additionalData } = initJob(item);

    event = {
      ...event,
      requesterId,
      requesterName,
      users,
      additionalData,
    };
  }

  eventDB
    ?.put(Date.parse(event.eventDate.toString()), event)
    .catch((error) => console.log(JSON.stringify(error)));
}

export function updateJobStatus(
  item: QueueItem<ExecResult>,
  status: CohortRequestStatus,
  jobDB?: JobDB,
  eventDB?: EventDB
) {
  jobDB?.get(item.uniqueId).catch((error) => {
    if (error.code === 'LEVEL_NOT_FOUND') {
      updateJob(item, jobDB);
    }
  });

  logEvent(item, status, eventDB);
}

export class CohortRequestTracker {
  // TODO this variable keeps track of every single request active or completed
  //  over time this may consume substantial amount of memory
  requestStatus: Dictionary<CohortRequestStatus> | undefined;

  jobDB: JobDB | undefined;
  eventDB: EventDB | undefined;

  constructor(dbRoot?: string) {
    if (dbRoot) {
      this.jobDB = initJobDB(dbRoot ? `${dbRoot}/jobs` : undefined);
      this.eventDB = initEventDB(dbRoot ? `${dbRoot}/events` : undefined);

      initRequestStatus(this.eventDB)
        .then((requestStatus) => (this.requestStatus = requestStatus))
        .catch(() => (this.requestStatus = {}));
    } else {
      this.requestStatus = {};
    }
  }

  public updateJobStatus(
    item: QueueItem<ExecResult>,
    status: CohortRequestStatus
  ) {
    updateJobStatus(item, status, this.jobDB, this.eventDB);
  }

  public getRequestStatus(id: string) {
    return this.requestStatus ? this.requestStatus[id] : undefined;
  }

  public setRequestStatus(id: string, status: CohortRequestStatus) {
    if (this.requestStatus) {
      this.requestStatus[id] = status;
    }
  }

  public fetchAllEvents() {
    return fetchAllRecords(this.eventDB);
  }

  public fetchAllJobs() {
    return fetchAllRecords(this.jobDB);
  }
}
