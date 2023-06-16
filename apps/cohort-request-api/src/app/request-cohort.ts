import {
  CohortRequestQueue,
  executeCommand,
} from '@cbioportal-cohort-request/cohort-request-node-utils';
import {
  CohortRequest,
  CohortRequestResponse,
} from '@cbioportal-cohort-request/cohort-request-utils';
import crypto from 'crypto';
import _ from 'lodash';
import { ShellString } from 'shelljs';

export async function requestCohort(
  request: CohortRequest,
  shellScriptPath: string,
  requestQueue?: CohortRequestQueue
): Promise<CohortRequestResponse> {
  const studies = request.cohorts
    .map((c) => c.studyId)
    .sort()
    .join(',');
  const caseIds = _.flatten(request.cohorts.map((c) => c.caseIds)).sort();
  const subsetIdFilename = generateTempSubsetIdFilename(request);
  ShellString(caseIds.join('\n')).to(subsetIdFilename);
  // generate command to execute with params
  const command = `${shellScriptPath} --subset-identifiers=${subsetIdFilename} --input-directories="${studies}"`;
  const hash = createHash(`${studies}:${caseIds.join(',')}`);
  // use the queue if provided to execute the command
  const { status, output } = requestQueue
    ? await requestQueue.enqueue(command, hash)
    : await executeCommand(command, shellScriptPath);

  return {
    status,
    // TODO return user friendly message
    message: output?.stderr || output?.stdout || '',
  };
}

export function generateTempSubsetIdFilename(request: CohortRequest) {
  // TODO creating a system file using user input is not safe,
  //  make sure request.id is strictly numeric
  return `/tmp/subset_ids_${request.id}_${new Date().getTime()}.txt`;
}

export function createHash(input: string) {
  return crypto.createHash('md5').update(input).digest('hex');
}
