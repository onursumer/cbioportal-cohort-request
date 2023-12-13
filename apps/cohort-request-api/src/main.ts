import express from 'express';
import {
  CohortRequestQueue,
  CohortRequestTracker,
  SYNC_EXECUTION_THRESHOLD_MS,
} from '@cbioportal-cohort-request/cohort-request-node-utils';
import {
  CohortRequest,
  Event,
  getEventPrimaryKey,
} from '@cbioportal-cohort-request/cohort-request-utils';
import { requestCohort } from './app/request-cohort';
import { chain, isEmpty } from 'lodash';
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

app.post(`${API_ROOT}/cohort-request`, async (req, res) => {
  const cohortRequest: CohortRequest = req.body;
  const response = await requestCohort(
    cohortRequest,
    shellScriptPath,
    requestQueue
  );
  res.send(response);
});

app.get(`${API_ROOT}/event`, async (req, res) => {
  const jobId = req.query['jobId'] as string;
  const eventId = req.query['eventId'] as string;
  const response: Event[] = [];

  if (isEmpty(jobId) && isEmpty(eventId)) {
    response.push(...(await requestTracker.fetchAllEvents()));
  } else if (!isEmpty(eventId)) {
    const event = await requestTracker
      .fetchEventById(eventId)
      .catch(() => undefined);
    // if job id also provided make sure event.jobId matches given jobId
    if (!jobId || event?.jobId === jobId) {
      response.push(event);
    }
  } else if (!isEmpty(jobId)) {
    response.push(...(await requestTracker.fetchEventsByJobId(jobId)));
  }

  res.send(chain(response).compact().uniqBy(getEventPrimaryKey).value());
});

app.get(`${API_ROOT}/job`, async (req, res) => {
  const jobId = req.query['jobId'] as string;
  const response = isEmpty(jobId)
    ? await requestTracker.fetchAllJobs()
    : await requestTracker.fetchJobById(jobId).catch(() => undefined);
  res.send(chain([response]).flatten().compact().value());
});

app.get(`${API_ROOT}/job-detailed`, async (req, res) => {
  const jobId = req.query['jobId'] as string;
  const response = isEmpty(jobId)
    ? await requestTracker.fetchAllJobsDetailed()
    : await requestTracker.fetchJobDetailedById(jobId).catch(() => undefined);
  res.send(chain([response]).flatten().compact().value());
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
