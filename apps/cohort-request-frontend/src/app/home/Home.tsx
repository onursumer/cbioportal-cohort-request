import { Col, Container, Row } from 'react-bootstrap';
import CohortRequestForm from '../cohort-request-form/CohortRequestForm';
import styles from './Home.module.scss';

/* eslint-disable-next-line */
export interface HomeProps {}

export function Home(props: HomeProps) {
  return (
    <Container
      fluid={true}
      style={{
        paddingTop: 20,
        paddingBottom: 140,
        color: '#2c3e50',
      }}
    >
      <Row className="mb-5">
        <Col md={6} className="mx-auto d-flex flex-column align-items-center">
          <span className={styles.homePageTitle}>
            cBioPortal Cohort Request
          </span>
        </Col>
      </Row>
      <Row className="mb-5">
        <Col md={6} className="mx-auto">
          <CohortRequestForm />
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
