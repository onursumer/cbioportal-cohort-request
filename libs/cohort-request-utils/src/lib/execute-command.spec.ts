import { CohortRequestStatus } from './cohort-request-model';
import { executeCommand } from './execute-command';

describe('executeCommand', () => {
  it('should complete when execution time is below the threshold', async () => {
    const { status, output } = await executeCommand(
      "echo 'executeCommand(): Hello World!'",
      '.',
      500
    );

    expect(status).toBe(CohortRequestStatus.Complete);
    expect(output.code).toBe(0);
    expect(output.stdout).toContain('Hello World!');
  });

  it('should be pending when execution time is above the threshold', async () => {
    const { status, output, execPromise } = await executeCommand(
      "sleep 1; echo 'executeCommand(): Goodbye World!';",
      '.',
      500
    );

    expect(status).toBe(CohortRequestStatus.Pending);
    expect(output).toBeUndefined();

    const execOutput = await execPromise;

    expect(execOutput.code).toBe(0);
    expect(execOutput.stdout).toContain('Goodbye World!');
  });
});
