import { getRequestStatusFromEvents } from './cohort-request-status';
import { CohortRequestStatus, Event } from './cohort-request-model';

function mockEventsForJob(
  jobId: string,
  finalStatus: CohortRequestStatus,
  numberOfDuplicates = 0,
  queued = false,
  numberOfPreviousFailures = 0
) {
  const events: Event[] = [];
  const start = 2 * numberOfPreviousFailures + 1;

  // add a pair of Pending and Error statuses for each previous failure
  for (let t = 1; t < start; t += 2) {
    events.push({
      jobId,
      status: CohortRequestStatus.Pending,
      timestamp: t,
    });

    events.push({
      jobId,
      status: CohortRequestStatus.Error,
      timestamp: t + 1,
    });
  }

  // add a queue event if the event is queued prior to execution
  if (queued) {
    events.push({
      jobId,
      status: CohortRequestStatus.Queued,
      timestamp: start,
    });
  }

  // if the final status is queued it means that the job has never started running (no pending status)
  if (finalStatus !== CohortRequestStatus.Queued) {
    events.push({
      jobId,
      status: CohortRequestStatus.Pending,
      timestamp: start + 1,
    });
  }

  // add the duplicate requests after pending
  // note: a duplicate event could also happen between queued and pending, or after complete
  // but that shouldn't matter for testing purposes
  for (let t = start + 2; t < start + 2 + numberOfDuplicates; t++) {
    events.push({
      jobId,
      status: CohortRequestStatus.Duplicate,
      timestamp: t,
    });
  }

  // we already reached final status of being queued or pending,
  // no need to add more events in that case
  if (
    finalStatus !== CohortRequestStatus.Queued &&
    finalStatus !== CohortRequestStatus.Pending
  ) {
    events.push({
      jobId,
      status: finalStatus,
      timestamp: start + 2 + numberOfDuplicates,
    });
  }

  return events;
}

describe('getRequestStatusFromEvents', () => {
  it('should derive latest status from events', () => {
    const events: Event[] = [
      ...mockEventsForJob('job1', CohortRequestStatus.Complete, 0, false, 0),
      ...mockEventsForJob('job2', CohortRequestStatus.Pending, 2, true, 0),
      ...mockEventsForJob('job3', CohortRequestStatus.Error, 1, false, 0),
      ...mockEventsForJob('job4', CohortRequestStatus.Error, 0, true, 0),
      ...mockEventsForJob('job5', CohortRequestStatus.Queued, 4, true, 0),
      ...mockEventsForJob('job6', CohortRequestStatus.Complete, 2, true, 0),
      ...mockEventsForJob('job7', CohortRequestStatus.Complete, 0, true, 3),
      ...mockEventsForJob('job8', CohortRequestStatus.Complete, 3, false, 2),
      ...mockEventsForJob('job9', CohortRequestStatus.Pending, 0, false, 2),
      ...mockEventsForJob('job10', CohortRequestStatus.Error, 1, true, 4),
    ];

    const statusMap = getRequestStatusFromEvents(events);

    expect(statusMap['job1']).toBe(CohortRequestStatus.Complete);
    expect(statusMap['job2']).toBe(CohortRequestStatus.Error);
    expect(statusMap['job3']).toBe(CohortRequestStatus.Error);
    expect(statusMap['job4']).toBe(CohortRequestStatus.Error);
    expect(statusMap['job5']).toBe(CohortRequestStatus.Error);
    expect(statusMap['job6']).toBe(CohortRequestStatus.Complete);
    expect(statusMap['job7']).toBe(CohortRequestStatus.Complete);
    expect(statusMap['job8']).toBe(CohortRequestStatus.Complete);
    expect(statusMap['job9']).toBe(CohortRequestStatus.Error);
    expect(statusMap['job10']).toBe(CohortRequestStatus.Error);
  });
});
