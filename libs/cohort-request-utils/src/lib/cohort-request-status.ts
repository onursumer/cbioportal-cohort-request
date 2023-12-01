import { chain, Dictionary, maxBy } from 'lodash';
import { CohortRequestStatus, Event } from './cohort-request-model';

export function getRequestStatusFromEvents(
  events: Event[]
): Dictionary<CohortRequestStatus> {
  return (
    chain(events)
      // ignore duplicate events
      .filter((event) => event.status !== CohortRequestStatus.Duplicate)
      .groupBy((d) => d.jobId)
      .map((value) => maxBy(value, (v) => v.eventDate))
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
      .value()
  );
}