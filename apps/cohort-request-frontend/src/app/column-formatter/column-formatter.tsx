import {
  CohortRequestStatus,
  Event,
} from '@cbioportal-cohort-request/cohort-request-utils';
import IconWithTooltip from '../icon-with-tooltip/IconWithTooltip';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { filesize } from 'filesize';
import React from 'react';
import { Link } from 'react-router-dom';

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

export function dateFormatter(props: { value: string }) {
  return new Date(props.value).toLocaleString();
}

export function stringArrayFormatter(props: { value?: string[] }) {
  return props.value?.join(', ');
}
