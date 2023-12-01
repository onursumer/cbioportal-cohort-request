import {
  CohortRequest,
  CohortRequestResponse,
  Event,
  Job,
} from './cohort-request-model';
import axios, { AxiosResponse } from 'axios';

export async function sendCohortRequest(
  request: CohortRequest
): Promise<AxiosResponse<CohortRequestResponse>> {
  return axios.post('/api/cohort-request', request);
}

export async function fetchAllEvents(): Promise<AxiosResponse<Event[]>> {
  return axios.get('/api/event');
}

export async function fetchAllJobs(): Promise<AxiosResponse<Job[]>> {
  return axios.get('/api/job');
}
