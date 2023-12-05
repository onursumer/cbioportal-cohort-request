import styles from './JobDetails.module.scss';
import React, { useEffect, useState } from 'react';
import { Col, Container } from 'react-bootstrap';
import {
  EnhancedJob,
  Event,
  fetchJobsDetailed,
} from '@cbioportal-cohort-request/cohort-request-utils';
import { AgGridReact } from 'ag-grid-react';
import {
  AdditionalDataColumn,
  dateFormatter,
  StatusColumn,
  stringArrayFormatter,
} from '../column-formatter/column-formatter';
import { useParams } from 'react-router-dom';
import { Row } from 'react-bootstrap';

/* eslint-disable-next-line */
export interface JobDetailsProps {}

function EventTable(props: { events?: Event[] }) {
  const colDefs = [
    { field: 'eventDate', valueFormatter: dateFormatter },
    { field: 'requesterId', filter: true },
    { field: 'requesterName', filter: true },
    { field: 'users', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'additionalData', cellRenderer: AdditionalDataColumn },
    { field: 'status', cellRenderer: StatusColumn, filter: true },
  ];

  return (
    <div className="ag-theme-quartz" style={{ height: 600 }}>
      <AgGridReact
        rowData={props.events}
        columnDefs={colDefs}
        enableCellTextSelection={true}
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

  return (
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
          <span className={styles.jobPageTitle}>Job {job?.jobId}</span>
        </Col>
      </Row>
      <Row>
        <EventTable events={events} />
      </Row>
    </Container>
  );
}

export default JobDetails;
