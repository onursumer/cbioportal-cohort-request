import { CohortRequestStatus } from '@cbioportal-cohort-request/cohort-request-utils';

import { ExecResult, executeCommand } from './execute-command';

interface QueueItem {
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
  items: QueueItem[];
  workingOnPromise: boolean;

  constructor(
    private shellScriptPath: string,
    private timeout: number | undefined = undefined
  ) {
    this.items = [];
    this.workingOnPromise = false;
  }

  public enqueue(command: string) {
    // TODO check for duplicates
    return new Promise<Partial<ExecResult>>((resolve, reject) => {
      this.items.push({
        command,
        resolve,
        reject,
      });
      if (this.dequeue() === DequeueResult.Pending) {
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
      item.reject(err);
      this.dequeue();
    };

    try {
      this.workingOnPromise = true;
      executeCommand(item.command, this.shellScriptPath, this.timeout)
        .then((value) => {
          value.execPromise
            .then(() => {
              this.workingOnPromise = false;
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
}
