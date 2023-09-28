import { render } from '@testing-library/react';

import FileInputPanel from './FileInputPanel';

describe('FileInputPanel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FileInputPanel setFileList={() => undefined} />
    );
    expect(baseElement).toBeTruthy();
  });
});
