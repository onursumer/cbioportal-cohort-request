import React, { useCallback, useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import {
  EnhancedJob,
  fetchJobsDetailed,
  terminateJob,
} from '@cbioportal-cohort-request/cohort-request-utils';
import IconWithTooltip from '../icon-with-tooltip/IconWithTooltip';
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
  const [searchParams] = useSearchParams();
  const handleJobFetch = useCallback(
    (result: { data: EnhancedJob[] }) => {
      // filter out terminated jobs
      const data = searchParams.get('debug')
        ? result.data
        : result.data.filter((d) => !d.terminationTimestamp);
      setRowData(data);
    },
    [searchParams]
  );

  useEffect(() => {
    fetchJobsDetailed().then(handleJobFetch);
  }, [handleJobFetch]);

  const [rowData, setRowData] = useState<EnhancedJob[]>([]);

  const DeleteJob = (props: { value?: number; data?: EnhancedJob }) => {
    const handleDelete = () => {
      if (props?.data?.jobId) {
        terminateJob({ jobId: props?.data?.jobId }).then((result) => {
          if (result.data.length > 0) {
            // fetch jobs again to refresh the table (to remove deleted jobs)
            fetchJobsDetailed().then(handleJobFetch);
          }
        });
      }
    };

    // TODO prompt "Are you sure?" before deleting
    return (
      <Button
        disabled={!!props?.data?.terminationTimestamp}
        variant="danger"
        onClick={handleDelete}
      >
        <IconWithTooltip
          icon={faTrashCan}
          tooltipContent={<>Delete Job {props?.data?.jobId.substring(0, 7)}</>}
        />
      </Button>
    );
  };

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
    {
      headerName: 'Delete',
      field: 'terminationTimestamp',
      cellRenderer: DeleteJob,
    },
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
