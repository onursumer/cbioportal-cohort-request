import { Level } from 'level';
import { Event } from '@cbioportal-cohort-request/cohort-request-utils';
import { fetchAllRecords } from './repository';

export type EventDB = Level<number, Event>;

export function initEventDB(location = 'leveldb/events'): EventDB {
  return new Level<number, Event>(location, { valueEncoding: 'json' });
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
