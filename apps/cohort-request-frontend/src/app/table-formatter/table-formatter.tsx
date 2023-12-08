import {
  CohortRequestStatus,
  Event,
  getEventPrimaryKey,
} from '@cbioportal-cohort-request/cohort-request-utils';
import IconWithTooltip from '../icon-with-tooltip/IconWithTooltip';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { filesize } from 'filesize';
import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';

export function defaultGridProps() {
  return {
    enableCellTextSelection: true,
    domLayout: 'autoHeight',
    pagination: true,
    paginationPageSizeSelector: [10, 25, 50, 100, 500],
    paginationPageSize: 25,
    autoSizeStrategy: {
      type: 'fitGridWidth',
      defaultMinWidth: 150,
    },
  };
}

export function DetailsRow(props: {
  title: JSX.Element | string;
  value: JSX.Element | string | number | undefined;
}) {
  return (
    <Row>
      <Col className="d-flex flex-column col-2">{props.title}</Col>
      <Col className="d-flex flex-column">{props.value}</Col>
    </Row>
  );
}

export function StatusColumn(props: { value: CohortRequestStatus }) {
  const statusStyleMap = {
    [CohortRequestStatus.Error]: 'text-danger',
    [CohortRequestStatus.Complete]: 'text-success',
    [CohortRequestStatus.Pending]: 'text-warning',
    [CohortRequestStatus.Duplicate]: 'text-secondary',
    [CohortRequestStatus.Queued]: 'text-primary',
  };

  return <strong className={statusStyleMap[props.value]}>{props.value}</strong>;
}

export function JobIdColumn(props: { value: string }) {
  return <Link to={`/job/${props.value}`}>{props.value}</Link>;
}

export function EventDateColumn(props: { value: number; data: Event }) {
  return (
    <Link to={`/event/${getEventPrimaryKey(props.data)}`}>
      {dateFormatter(props)}
    </Link>
  );
}

export function EventColumn(props: { value: Event[] }) {
  const errorCount = props.value.filter(
    (e) => e.status === CohortRequestStatus.Error
  ).length;
  const duplicateRequestCount = props.value.filter(
    (e) => e.status === CohortRequestStatus.Duplicate
  ).length;

  const tooltipContent = (
    <>
      {errorCount > 1 && <div>Retries: {errorCount - 1}</div>}
      {duplicateRequestCount > 0 && (
        <div>Duplicates: {duplicateRequestCount}</div>
      )}
      <div>
        <Link to={`/job/${props.value[0]?.jobId}`}>See Details</Link>
      </div>
    </>
  );

  return (
    <span>
      {props.value.length}{' '}
      <IconWithTooltip icon={faInfoCircle} tooltipContent={tooltipContent} />
    </span>
  );
}

export function AdditionalDataColumn(props: {
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

export function dateFormatter(props: { value: number }) {
  return new Date(props.value).toLocaleString();
}

export function stringArrayFormatter(props: { value?: string[] }) {
  return props.value?.join(', ') || '';
}
