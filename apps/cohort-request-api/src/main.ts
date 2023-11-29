import express from 'express';
import {
  CohortRequestQueue,
  CohortRequestTracker,
} from '@cbioportal-cohort-request/cohort-request-node-utils';
import { CohortRequest } from '@cbioportal-cohort-request/cohort-request-utils';
import { requestCohort } from './app/request-cohort';

const API_ROOT = '/api';
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3200;
const shellScriptPath =
  process.env.SCRIPT ??
  '/data/curation/internal_data_curation_automation/automate_curation.sh';
const levelDbPath = process.env.LEVELDB ?? 'leveldb';
const userDataPath = process.env.DATA_PATH ?? 'user_data';
const userUploadThreshold = process.env.UPLOAD_THRESHOLD ?? '100mb';

const requestTracker = new CohortRequestTracker(levelDbPath);
const requestQueue = new CohortRequestQueue(
  shellScriptPath,
  userDataPath,
  requestTracker
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
  requestTracker.fetchAllEvents().then((response) => res.send(response));
});

app.get(`${API_ROOT}/job`, (req, res) => {
  requestTracker.fetchAllJobs().then((response) => res.send(response));
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
