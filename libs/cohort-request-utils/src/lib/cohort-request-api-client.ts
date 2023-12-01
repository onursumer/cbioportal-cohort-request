import {
  CohortRequest,
  CohortRequestResponse,
  Event,
} from './cohort-request-model';
import axios from 'axios';

export async function sendCohortRequest(
  request: CohortRequest
): Promise<CohortRequestResponse> {
  return axios.post('/api/cohort-request', request);
}

export async function fetchAllEvents(): Promise<Event[]> {
  return axios.get('/api/event');
}

export async function fetchAllJobs(): Promise<CohortRequestResponse> {
  return axios.post('/api/job');
}
