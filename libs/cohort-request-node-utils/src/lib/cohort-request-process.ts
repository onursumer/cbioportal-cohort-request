import * as crypto from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { CohortRequest } from '@cbioportal-cohort-request/cohort-request-utils';

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

export function persistFiles(
  files: { content: string; filename: string }[] = [],
  persistencePath: string,
  jobId: string
) {
  // create destination directory
  const destDir = `${persistencePath}/${jobId}`;
  mkdirSync(destDir, { recursive: true });

  // write files if dest dir exists
  if (existsSync(destDir)) {
    files.forEach((f) => {
      const destFile = `${destDir}/${f.filename}`;
      writeFileSync(destFile, f.content);
    });
  }
}
