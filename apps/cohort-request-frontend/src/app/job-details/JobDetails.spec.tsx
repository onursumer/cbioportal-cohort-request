import { render } from '@testing-library/react';

import JobDetails from './JobDetails';

describe('JobDetails', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<JobDetails />);
    expect(baseElement).toBeTruthy();
  });
});
