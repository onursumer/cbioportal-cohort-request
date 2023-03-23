import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import {
  CohortItem,
  sendCohortRequest,
  SubsetType,
} from '@cbioportal-cohort-request/cohort-request-utils';
import SubsetInputPanel, {
  EMPTY_SUBSET_INPUT,
  parseSubsetInput,
  SubsetInput,
} from '../subset-input-panel/SubsetInputPanel';

/* eslint-disable-next-line */
export interface CohortRequestFormProps {}

function generateCohortList(
  subsetType: SubsetType | undefined,
  cohorts: { [studyId: string]: CohortItem },
  input: SubsetInput
): CohortItem[] {
  return subsetType !== SubsetType.MergedStudy || _.isEmpty(cohorts)
    ? [parseSubsetInput(input)]
    : Object.values(cohorts);
}

export function CohortRequestForm(props: CohortRequestFormProps) {
  const [cohorts, setCohorts] = useState<{ [studyId: string]: CohortItem }>({});
  const [subsetInput, setSubsetInput] =
    useState<SubsetInput>(EMPTY_SUBSET_INPUT);
  const [name, setName] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [users, setUsers] = useState<string | undefined>(undefined);
  const [subsetType, setSubsetType] = useState<SubsetType | undefined>(
    undefined
  );
  const [validated, setValidated] = useState(false);
  const [valid, setValid] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // do not trigger an actual form submit event
    e.preventDefault();
    e.stopPropagation();
    setValidated(true);

    const form = e.currentTarget;
    const isValid = form.checkValidity();
    setValid(isValid);

    if (isValid) {
      // all valid, ready to call the corresponding API
      sendCohortRequest({
        name,
        id,
        type: subsetType || SubsetType.SingleStudy,
        cohorts: generateCohortList(subsetType, cohorts, subsetInput),
        users: _.uniq(users?.split(/\s+/)) || [],
      }).then((response) => console.log(response)); // TODO display a user friendly message
    }
  };

  return (
    <Form noValidate={true} validated={validated} onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="mainFormName">
        <Form.Label>Name</Form.Label>
        <Form.Control
          required={true}
          type="text"
          placeholder="Enter name"
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Form.Control.Feedback type="invalid">
          Please enter your name.
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="mainFormId">
        <Form.Label>MSK ID</Form.Label>
        <Form.Control
          required={true}
          type="text"
          placeholder="Enter MSK ID"
          onChange={(e) => setId(e.currentTarget.value)}
        />
        <Form.Control.Feedback type="invalid">
          Please enter your MSK ID.
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3" controlId="mainFormSubsetSelector">
        <Form.Label>
          Select the type of study <FontAwesomeIcon icon={faArrowDown} />
        </Form.Label>
        <Form.Check
          required={true}
          label="Subset an existing cBioPortal study"
          name="subset"
          type="radio"
          id="singleStudyRadio"
          onChange={() => setSubsetType(SubsetType.SingleStudy)}
        />
        <Form.Check
          required={true}
          label="Subset and/or merge existing cBioPortal studies"
          name="subset"
          type="radio"
          id="mergedStudyRadio"
          onChange={() => setSubsetType(SubsetType.MergedStudy)}
        />
      </Form.Group>
      {subsetType && (
        <SubsetInputPanel
          subsetType={subsetType}
          cohorts={cohorts}
          setCohorts={setCohorts}
          input={subsetInput}
          setInput={setSubsetInput}
        />
      )}
      <Form.Group className="mb-3" controlId="mainFormUserId">
        <Form.Label>
          Please enter the users who need access to the study
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter users"
          onChange={(e) => setUsers(e.currentTarget.value)}
        />
      </Form.Group>
      <Button disabled={valid} variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
}

export default CohortRequestForm;