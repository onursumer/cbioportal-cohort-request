import styles from './JobDetails.module.scss';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import {
  EnhancedJob,
  Event,
  fetchJobsDetailed,
} from '@cbioportal-cohort-request/cohort-request-utils';
import {
  AdditionalDataColumn,
  dateFormatter,
  DefaultColumnDefinition,
  defaultGridProps,
  DetailsRow,
  EventDateColumn,
  StatusColumn,
  stringArrayFormatter,
} from '../table-formatter/table-formatter';

/* eslint-disable-next-line */
export interface JobDetailsProps {}

function EventTable(props: { events?: Event[] }) {
  const colDefs = [
    {
      field: 'timestamp',
      valueFormatter: dateFormatter,
      headerName: 'Event Date',
      cellRenderer: EventDateColumn,
    },
    DefaultColumnDefinition.Status,
    DefaultColumnDefinition.RequesterId,
    DefaultColumnDefinition.RequesterName,
    DefaultColumnDefinition.Users,
    DefaultColumnDefinition.AdditionalData,
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
  const [job, setJob] = useState<EnhancedJob | undefined>(undefined);

  useEffect(() => {
    if (id) {
      fetchJobsDetailed({ jobId: id }).then((result) => {
        setJob(result.data[0]);
      });
    }
  }, [id]);

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

      <DetailsRow
        title={<strong>Status:</strong>}
        value={<StatusColumn value={job.status} />}
      />
      <DetailsRow
        title={<strong>Requester ID:</strong>}
        value={job.requesterId}
      />
      <DetailsRow
        title={<strong>Requester Name:</strong>}
        value={job.requesterName}
      />
      <DetailsRow
        title={<strong>Study Id(s):</strong>}
        value={stringArrayFormatter({ value: job.studyIds })}
      />
      <DetailsRow
        title={<strong>Case ID(s):</strong>}
        value={stringArrayFormatter({ value: job.caseIds })}
      />
      <DetailsRow
        title={<strong>User ID(s):</strong>}
        value={stringArrayFormatter({ value: job.users })}
      />
      <DetailsRow
        title={<strong>Additional Data:</strong>}
        value={<AdditionalDataColumn value={job.additionalData} />}
      />

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
