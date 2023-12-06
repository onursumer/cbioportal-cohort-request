import express from 'express';
import {
  CohortRequestQueue,
  CohortRequestTracker,
  SYNC_EXECUTION_THRESHOLD_MS,
} from '@cbioportal-cohort-request/cohort-request-node-utils';
import { CohortRequest } from '@cbioportal-cohort-request/cohort-request-utils';
import { requestCohort } from './app/request-cohort';
import { flatten, isEmpty } from 'lodash';
import { config } from 'dotenv';

// config dotenv before everything else to mae sure process.env is populated from .env file
config();

const API_ROOT = '/api';
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3200;
const shellScriptPath =
  process.env.SCRIPT ??
  '/data/curation/internal_data_curation_automation/automate_curation.sh';
const levelDbPath = process.env.LEVELDB ?? 'leveldb';
const userDataPath = process.env.DATA_PATH ?? 'user_data';
const userUploadThreshold = process.env.UPLOAD_THRESHOLD ?? '100mb';
const syncExecutionThresholdMs =
  Number(process.env.SYNC_EXECUTION_THRESHOLD_MS) ??
  SYNC_EXECUTION_THRESHOLD_MS;

const requestTracker = new CohortRequestTracker(levelDbPath);
const requestQueue = new CohortRequestQueue(
  shellScriptPath,
  userDataPath,
  requestTracker,
  syncExecutionThresholdMs
);

const app = express();
app.use(express.json({ limit: userUploadThreshold }));

app.get(API_ROOT, (req, res) => {
  res.send({
    message: 'Congrats, you reached the cBioPortal Cohort Request API root!',
  });
});

app.post(`${API_ROOT}/cohort-request`, (req, res) => {
  const cohortRequest: CohortRequest = req.body;
  requestCohort(cohortRequest, shellScriptPath, requestQueue).then((response) =>
    res.send(response)
  );
});

app.get(`${API_ROOT}/event`, (req, res) => {
  const jobId = req.query['jobId'] as string;
  const promise = isEmpty(jobId)
    ? requestTracker.fetchAllEvents()
    : requestTracker.fetchEventsByJobId(jobId);
  promise.then((response) => res.send(response));
});

app.get(`${API_ROOT}/job`, (req, res) => {
  const jobId = req.query['jobId'] as string;
  const promise = isEmpty(jobId)
    ? requestTracker.fetchAllJobs()
    : requestTracker.fetchJobById(jobId);
  promise.then((response) => res.send(flatten([response])));
});

app.get(`${API_ROOT}/job-detailed`, (req, res) => {
  const jobId = req.query['jobId'] as string;
  const promise = isEmpty(jobId)
    ? requestTracker.fetchAllJobsDetailed()
    : requestTracker.fetchJobDetailedById(jobId);
  promise.then((response) => res.send(flatten([response])));
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
