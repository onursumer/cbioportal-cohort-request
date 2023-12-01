import {
  CohortRequestQueue,
  defaultRequestToCommand,
  defaultRequestToUniqueId,
  executeCommand,
  generateTempSubsetIdFilename,
  getCaseIdsSorted,
} from '@cbioportal-cohort-request/cohort-request-node-utils';
import {
  CohortRequest,
  CohortRequestResponse,
} from '@cbioportal-cohort-request/cohort-request-utils';
import { ShellString } from 'shelljs';

export async function requestCohort(
  request: CohortRequest,
  shellScriptPath: string,
  requestQueue?: CohortRequestQueue
): Promise<CohortRequestResponse> {
  writeCasesToTempFile(request);
  // use the queue if provided to execute the command
  const { status, output, uniqueId, date } = requestQueue
    ? await requestQueue.enqueue(request)
    : await executeCommand(
        defaultRequestToCommand(request, shellScriptPath),
        shellScriptPath,
        defaultRequestToUniqueId(request)
      );

  return {
    status,
    uniqueId,
    date,
    // TODO return user friendly message
    message: output?.stderr || output?.stdout || '',
  };
}

export function writeCasesToTempFile(request: CohortRequest) {
  const caseIds = getCaseIdsSorted(request);
  const subsetIdFilename = generateTempSubsetIdFilename(request);

  ShellString(caseIds.join('\n')).to(subsetIdFilename);
}
