import {
  CohortRequest,
  CohortRequestResponse,
} from '@cbioportal-cohort-request/cohort-request-utils';

export async function requestCohort(
  request: CohortRequest
): Promise<CohortRequestResponse> {
  // TODO actual system call to the external script, this is just a simulation
  await new Promise((resolve) => setTimeout(resolve, 5000));

  return {
    message: 'Success!',
  };
}
