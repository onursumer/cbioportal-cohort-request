import { render } from '@testing-library/react';

import SubsetInputPanel, { EMPTY_SUBSET_INPUT } from './SubsetInputPanel';

describe('SubsetInputPanel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <SubsetInputPanel input={EMPTY_SUBSET_INPUT} setInput={() => undefined} />
    );
    expect(baseElement).toBeTruthy();
  });
});
