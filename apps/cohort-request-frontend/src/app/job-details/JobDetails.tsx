import styles from './JobDetails.module.scss';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import {
  EnhancedJob,
  Event,
  fetchJobsDetailed,
} from '@cbioportal-cohort-request/cohort-request-utils';
import { AgGridReact } from 'ag-grid-react';
import {
  AdditionalDataColumn,
  dateFormatter,
  defaultGridProps,
  StatusColumn,
  stringArrayFormatter,
} from '../column-formatter/column-formatter';
import { useParams } from 'react-router-dom';

/* eslint-disable-next-line */
export interface JobDetailsProps {}

function EventTable(props: { events?: Event[] }) {
  const colDefs = [
    {
      field: 'timestamp',
      valueFormatter: dateFormatter,
      headerName: 'Event Date',
    },
    { field: 'requesterId', filter: true },
    { field: 'requesterName', filter: true },
    { field: 'users', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'additionalData', cellRenderer: AdditionalDataColumn },
    { field: 'status', cellRenderer: StatusColumn, filter: true },
    { field: 'output.code', headerName: 'exit code', filter: true },
    { field: 'output.stdout', headerName: 'stdout', filter: true },
    { field: 'output.stderr', headerName: 'stderr', filter: true },
  ];

  return (
    <div className="ag-theme-quartz">
      <AgGridReact
        rowData={props.events}
        columnDefs={colDefs}
        {...defaultGridProps()}
      />
    </div>
  );
}

export function JobDetails(props: JobDetailsProps) {
  const { id } = useParams();
  useEffect(() => {
    if (id) {
      fetchJobsDetailed({ jobId: id }).then((result) => {
        setJob(result.data[0]);
      });
    }
  }, [id]);

  const [job, setJob] = useState<EnhancedJob | undefined>(undefined);

  const events = job?.events.map((event) => ({
    ...event,
    requesterId: event.requesterId || job?.requesterId,
    requesterName: event.requesterName || job?.requesterName,
    users: event.users || job?.users,
    additionalData: event.additionalData || job?.additionalData,
  }));

  return job ? (
    <Container
      fluid={true}
      style={{
        paddingTop: 20,
        paddingBottom: 20,
        color: '#2c3e50',
      }}
    >
      <Row>
        <Col className="mx-auto d-flex flex-column align-items-center">
          <span className={styles.jobPageTitle}>Job {job.jobId}</span>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex flex-column col-2">
          <strong>Status:</strong>
        </Col>
        <Col className="d-flex flex-column">
          <StatusColumn value={job.status} />
        </Col>
      </Row>
      <Row>
        <Col className="d-flex flex-column col-2">
          <strong>Requester ID:</strong>
        </Col>
        <Col className="d-flex flex-column">{job?.requesterId}</Col>
      </Row>
      <Row>
        <Col className="d-flex flex-column col-2">
          <strong>Requester Name:</strong>
        </Col>
        <Col className="d-flex flex-column">{job?.requesterName}</Col>
      </Row>
      <Row>
        <Col className="d-flex flex-column col-2">
          <strong>Study Id(s):</strong>
        </Col>
        <Col className="d-flex flex-column">
          {stringArrayFormatter({ value: job.studyIds })}
        </Col>
      </Row>
      <Row>
        <Col className="d-flex flex-column col-2">
          <strong>Case Id(s):</strong>
        </Col>
        <Col className="d-flex flex-column">
          {stringArrayFormatter({ value: job.caseIds })}
        </Col>
      </Row>
      <Row>
        <Col className="d-flex flex-column col-2">
          <strong>User Id(s):</strong>
        </Col>
        <Col className="d-flex flex-column">
          {stringArrayFormatter({ value: job.users })}
        </Col>
      </Row>
      <Row>
        <Col className="d-flex flex-column col-2">
          <strong>Additional Data:</strong>
        </Col>
        <Col className="d-flex flex-column">
          <AdditionalDataColumn value={job.additionalData} />
        </Col>
      </Row>
      <Row>
        <Col className="d-flex flex-column mt-3">
          <strong>Recorded Events:</strong>
        </Col>
      </Row>
      <Row>
        <Col>
          <EventTable events={events} />
        </Col>
      </Row>
    </Container>
  ) : null;
}

export default JobDetails;
