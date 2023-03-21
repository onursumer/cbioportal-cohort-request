import { render } from '@testing-library/react';

import IconWithTooltip from './IconWithTooltip';
import { faCode } from '@fortawesome/free-solid-svg-icons';

describe('IconWithTooltip', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <IconWithTooltip icon={faCode} tooltipContent={<>Test</>} />
    );
    expect(baseElement).toBeTruthy();
  });
});
