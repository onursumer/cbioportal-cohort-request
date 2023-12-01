import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme

import {
  Event,
  fetchAllEvents,
  fetchAllJobs,
  getRequestStatusFromEvents,
  Job,
} from '@cbioportal-cohort-request/cohort-request-utils';
import styles from './RequestTracker.module.scss';

/* eslint-disable-next-line */
export interface RequestTrackerProps {}

function generateRowData(jobs: Job[], events: Event[]) {
  const statusMap = getRequestStatusFromEvents(events);
  return jobs.map((job) => ({
    ...job,
    status: statusMap[job.jobId],
  }));
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
  const [colDefs, setColDefs] = useState([
    { field: 'jobId' },
    { field: 'requestDate' },
    { field: 'requesterId' },
    { field: 'requesterName' },
    { field: 'status' },
  ]);

  return (
    <div className="ag-theme-quartz" style={{ height: 500 }}>
      <AgGridReact rowData={rowData} columnDefs={colDefs} />
    </div>
  );
}

export default RequestTracker;
