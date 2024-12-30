import styles from './EventDetails.module.scss';
import { Col, Container, Row } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Event,
  fetchEvents,
} from '@cbioportal-cohort-request/cohort-request-utils';
import {
  AdditionalDataColumn,
  dateFormatter,
  DetailsRow,
  StatusColumn,
  stringArrayFormatter,
} from '../table-formatter/table-formatter';

/* eslint-disable-next-line */
export interface EventDetailsProps {}

export function EventDetails(props: EventDetailsProps) {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | undefined>(undefined);

  useEffect(() => {
    if (id) {
      fetchEvents({ eventId: id }).then((result) => {
        setEvent(result.data[0]);
      });
    }
  }, [id]);

  return event ? (
    <Container
      fluid={true}
      style={{
        paddingTop: 20,
        paddingBottom: 20,
        color: '#2c3e50',
      }}
    >
      <Row>
        <Col className="mx-auto d-flex flex-column align-items-center">
          <span className={styles.eventPageTitle}>Event Details</span>
        </Col>
      </Row>
      <DetailsRow
        title={<strong>Status:</strong>}
        value={<StatusColumn value={event.status} />}
      />
      <DetailsRow
        title={<strong>Event Date:</strong>}
        value={dateFormatter({ value: event.timestamp })}
      />
      <DetailsRow title={<strong>Job ID:</strong>} value={event.jobId} />
      <DetailsRow
        title={<strong>Requester ID:</strong>}
        value={event.requesterId}
      />
      <DetailsRow
        title={<strong>Requester Name:</strong>}
        value={event.requesterName}
      />
      <DetailsRow
        title={<strong>User ID(s):</strong>}
        value={stringArrayFormatter({ value: event.users })}
      />
      <DetailsRow
        title={<strong>Additional Data:</strong>}
        value={<AdditionalDataColumn value={event.additionalData} />}
      />
      <DetailsRow
        title={<strong>Exit Code:</strong>}
        value={event.output?.code}
      />
      <DetailsRow
        title={<strong>stdout:</strong>}
        value={<span className={styles.stdout}>{event.output?.stdout}</span>}
      />
      <DetailsRow
        title={<strong>stderr:</strong>}
        value={<span className={styles.stdout}>{event.output?.stderr}</span>}
      />
    </Container>
  ) : null;
}

export default EventDetails;
