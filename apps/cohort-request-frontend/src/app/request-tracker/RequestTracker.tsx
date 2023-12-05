import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { filesize } from 'filesize';
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
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
import IconWithTooltip from '../icon-with-tooltip/IconWithTooltip';

/* eslint-disable-next-line */
export interface RequestTrackerProps {}

interface RowDatum extends Job {
  events: Event[];
  status: CohortRequestStatus;
}

function generateRowData(jobs: Job[], events: Event[]): RowDatum[] {
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

function EventColumn(props: { value: Event[]; onActivateDetails: () => void }) {
  return (
    <span>
      {props.value.length}
      <Button variant="link" onClick={props.onActivateDetails}>
        <IconWithTooltip
          icon={faQuestionCircle}
          tooltipContent={<>click to see details</>}
        />
      </Button>
    </span>
  );
}

function DetailsModal(props: { rowDatum?: RowDatum; onHide?: () => void }) {
  const events = props.rowDatum?.events.map((event) => ({
    ...event,
    requesterId: event.requesterId || props.rowDatum?.requesterId,
    requesterName: event.requesterName || props.rowDatum?.requesterName,
    users: event.users || props.rowDatum?.users,
    additionalData: event.additionalData || props.rowDatum?.additionalData,
  }));

  return (
    <Modal
      show={props.rowDatum !== undefined}
      centered={true}
      onHide={props.onHide}
      size="xl"
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>Job {props.rowDatum?.jobId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EventTable events={events} />
      </Modal.Body>
    </Modal>
  );
}

function EventTable(props: { events?: Event[] }) {
  const colDefs = [
    { field: 'eventDate', valueFormatter: dateFormatter },
    { field: 'requesterId', filter: true },
    { field: 'requesterName', filter: true },
    { field: 'users', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'additionalData', cellRenderer: AdditionalDataColumn },
    { field: 'status', cellRenderer: StatusRenderer, filter: true },
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

function AdditionalDataColumn(props: {
  value?: {
    filename: string;
    size: number;
  }[];
}) {
  return (
    <span>
      {props.value
        ?.map((d) => `${d.filename} (${filesize(d.size)})`)
        .join(', ')}
    </span>
  );
}

function dateFormatter(props: { value: string }) {
  return new Date(props.value).toLocaleString();
}

function stringArrayFormatter(props: { value?: string[] }) {
  return props.value?.join(', ');
}

export function RequestTracker(props: RequestTrackerProps) {
  useEffect(() => {
    Promise.all([fetchAllEvents(), fetchAllJobs()]).then((result) => {
      const events: Event[] = result[0].data;
      const jobs: Job[] = result[1].data;
      setRowData(generateRowData(jobs, events));
    });
  }, []);

  const [rowData, setRowData] = useState<RowDatum[]>([]);
  const [selectedRowDatum, setSelectedRowDatum] = useState<
    RowDatum | undefined
  >(undefined);

  const eventRenderer = (props: { value: Event[]; data: RowDatum }) => {
    return (
      <EventColumn
        {...props}
        onActivateDetails={() => setSelectedRowDatum(props.data)}
      />
    );
  };

  const colDefs = [
    { field: 'jobId' },
    { field: 'requestDate', valueFormatter: dateFormatter },
    { field: 'requesterId', filter: true },
    { field: 'requesterName', filter: true },
    { field: 'studyIds', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'caseIds', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'users', valueFormatter: stringArrayFormatter, filter: true },
    { field: 'additionalData', cellRenderer: AdditionalDataColumn },
    { field: 'events', cellRenderer: eventRenderer },
    { field: 'status', cellRenderer: StatusRenderer, filter: true },
  ];

  return (
    <div className="ag-theme-quartz" style={{ height: 600 }}>
      <DetailsModal
        rowDatum={selectedRowDatum}
        onHide={() => setSelectedRowDatum(undefined)}
      />
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        enableCellTextSelection={true}
      />
    </div>
  );
}

export default RequestTracker;
