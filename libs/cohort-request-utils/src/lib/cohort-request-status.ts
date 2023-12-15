import { chain, Dictionary, maxBy } from 'lodash';
import { CohortRequestStatus, Event } from './cohort-request-model';

export function getRequestStatusFromEvents(
  events: Event[]
): Dictionary<CohortRequestStatus> {
  return chain(groupEventsByJobIdIgnoreDuplicates(events))
    .map((value) => maxBy(value, (v) => v.timestamp))
    .map((event) => ({
      ...event,
      // if no 'Complete' event logged for a certain job, then assume that it has failed
      status:
        event.status === CohortRequestStatus.Complete
          ? CohortRequestStatus.Complete
          : CohortRequestStatus.Error,
    }))
    .keyBy((d) => d.jobId)
    .transform((result, value, key) => {
      result[key] = value.status;
    }, {})
    .value();
}

export function groupEventsByJobIdIgnoreDuplicates(events: Event[]) {
  return groupEventsByJobId(
    events,
    (event) => event.status !== CohortRequestStatus.Duplicate
  );
}

export function groupEventsByJobId(
  events: Event[],
  filter: (event: Event) => boolean = () => true
) {
  return (
    chain(events)
      // ignore duplicate events
      .filter(filter)
      .groupBy((d) => d.jobId)
      .value()
  );
}

export function getEventPrimaryKey(event: Event) {
  return `${event.timestamp}_${event.jobId}_${event.status}`;
}
