import { CohortRequest, CohortRequestResponse } from './cohort-request-model';
import axios from 'axios';

export async function sendCohortRequest(
  request: CohortRequest
): Promise<CohortRequestResponse> {
  return axios.post('/api/cohort-request', request);
}
