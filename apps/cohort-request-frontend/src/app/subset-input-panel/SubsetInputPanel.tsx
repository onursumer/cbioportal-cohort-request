import styles from './SubsetInputPanel.module.scss';
import React, { useState } from 'react';
import _ from 'lodash';
import { Button, Col, Form, Row } from 'react-bootstrap';
import IconWithTooltip from '../icon-with-tooltip/IconWithTooltip';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import CohortTable, { CohortItem } from '../cohort-table/CohortTable';

export enum SubsetType {
  SingleStudy = 'SINGLE_STUDY',
  MergedStudy = 'MERGED_STUDY',
}

interface SubsetInput {
  studyId: string;
  caseIds: string;
}

const EMPTY_SUBSET_INPUT: SubsetInput = {
  studyId: '',
  caseIds: '',
};

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
  subsetType: SubsetType;
}

function SubsetInputPanel(props: SubsetInputPanelProps) {
  const [cohorts, setCohorts] = useState<{ [studyId: string]: CohortItem }>({});
  const [input, setInput] = useState<SubsetInput>(EMPTY_SUBSET_INPUT);

  const handleStudyIdChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    setInput({
      ...input,
      studyId: target.value,
    });
  };

  const handleCaseIdChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    setInput({
      ...input,
      caseIds: target.value,
    });
  };

  const handleAddStudy = () => {
    const cohort = input
      ? {
          studyId: input.studyId.trim(),
          caseIds: _(input.caseIds.split(/\s+/)).compact().uniq().value(),
        }
      : undefined;

    if (cohort && !_.isEmpty(cohort.studyId) && !_.isEmpty(cohort.caseIds)) {
      setCohorts({ ...cohorts, [cohort.studyId]: cohort });
      setInput(EMPTY_SUBSET_INPUT);
    }
  };

  const onRemoveStudy = (studyId: string) => {
    setCohorts(_.omit(cohorts, [studyId]));
  };

  const onEditStudy = (studyId: string) => {
    if (cohorts[studyId]) {
      setInput({
        studyId,
        caseIds: cohorts[studyId].caseIds.join('\n'),
      });
    }
  };

  const cohortItems = Object.values(cohorts);

  return (
    <Row className="mb-3">
      <Col md={6}>
        <SubsetInputForm
          subsetType={props.subsetType}
          onAddStudy={handleAddStudy}
          cohorts={cohorts}
          input={input}
          onStudyIdChange={handleStudyIdChange}
          onCaseIdChange={handleCaseIdChange}
        />
      </Col>
      {props.subsetType === SubsetType.MergedStudy && (
        <Col md={6}>
          <CohortTable
            cohortItems={cohortItems}
            onEdit={onEditStudy}
            onRemove={onRemoveStudy}
          />
        </Col>
      )}
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
          Please enter the cBioPortal study ID you want to subset{' '}
          <StudyIdInfo />
        </Form.Label>
        <Form.Control
          required={props.required}
          type="text"
          placeholder="Enter study ID"
          value={props.input?.studyId}
          onChange={props.onStudyIdChange}
        />
        <Form.Control.Feedback type="invalid">
          Please enter study ID(s).
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="subsetFormCaseId">
        <Form.Label>
          Please enter the sample/patient IDs from the cBioPortal study you want
          to subset
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
  subsetType: SubsetType;
  onAddStudy: () => void;
  cohorts: { [studyId: string]: CohortItem };
  input?: SubsetInput;
  onStudyIdChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCaseIdChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function SubsetInputForm(props: SubsetInputFormProps) {
  return (
    <>
      <SubsetMainInput
        required={
          props.subsetType === SubsetType.SingleStudy ||
          _.isEmpty(props.cohorts)
        }
        input={props.input}
        onStudyIdChange={props.onStudyIdChange}
        onCaseIdChange={props.onCaseIdChange}
      />
      {props.subsetType === SubsetType.MergedStudy && (
        <Button variant="primary" type="button" onClick={props.onAddStudy}>
          {props.input && props.cohorts[props.input.studyId]
            ? `Update Study`
            : `Add Study`}
        </Button>
      )}
    </>
  );
}

export default SubsetInputPanel;
