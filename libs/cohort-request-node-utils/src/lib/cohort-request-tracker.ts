import { Dictionary } from 'lodash';
import {
  CohortRequest,
  CohortRequestStatus,
  EnhancedJob,
  Event,
  getRequestStatusFromEvents,
  groupEventsByJobId,
  Job,
  QueueItem,
} from '@cbioportal-cohort-request/cohort-request-utils';
import { persistFiles } from './cohort-request-process';
import { ExecResult } from './execute-command';
import {
  EventDB,
  fetchAllEvents,
  fetchEventsByJobId,
  initEventDB,
  insertEvent,
} from './event-repository';
import {
  fetchAllJobs,
  fetchJobById,
  initJobDB,
  insertJob,
  JobDB,
} from './job-repository';

export async function initRequestStatus(eventDB: EventDB) {
  const events = await fetchAllEvents(eventDB);
  return getRequestStatusFromEvents(events);
}

function updateJob(item: QueueItem<ExecResult>, jobDB: JobDB) {
  insertJob(initJob(item), jobDB).catch((error) =>
    console.log(JSON.stringify(error))
  );
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
    requestTimestamp: item.timestamp,
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
  result?: ExecResult,
  eventDB?: EventDB
) {
  const { jobId, requesterId, requesterName, users, additionalData } =
    initJob(item);
  const event: Event = {
    jobId,
    status,
    timestamp: Date.now(),
    output: result?.output,
    // for duplicate requests or multiple retries for the same unique job id,
    // log additional info since we may have different data for different requests
    requesterId,
    requesterName,
    users,
    additionalData,
  };

  insertEvent(event, eventDB).catch((error) =>
    console.log(JSON.stringify(error))
  );
}

export function updateJobStatus(
  item: QueueItem<ExecResult>,
  status: CohortRequestStatus,
  result?: ExecResult,
  jobDB?: JobDB,
  eventDB?: EventDB
) {
  fetchJobById(item.uniqueId, jobDB)
    .then((job: Job | undefined) => {
      // job already exits in the DB, but there might be previous errors
      // so every time we had to rerun the job we should also overwrite it with the latest data provided by the user
      if (job && status === CohortRequestStatus.Pending) {
        updateJob(item, jobDB);
      }
    })
    .catch((error) => {
      if (error.code === 'LEVEL_NOT_FOUND') {
        // this is the first time we are adding the job to the DB
        updateJob(item, jobDB);
      }
    });

  logEvent(item, status, result, eventDB);
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
    status: CohortRequestStatus,
    result?: ExecResult
  ) {
    updateJobStatus(item, status, result, this.jobDB, this.eventDB);
  }

  public getRequestStatus(id: string) {
    return this.requestStatus ? this.requestStatus[id] : undefined;
  }

  public setRequestStatus(id: string, status: CohortRequestStatus) {
    if (this.requestStatus) {
      this.requestStatus[id] = status;
    }
  }

  public fetchAllEvents(): Promise<Event[]> {
    return fetchAllEvents(this.eventDB);
  }

  public fetchEventsByJobId(jobId: string): Promise<Event[]> {
    return fetchEventsByJobId(jobId, this.eventDB);
  }

  public fetchAllJobs(): Promise<Job[]> {
    return fetchAllJobs(this.jobDB);
  }

  public fetchJobById(jobId: string): Promise<Job | undefined> {
    return fetchJobById(jobId, this.jobDB);
  }

  public fetchAllJobsDetailed(): Promise<EnhancedJob[]> {
    return Promise.all([this.fetchAllEvents(), this.fetchAllJobs()]).then(
      (response) => {
        const events: Event[] = response[0];
        const jobs: Job[] = response[1];

        const statusMap = getRequestStatusFromEvents(events);
        const eventsByJobId = groupEventsByJobId(events);

        return jobs.map((job) => ({
          ...job,
          events: eventsByJobId[job.jobId],
          status: statusMap[job.jobId],
        }));
      }
    );
  }

  public fetchJobDetailedById(jobId: string): Promise<EnhancedJob | undefined> {
    return Promise.all([
      this.fetchEventsByJobId(jobId),
      this.fetchJobById(jobId),
    ]).then((response) => {
      const events: Event[] = response[0];
      const job: Job | undefined = response[1];
      const status = getRequestStatusFromEvents(events)[jobId];

      return {
        ...job,
        events,
        status,
      };
    });
  }
}
