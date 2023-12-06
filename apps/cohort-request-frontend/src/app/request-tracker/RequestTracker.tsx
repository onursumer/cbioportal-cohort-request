import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme
import {
  EnhancedJob,
  fetchJobsDetailed,
} from '@cbioportal-cohort-request/cohort-request-utils';
import {
  AdditionalDataColumn,
  dateFormatter,
  defaultGridProps,
  EventColumn,
  JobIdColumn,
  StatusColumn,
  stringArrayFormatter,
} from '../column-formatter/column-formatter';

/* eslint-disable-next-line */
export interface RequestTrackerProps {}

export function RequestTracker(props: RequestTrackerProps) {
  useEffect(() => {
    fetchJobsDetailed().then((result) => {
      setRowData(result.data);
    });
  }, []);

  const [rowData, setRowData] = useState<EnhancedJob[]>([]);

  const colDefs = [
    { field: 'jobId', cellRenderer: JobIdColumn },
    { field: 'requestDate', valueFormatter: dateFormatter },
    { field: 'requesterId', filter: true },
    { field: 'requesterName', filter: true },
    { field: 'studyIds', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'caseIds', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'users', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'additionalData', cellRenderer: AdditionalDataColumn },
    { field: 'events', cellRenderer: EventColumn },
    { field: 'status', cellRenderer: StatusColumn, filter: true },
  ];

  return (
    <Container
      fluid={true}
      style={{
        paddingTop: 20,
        paddingBottom: 20,
        color: '#2c3e50',
      }}
    >
      <div className="ag-theme-quartz">
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          {...defaultGridProps()}
        />
      </div>
    </Container>
  );
}

export default RequestTracker;
