import { render } from '@testing-library/react';

import RequestTracker from './RequestTracker';
import { BrowserRouter } from 'react-router-dom';

describe('RequestTracker', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <RequestTracker />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });
});
