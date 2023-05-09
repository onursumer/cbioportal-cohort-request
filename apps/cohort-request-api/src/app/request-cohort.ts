import {
  executeCommand,
  CohortRequest,
  CohortRequestResponse,
} from '@cbioportal-cohort-request/cohort-request-utils';
import _ from 'lodash';
import { ShellString } from 'shelljs';

export async function requestCohort(
  request: CohortRequest,
  shellScriptPath: string
): Promise<CohortRequestResponse> {
  const studies = request.cohorts.map((c) => c.studyId).join(',');
  const caseIds = _.flatten(request.cohorts.map((c) => c.caseIds));
  const subsetIdFilename = generateTempSubsetIdFilename(request);
  ShellString(caseIds.join('\n')).to(subsetIdFilename);
  // generate command to execute with params
  const command = `${shellScriptPath} --subset-identifiers=${subsetIdFilename} --input-directories="${studies}"`;

  // TODO implement a queued execution & check duplicate requests
  const { status, output } = await executeCommand(command, shellScriptPath);

  return {
    status,
    // TODO return user friendly message
    message: output?.stderr || output?.stdout || '',
  };
}

function generateTempSubsetIdFilename(request: CohortRequest) {
  // TODO creating a system file using user input is not safe,
  //  make sure request.id is strictly numeric
  return `/tmp/subset_ids_${request.id}_${new Date().getTime()}.txt`;
}
