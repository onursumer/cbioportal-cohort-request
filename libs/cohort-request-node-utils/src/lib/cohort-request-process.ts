import * as crypto from 'crypto';
import {
  CohortRequest,
  CohortRequestStatus,
} from '@cbioportal-cohort-request/cohort-request-utils';
import { ExecResult } from './execute-command';
import { QueueItem } from './cohort-request-queue';

export type JobCompleteHandler = (
  item: QueueItem,
  status: CohortRequestStatus,
  result: ExecResult
) => void;
export type JobErrorHandler = (
  item: QueueItem,
  status: CohortRequestStatus,
  error: ExecResult | string
) => void;

function getRequestSummary(request: CohortRequest) {
  return {
    ...request,
    additionalData: request.additionalData.map((d) => ({
      filename: d.filename,
      length: d.content.length,
    })),
  };
}

function getJobSummary(
  item: QueueItem,
  status: CohortRequestStatus,
  result: ExecResult | string
) {
  return {
    request: getRequestSummary(item.request),
    uniqueId: item.uniqueId,
    date: item.date,
    command: item.command,
    status,
    result,
  };
}

export function defaultJobCompleteHandler(
  item: QueueItem,
  status: CohortRequestStatus,
  result: ExecResult
) {
  // TODO send an email/notification to subscribers
  console.log(JSON.stringify(getJobSummary(item, status, result), null, 2));
}

export function defaultJobErrorHandler(
  item: QueueItem,
  status: CohortRequestStatus,
  error: ExecResult | string
) {
  // TODO send an email/notification to subscribers
  console.log(JSON.stringify(getJobSummary(item, status, error), null, 2));
}

export function combineStudyIdsSorted(request: CohortRequest, delimiter = ',') {
  return request.studyIds.slice().sort().join(delimiter);
}

export function getCaseIdsSorted(request: CohortRequest) {
  return request.caseIds.slice().sort();
}

export function generateTempSubsetIdFilename(request: CohortRequest) {
  // TODO creating a system file using user input is not safe,
  //  make sure request.id is strictly numeric
  return `/tmp/subset_ids_${request.id}_${new Date().getTime()}.txt`;
}

export function defaultRequestToCommand(
  request: CohortRequest,
  shellScriptPath: string
) {
  const subsetIdFilename = generateTempSubsetIdFilename(request);
  const studies = combineStudyIdsSorted(request);

  return `${shellScriptPath} --subset-identifiers=${subsetIdFilename} --input-directories="${studies}"`;
}

export function createHash(input: string) {
  return crypto.createHash('md5').update(input).digest('hex');
}

export function defaultRequestToUniqueId(
  request: CohortRequest,
  delimiter = ','
) {
  const studies = combineStudyIdsSorted(request, delimiter);
  const caseIds = getCaseIdsSorted(request);

  return createHash(`${studies}:${caseIds.join(delimiter)}`);
}
