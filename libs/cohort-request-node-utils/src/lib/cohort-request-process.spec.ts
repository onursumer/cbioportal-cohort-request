import { createHash, persistFiles } from './cohort-request-process';

describe('createHash', () => {
  it('should create hash', async () => {
    expect(createHash('study1,study2:case1,case2')).toEqual(
      'c73652eac9fbaa3ecca92c424167de60'
    );
  });
});

describe('persistFiles', () => {
  it('should create multiple files in the filesystem', async () => {
    const files = [
      {
        filename: 'test1.txt',
        content: 'test1 content',
      },
      {
        filename: 'test2.txt',
        content: 'test2 content',
      },
    ];

    // TODO disabling for now: assert and then remove files

    // // persist once
    // persistFiles(files, 'testData', 'testJob');
    // // persist again with updated content
    // files[0].content = 'test1 content overwritten';
    // files[1].content = 'test2 content overwritten';
    // persistFiles(files, 'testData', 'testJob');
  });
});
