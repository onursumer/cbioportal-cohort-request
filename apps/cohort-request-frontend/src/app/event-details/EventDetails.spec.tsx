import { render } from '@testing-library/react';

import EventDetails from './EventDetails';

describe('EventDetails', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EventDetails />);
    expect(baseElement).toBeTruthy();
  });
});
