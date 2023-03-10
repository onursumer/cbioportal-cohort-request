import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";
import {Button, Form, OverlayTrigger, Popover} from "react-bootstrap";

import styles from './CohortRequestForm.module.scss';

/* eslint-disable-next-line */
export interface CohortRequestFormProps {}

export enum SubsetType {
  SingleStudy = 'SINGLE_STUDY',
  MergedStudy = 'MERGED_STUDY',
}

function StudyIdInfo() {
  // Alternative: Use Tooltip instead of Popover
  // const renderTooltip = (props: TooltipProps) => (
  //   <Tooltip
  //     id="studyInfoTooltip"
  //     className={styles.studyInfoTooltip}
  //     {...props}
  //   >
  //     ...
  //   </Tooltip>
  // );
  const popover = (
    <Popover id="popover-basic" className={styles.studyInfoPopover}>
      <Popover.Body>
        You can retrieve the ID from the study URL.{' '}
        For example{' '}
        <a
          href={"https://www.cbioportal.org/study/summary?id=pptc_2019"}
          target="_blank"
          rel="noopener noreferrer"
        >
          https://www.cbioportal.org/study/summary?id=pptc_2019
        </a>, pptc_2019 is the study ID
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 250, hide: 1000 }}
      overlay={popover}
    >
      <FontAwesomeIcon icon={faInfoCircle} />
    </OverlayTrigger>
  );
}

function SubsetInputForm(props: {subsetType: SubsetType}) {
  // TODO props.subsetType should change the input form,
  //  e.g: multiple text areas depending on the number of study ids?
  return (
    <>
      <Form.Group className="mb-3" controlId="subsetFormStudyId">
        <Form.Label>Please enter the cBioPortal study ID you want to subset <StudyIdInfo /></Form.Label>
        <Form.Control type="text" placeholder="Enter study ID" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="subsetFormCaseId">
        <Form.Label>Please enter the sample/patient IDs from the cBioPortal study you want to subset</Form.Label>
        <Form.Control as="textarea" rows={10} />
      </Form.Group>
    </>
  );
}

export function CohortRequestForm(props: CohortRequestFormProps) {
  const [subsetType, setSubsetType] = useState<SubsetType | undefined>(undefined);

  return (
    <Form>
      <Form.Group className="mb-3" controlId="mainFormName">
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" placeholder="Enter name" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="mainFormId">
        <Form.Label>MSK ID</Form.Label>
        <Form.Control type="text" placeholder="Enter MSK ID" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="mainFormSubsetSelector">
        <Form.Label>Select the type of study <FontAwesomeIcon icon={faArrowDown} /></Form.Label>
        <Form.Check
          label="Subset an existing cBioPortal study"
          name="subset"
          type="radio"
          id="singleStudyRadio"
          onChange={() => setSubsetType(SubsetType.SingleStudy)}
        />
        <Form.Check
          label="Subset and/or merge existing cBioPortal studies"
          name="subset"
          type="radio"
          id="mergedStudyRadio"
          onChange={() => setSubsetType(SubsetType.MergedStudy)}
        />
      </Form.Group>
      {subsetType && <SubsetInputForm subsetType={subsetType}/>}
      <Form.Group className="mb-3" controlId="mainFormUserId">
        <Form.Label>Please enter the users who need access to the study</Form.Label>
        <Form.Control type="text" placeholder="Enter users" />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
}

export default CohortRequestForm;
