import { Level } from 'level';
import { Event } from '@cbioportal-cohort-request/cohort-request-utils';
import { fetchAllRecords, insertRecord } from './repository';

export type EventDB = Level<string, Event>;

export function initEventDB(location = 'leveldb/events'): EventDB {
  return new Level<string, Event>(location, { valueEncoding: 'json' });
}

export function fetchAllEvents(eventDB?: EventDB): Promise<Event[]> {
  return fetchAllRecords(eventDB);
}

export function fetchEventsByJobId(
  jobId: string,
  eventDB?: EventDB
): Promise<Event[]> {
  return fetchAllEvents(eventDB).then((events) =>
    events.filter((e) => e.jobId === jobId)
  );
}

export function insertEvent(event: Event, eventDB?: EventDB): Promise<void> {
  return insertRecord(
    event,
    (event) => `${event.timestamp}_${event.jobId}_${event.status}`,
    eventDB
  );
}
