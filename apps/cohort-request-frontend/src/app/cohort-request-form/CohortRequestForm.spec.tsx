import { render } from '@testing-library/react';

import CohortRequestForm from './CohortRequestForm';

describe('CohortRequestForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CohortRequestForm />);
    expect(baseElement).toBeTruthy();
  });
});
