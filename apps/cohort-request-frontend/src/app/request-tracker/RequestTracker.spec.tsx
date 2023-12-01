import { render } from '@testing-library/react';

import RequestTracker from './RequestTracker';

describe('RequestTracker', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RequestTracker />);
    expect(baseElement).toBeTruthy();
  });
});
