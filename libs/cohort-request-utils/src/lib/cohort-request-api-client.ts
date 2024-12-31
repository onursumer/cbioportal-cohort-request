import {
  CohortRequest,
  CohortRequestResponse,
  EnhancedJob,
  Event,
  Job,
} from './cohort-request-model';
import axios, { AxiosResponse } from 'axios';
import { Dictionary } from 'lodash';

export async function sendCohortRequest(
  request: CohortRequest
): Promise<AxiosResponse<CohortRequestResponse>> {
  return axios.post('/api/cohort-request', request);
}

export async function fetchEvents(
  params?: Dictionary<string>
): Promise<AxiosResponse<Event[]>> {
  return axios.get('/api/event', { params });
}

export async function fetchJobs(
  params?: Dictionary<string>
): Promise<AxiosResponse<Job[]>> {
  return axios.get('/api/job', { params });
}

export async function fetchJobsDetailed(
  params?: Dictionary<string>
): Promise<AxiosResponse<EnhancedJob[]>> {
  return axios.get('/api/job-detailed', { params });
}

export async function terminateJob(
  params?: Dictionary<string>
): Promise<AxiosResponse<EnhancedJob[]>> {
  return axios.get('/api/terminate-job', { params });
}

export async function recoverJob(
  params?: Dictionary<string>
): Promise<AxiosResponse<EnhancedJob[]>> {
  return axios.get('/api/recover-job', { params });
}
