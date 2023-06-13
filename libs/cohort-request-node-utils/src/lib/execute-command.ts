import { CohortRequestStatus } from '@cbioportal-cohort-request/cohort-request-utils';
import { cd, exec, pwd } from 'shelljs';
import * as path from 'path';

const SYNC_EXECUTION_THRESHOLD_MS = 500;

export interface ExecOutput {
  code: number;
  stdout: string;
  stderr: string;
}

export interface ExecResult {
  status: CohortRequestStatus;
  execPromise: Promise<ExecOutput>;
  output?: ExecOutput;
}

/**
 * Executes the command and waits up to <timeout> ms.
 * If the command execution finishes before timeout, then returns the result with status (Complete or as Error).
 * If the command execution takes longer than timeout, then only returns the status (Pending)
 *
 * @param command command to execute
 * @param shellScriptPath path to the external script
 * @param timeout waits up to <timeout> ms before returning Pending status
 */
export async function executeCommand(
  command: string,
  shellScriptPath: string,
  timeout: number = SYNC_EXECUTION_THRESHOLD_MS
): Promise<ExecResult> {
  let status = CohortRequestStatus.Pending;
  let output: ExecOutput | undefined;

  // keep the original working directory
  const originalPwd = pwd();
  // change directory to the path of the bash script
  cd(path.dirname(shellScriptPath));

  const execPromise = execAsync(command);

  execPromise
    // update status when done
    .then((data) => {
      status = CohortRequestStatus.Complete;
      output = data;
    })
    // update status in case of an error
    .catch((data) => {
      status = CohortRequestStatus.Error;
      output = data;
    })
    // change back to the original working directory
    .finally(() => cd(originalPwd));

  // wait up to <timeout> ms
  await Promise.race([execPromise, delay(timeout)]).catch(
    () => (status = CohortRequestStatus.Error)
  );

  return { status, output, execPromise };
}

export function execAsync(
  command: string,
  options: any = {}
): Promise<ExecOutput> {
  return new Promise(function (resolve, reject) {
    exec(command, options, (code, stdout, stderr) => {
      const result = { code, stdout, stderr };
      // reject if non-zero exit code
      return code === 0 ? resolve(result) : reject(result);
    });
  });
}

export function delay(timeInMilliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, timeInMilliseconds));
}
