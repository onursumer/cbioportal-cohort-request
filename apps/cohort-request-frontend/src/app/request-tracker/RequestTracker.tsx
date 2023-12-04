import { filesize } from 'filesize';
import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme
import {
  CohortRequestStatus,
  Event,
  fetchAllEvents,
  fetchAllJobs,
  getRequestStatusFromEvents,
  groupEventsByJobId,
  Job,
} from '@cbioportal-cohort-request/cohort-request-utils';

/* eslint-disable-next-line */
export interface RequestTrackerProps {}

function generateRowData(jobs: Job[], events: Event[]) {
  const statusMap = getRequestStatusFromEvents(events);
  const eventsByJobId = groupEventsByJobId(events);

  return jobs.map((job) => ({
    ...job,
    events: eventsByJobId[job.jobId],
    status: statusMap[job.jobId],
  }));
}

function StatusRenderer(props: { value: CohortRequestStatus }) {
  const statusStyleMap = {
    [CohortRequestStatus.Error]: 'text-danger',
    [CohortRequestStatus.Complete]: 'text-success',
    [CohortRequestStatus.Pending]: 'text-warning',
    [CohortRequestStatus.Duplicate]: 'text-secondary',
    [CohortRequestStatus.Queued]: 'text-primary',
  };

  return <strong className={statusStyleMap[props.value]}>{props.value}</strong>;
}

function EventRenderer(props: { value: Event[] }) {
  const errorCount = props.value.filter(
    (e) => e.status === CohortRequestStatus.Error
  ).length;
  const duplicateRequestCount = props.value.filter(
    (e) => e.status === CohortRequestStatus.Duplicate
  ).length;

  const aditionalInfo =
    errorCount > 1 || duplicateRequestCount > 0 ? (
      <>
        ({errorCount > 1 && <>Retries: {errorCount - 1}</>}
        {errorCount > 1 && duplicateRequestCount > 0 && <>,</>}
        {duplicateRequestCount > 0 && <>Duplicates: {duplicateRequestCount}</>})
      </>
    ) : undefined;

  return (
    <span>
      {props.value.length} {aditionalInfo}
    </span>
  );
}

function AdditionalDataRenderer(props: {
  value: {
    filename: string;
    size: number;
  }[];
}) {
  return (
    <span>
      {props.value.map((d) => `${d.filename} (${filesize(d.size)})`).join(', ')}
    </span>
  );
}

function dateFormatter(props: { value: string }) {
  return new Date(props.value).toLocaleString();
}

function stringArrayFormatter(props: { value: string[] }) {
  return props.value.join(', ');
}

export function RequestTracker(props: RequestTrackerProps) {
  useEffect(() => {
    Promise.all([fetchAllEvents(), fetchAllJobs()]).then((result) => {
      const events: Event[] = result[0].data;
      const jobs: Job[] = result[1].data;
      setRowData(generateRowData(jobs, events));
    });
  }, []);

  const [rowData, setRowData] = useState<Job[]>([]);

  const colDefs = [
    { field: 'jobId' },
    { field: 'requestDate', valueFormatter: dateFormatter },
    { field: 'requesterId', filter: true },
    { field: 'requesterName', filter: true },
    { field: 'studyIds', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'caseIds', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'users', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'additionalData', cellRenderer: AdditionalDataRenderer },
    { field: 'events', cellRenderer: EventRenderer },
    { field: 'status', cellRenderer: StatusRenderer, filter: true },
    // TODO add an expander/modal for a detailed view
  ];

  return (
    <div className="ag-theme-quartz" style={{ height: 600 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        enableCellTextSelection={true}
      />
    </div>
  );
}

export default RequestTracker;
