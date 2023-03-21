import { render } from '@testing-library/react';

import SubsetInputPanel, { SubsetType } from './SubsetInputPanel';

describe('SubsetInputPanel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <SubsetInputPanel subsetType={SubsetType.SingleStudy} />
    );
    expect(baseElement).toBeTruthy();
  });
});
