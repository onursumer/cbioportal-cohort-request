import { CohortRequestStatus } from '@cbioportal-cohort-request/cohort-request-utils';
import { CohortRequestQueue } from './cohort-request-queue';
import { delay } from './execute-command';

const REQUEST_PLACEHOLDER = {
  name: 'unknown',
  id: '0',
  studyIds: [],
  caseIds: [],
  users: [],
};

function enqueue(queue: CohortRequestQueue, command: string, id: string) {
  return queue.enqueue(
    REQUEST_PLACEHOLDER,
    () => command,
    () => id
  );
}

describe('CohortRequestQueue', () => {
  it('should execute commands sequentially', async () => {
    const queue = new CohortRequestQueue(
      '.',
      '.',
      undefined,
      200,
      () => undefined,
      () => undefined
    );

    const execution1result = await enqueue(
      queue,
      "echo 'enqueue(): execution 1 - instant'",
      '1'
    );
    const execution2result = await enqueue(
      queue,
      "echo 'enqueue(): execution 2 - instant'",
      '2'
    );
    const execution3result = await enqueue(
      queue,
      "sleep 0.5; echo 'enqueue(): execution 3 - 500ms delay'",
      '3'
    );
    const execution4result = await enqueue(
      queue,
      "echo 'enqueue(): execution 4 - instant'",
      '4'
    );
    const execution5result = await enqueue(
      queue,
      "sleep 0.3; echo 'enqueue(): execution 5 - 300ms delay'",
      '5'
    );
    const execution6result = await enqueue(
      queue,
      "sleep 0.3; echo 'enqueue(): execution 6 - 300ms delay'",
      '6'
    );
    const execution7result = await enqueue(
      queue,
      "echo 'enqueue(): execution 7 - instant'",
      '7'
    );

    expect(execution1result.status).toBe(CohortRequestStatus.Complete);
    expect(execution2result.status).toBe(CohortRequestStatus.Complete);
    expect(execution3result.status).toBe(CohortRequestStatus.Pending);
    expect(execution4result.status).toBe(CohortRequestStatus.Queued);
    expect(execution5result.status).toBe(CohortRequestStatus.Queued);
    expect(execution6result.status).toBe(CohortRequestStatus.Queued);
    expect(execution7result.status).toBe(CohortRequestStatus.Queued);

    // initial status should be same as the execution result status
    expect(queue.getItemStatus('1')).toBe(CohortRequestStatus.Complete);
    expect(queue.getItemStatus('2')).toBe(CohortRequestStatus.Complete);
    expect(queue.getItemStatus('3')).toBe(CohortRequestStatus.Pending);
    expect(queue.getItemStatus('4')).toBe(CohortRequestStatus.Queued);
    expect(queue.getItemStatus('5')).toBe(CohortRequestStatus.Queued);
    expect(queue.getItemStatus('6')).toBe(CohortRequestStatus.Queued);
    expect(queue.getItemStatus('7')).toBe(CohortRequestStatus.Queued);

    // wait enough for the queue to clear
    await delay(1200); // 1200 > 300 + 500 + 300

    const execution8result = await enqueue(
      queue,
      "sleep 0.3; echo 'enqueue(): execution 8 - 300ms delayed error'; exit 1",
      '8'
    );
    const execution8dupResult = await enqueue(
      queue,
      "echo 'enqueue(): execution 8 dup - this should not execute, because still pending'",
      '8'
    );
    const execution9result = await enqueue(
      queue,
      "echo 'enqueue(): execution 9 - instant error'; exit 1",
      '9'
    );

    expect(execution8result.status).toBe(CohortRequestStatus.Pending);
    expect(execution8dupResult.status).toBe(CohortRequestStatus.Pending);
    expect(execution9result.status).toBe(CohortRequestStatus.Queued);

    // initial status should be same as the execution result status
    expect(queue.getItemStatus('8')).toBe(CohortRequestStatus.Pending);
    expect(queue.getItemStatus('9')).toBe(CohortRequestStatus.Queued);

    // wait for the final item to complete
    await delay(350);

    // final status should be either Complete or Error
    expect(queue.getItemStatus('1')).toBe(CohortRequestStatus.Complete);
    expect(queue.getItemStatus('2')).toBe(CohortRequestStatus.Complete);
    expect(queue.getItemStatus('3')).toBe(CohortRequestStatus.Complete);
    expect(queue.getItemStatus('4')).toBe(CohortRequestStatus.Complete);
    expect(queue.getItemStatus('5')).toBe(CohortRequestStatus.Complete);
    expect(queue.getItemStatus('6')).toBe(CohortRequestStatus.Complete);
    expect(queue.getItemStatus('7')).toBe(CohortRequestStatus.Complete);
    expect(queue.getItemStatus('8')).toBe(CohortRequestStatus.Error);
    expect(queue.getItemStatus('9')).toBe(CohortRequestStatus.Error);

    // try executing again with same hash
    const execution7dupResult = await enqueue(
      queue,
      "echo 'enqueue(): execution 7 dup - should not execute because already completed'",
      '7'
    );

    const execution8dup2Result = await enqueue(
      queue,
      "echo 'enqueue(): execution 8 dup 2 - executing again because of a previous error'",
      '8'
    );

    expect(execution7dupResult.status).toBe(CohortRequestStatus.Complete);
    expect(execution8dup2Result.status).toBe(CohortRequestStatus.Complete);

    // initial status should be same as the execution result status
    expect(queue.getItemStatus('7')).toBe(CohortRequestStatus.Complete);
    expect(queue.getItemStatus('8')).toBe(CohortRequestStatus.Complete);
  });
});
