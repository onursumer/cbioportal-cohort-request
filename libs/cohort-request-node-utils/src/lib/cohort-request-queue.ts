import { CohortRequestStatus } from '@cbioportal-cohort-request/cohort-request-utils';

import { ExecResult, executeCommand } from './execute-command';

interface QueueItem {
  uniqueId: string;
  command: string;
  resolve: (value: ExecResult) => void;
  reject: (reason: any) => void;
}

enum DequeueResult {
  Pending = 'Pending',
  Empty = 'Empty',
  Success = 'Success',
}

export class CohortRequestQueue {
  // TODO this variable keeps track of every single request active or completed
  //  over time this may consume substantial amount of memory
  itemStatus: { [uniqueId: string]: CohortRequestStatus };

  items: QueueItem[];
  workingOnPromise: boolean;

  constructor(
    private shellScriptPath: string,
    private timeout: number | undefined = undefined
  ) {
    this.items = [];
    this.workingOnPromise = false;
    this.itemStatus = {};
  }

  public enqueue(command: string, hash?: string): Promise<Partial<ExecResult>> {
    // check for duplicates
    const uniqueId = hash || command;
    const status = this.itemStatus[uniqueId];
    // do not enqueue duplicate queries, just return status if it is already Queued, Pending, or Complete
    if (
      status === CohortRequestStatus.Queued ||
      status === CohortRequestStatus.Pending ||
      status === CohortRequestStatus.Complete
    ) {
      return Promise.resolve({
        status,
        // add an output to indicate this is a duplicate request
        output: {
          code: 0,
          stderr: '',
          stdout:
            'Duplicate Request. This cohort and case id combination has been requested before.',
        },
      });
    }

    return new Promise<Partial<ExecResult>>((resolve, reject) => {
      this.items.push({
        uniqueId,
        command,
        resolve,
        reject,
      });
      if (this.dequeue() === DequeueResult.Pending) {
        this.itemStatus[uniqueId] = CohortRequestStatus.Queued;
        resolve({
          status: CohortRequestStatus.Queued,
        });
      }
    });
  }

  public dequeue() {
    if (this.workingOnPromise) {
      return DequeueResult.Pending;
    }
    const item = this.items.shift();
    if (!item) {
      return DequeueResult.Empty;
    }
    const onError = (err: any) => {
      this.workingOnPromise = false;
      this.itemStatus[item.uniqueId] = CohortRequestStatus.Error;
      item.reject(err);
      this.dequeue();
    };

    try {
      this.workingOnPromise = true;
      this.itemStatus[item.uniqueId] = CohortRequestStatus.Pending;
      executeCommand(item.command, this.shellScriptPath, this.timeout)
        .then((value) => {
          value.execPromise
            .then(() => {
              this.workingOnPromise = false;
              this.itemStatus[item.uniqueId] = CohortRequestStatus.Complete;
              this.dequeue();
            })
            .catch(onError);
          item.resolve(value);
        })
        .catch(onError);
    } catch (err) {
      onError(err);
    }

    return DequeueResult.Success;
  }

  public getItemStatus(uniqueId: string): CohortRequestStatus | undefined {
    return this.itemStatus[uniqueId];
  }
}
