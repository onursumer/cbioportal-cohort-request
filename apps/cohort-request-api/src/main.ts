import express from 'express';
import { CohortRequest } from '@cbioportal-cohort-request/cohort-request-utils';

const API_ROOT = '/api';
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3200;

const app = express();
app.use(express.json());

app.get(API_ROOT, (req, res) => {
  res.send({
    message: 'Congrats, you reached the cBioPortal Cohort Request API root!',
  });
});

app.post(`${API_ROOT}/cohort-request`, (req, res) => {
  const cohortRequest: CohortRequest = req.body;
  // TODO process cohortRequest and return a meaningful message
  res.send({ message: cohortRequest });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
