import styles from './SubsetInputPanel.module.scss';
import React, { Dispatch, SetStateAction } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import IconWithTooltip from '../icon-with-tooltip/IconWithTooltip';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { parseInput } from '@cbioportal-cohort-request/cohort-request-utils';

export interface SubsetInput {
  studyIds: string;
  caseIds: string;
}

export const EMPTY_SUBSET_INPUT: SubsetInput = {
  studyIds: '',
  caseIds: '',
};

export function parseSubsetInput(input: SubsetInput): {
  studyIds: string[];
  caseIds: string[];
} {
  return {
    studyIds: parseInput(input.studyIds),
    caseIds: parseInput(input.caseIds),
  };
}

function StudyIdInfo() {
  const tooltip = (
    <>
      You can retrieve the ID from the study URL. For example{' '}
      <a
        href={'https://www.cbioportal.org/study/summary?id=pptc_2019'}
        target="_blank"
        rel="noopener noreferrer"
      >
        https://www.cbioportal.org/study/summary?id=pptc_2019
      </a>
      , pptc_2019 is the study ID
    </>
  );

  return (
    <IconWithTooltip
      icon={faInfoCircle}
      tooltipContent={tooltip}
      tooltipClassName={styles.studyInfoPopover}
    />
  );
}

interface SubsetInputPanelProps {
  input: SubsetInput;
  setInput: Dispatch<SetStateAction<SubsetInput>>;
}

function SubsetInputPanel(props: SubsetInputPanelProps) {
  const { input, setInput } = { ...props };

  const handleStudyIdChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    setInput({
      ...input,
      studyIds: target.value,
    });
  };

  const handleCaseIdChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    setInput({
      ...input,
      caseIds: target.value,
    });
  };

  return (
    <Row className="mb-3">
      <Col>
        <SubsetInputForm
          input={input}
          onStudyIdChange={handleStudyIdChange}
          onCaseIdChange={handleCaseIdChange}
        />
      </Col>
    </Row>
  );
}

interface SubsetMainInputProps {
  required?: boolean;
  input?: SubsetInput;
  onStudyIdChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCaseIdChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function SubsetMainInput(props: SubsetMainInputProps) {
  return (
    <>
      <Form.Group className="mb-3" controlId="subsetFormStudyId">
        <Form.Label>
          Please enter the cBioPortal study ID(s) you want to subset. Enter
          comma-separated study IDs if you would like to merge multiple
          cBioPortal studies. <StudyIdInfo />
        </Form.Label>
        <Form.Control
          required={props.required}
          type="text"
          placeholder="Enter study ID(s)"
          value={props.input?.studyIds}
          onChange={props.onStudyIdChange}
        />
        <Form.Control.Feedback type="invalid">
          Please enter study ID(s).
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="subsetFormCaseId">
        <Form.Label>
          Please enter the sample/patient IDs from the cBioPortal study you want
          to subset. You can enter sample/patient IDs from multiple cBioPortal
          studies if you would like to merge them.
        </Form.Label>
        <Form.Control
          required={props.required}
          as="textarea"
          rows={10}
          value={props.input?.caseIds}
          onChange={props.onCaseIdChange}
        />
        <Form.Control.Feedback type="invalid">
          Please enter the sample/patient IDs.
        </Form.Control.Feedback>
      </Form.Group>
    </>
  );
}

interface SubsetInputFormProps {
  input?: SubsetInput;
  onStudyIdChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCaseIdChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function SubsetInputForm(props: SubsetInputFormProps) {
  return (
    <SubsetMainInput
      required={true}
      input={props.input}
      onStudyIdChange={props.onStudyIdChange}
      onCaseIdChange={props.onCaseIdChange}
    />
  );
}

export default SubsetInputPanel;
