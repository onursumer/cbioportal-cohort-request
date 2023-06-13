import { render } from '@testing-library/react';

import { SubsetType } from '@cbioportal-cohort-request/cohort-request-utils';
import SubsetInputPanel, { EMPTY_SUBSET_INPUT } from './SubsetInputPanel';

describe('SubsetInputPanel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <SubsetInputPanel
        subsetType={SubsetType.SingleStudy}
        cohorts={{}}
        setCohorts={() => undefined}
        input={EMPTY_SUBSET_INPUT}
        setInput={() => undefined}
      />
    );
    expect(baseElement).toBeTruthy();
  });
});
