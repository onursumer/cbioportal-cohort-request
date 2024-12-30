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
  dateFormatter,
  DefaultColumnDefinition,
  defaultGridProps,
  EventColumn,
  JobIdColumn,
  stringArrayFormatter,
} from '../table-formatter/table-formatter';

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
    DefaultColumnDefinition.Status,
    {
      field: 'requestTimestamp',
      valueFormatter: dateFormatter,
      headerName: 'Request Date',
      sort: 'desc',
    },
    DefaultColumnDefinition.RequesterId,
    DefaultColumnDefinition.RequesterName,
    { field: 'studyIds', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'caseIds', valueFormatter: stringArrayFormatter, filter: true },
    DefaultColumnDefinition.Users,
    DefaultColumnDefinition.AdditionalData,
    { field: 'events', cellRenderer: EventColumn },
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
