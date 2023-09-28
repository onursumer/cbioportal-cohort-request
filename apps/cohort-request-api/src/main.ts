import express from 'express';
import { CohortRequestQueue } from '@cbioportal-cohort-request/cohort-request-node-utils';
import { CohortRequest } from '@cbioportal-cohort-request/cohort-request-utils';
import { requestCohort } from './app/request-cohort';

const API_ROOT = '/api';
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3200;
const shellScriptPath =
  process.env.SCRIPT ??
  '/data/curation/internal_data_curation_automation/automate_curation.sh';
const requestQueue = new CohortRequestQueue(shellScriptPath);

const app = express();
// TODO hardcoded json limit, replace with a constant or make it customizable
app.use(express.json({ limit: '100mb' }));

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

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
