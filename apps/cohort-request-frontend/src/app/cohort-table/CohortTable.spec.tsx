import { render } from '@testing-library/react';

import CohortTable from './CohortTable';

describe('CohortTable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <CohortTable cohortItems={[]} onEdit={() => null} onRemove={() => null} />
    );
    expect(baseElement).toBeTruthy();
  });
});
