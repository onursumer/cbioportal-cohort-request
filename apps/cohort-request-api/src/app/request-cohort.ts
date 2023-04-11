import {
  CohortRequest,
  CohortRequestResponse,
} from '@cbioportal-cohort-request/cohort-request-utils';
import { Options, PythonShell } from 'python-shell';

export async function requestCohort(
  request: CohortRequest,
  pythonBinaryPath: string,
  pythonScriptPath: string
): Promise<CohortRequestResponse> {
  const options = getPythonShellOptions(pythonBinaryPath, ['TODO']);
  const result = await PythonShell.run(pythonScriptPath, options).catch(() => {
    // TODO return a status code (enum?)
    return 'ERROR';
  });

  return {
    message: 'Success!',
  };
}

function getPythonShellOptions(pythonPath: string, args: string[]): Options {
  return {
    mode: 'text',
    pythonPath,
    pythonOptions: ['-u'], // get print results in real-time
    args,
  };
}
