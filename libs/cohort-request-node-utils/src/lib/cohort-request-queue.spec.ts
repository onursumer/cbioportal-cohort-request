import { CohortRequestStatus } from '@cbioportal-cohort-request/cohort-request-utils';
import { CohortRequestQueue } from './cohort-request-queue';
import { delay } from './execute-command';

describe('CohortRequestQueue', () => {
  beforeEach((): void => {
    jest.setTimeout(10000);
  });

  it('should execute commands sequentially', async () => {
    const queue = new CohortRequestQueue('.', 200);

    const execution1result = await queue.enqueue(
      "echo 'enqueue(): execution 1 - instant'"
    );
    const execution2result = await queue.enqueue(
      "echo 'enqueue(): execution 2 - instant'"
    );
    const execution3result = await queue.enqueue(
      "sleep 0.5; echo 'enqueue(): execution 3 - 500ms delay'"
    );
    const execution4result = await queue.enqueue(
      "echo 'enqueue(): execution 4 - instant'"
    );
    const execution5result = await queue.enqueue(
      "sleep 0.3; echo 'enqueue(): execution 5 - 300ms delay'"
    );
    const execution6result = await queue.enqueue(
      "sleep 0.3; echo 'enqueue(): execution 6 - 300ms delay'"
    );
    const execution7result = await queue.enqueue(
      "echo 'enqueue(): execution 7 - instant'"
    );

    expect(execution1result.status).toBe(CohortRequestStatus.Complete);
    expect(execution2result.status).toBe(CohortRequestStatus.Complete);
    expect(execution3result.status).toBe(CohortRequestStatus.Pending);
    expect(execution4result.status).toBe(CohortRequestStatus.Queued);
    expect(execution5result.status).toBe(CohortRequestStatus.Queued);
    expect(execution6result.status).toBe(CohortRequestStatus.Queued);
    expect(execution7result.status).toBe(CohortRequestStatus.Queued);

    // wait enough for the queue to clear
    await delay(1200); // 1200 > 300 + 500 + 300

    const execution8result = await queue.enqueue(
      "echo 'enqueue(): execution 8 - instant'"
    );
    const execution9result = await queue.enqueue(
      "sleep 0.3; echo 'enqueue(): execution 9 - 300ms delay'"
    );

    expect(execution8result.status).toBe(CohortRequestStatus.Complete);
    expect(execution9result.status).toBe(CohortRequestStatus.Pending);

    // wait for the final item to complete
    await delay(350);
  });
});
