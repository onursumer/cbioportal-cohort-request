import {
  CohortRequest,
  CohortRequestStatus,
} from '@cbioportal-cohort-request/cohort-request-utils';
import {
  defaultJobCompleteHandler,
  defaultJobErrorHandler,
  defaultRequestToCommand,
  defaultRequestToUniqueId,
  JobCompleteHandler,
  JobErrorHandler,
} from './cohort-request-process';
import { ExecResult, executeCommand } from './execute-command';

interface QueueItem {
  uniqueId: string;
  command: string;
  request: CohortRequest;
  resolve: (value: ExecResult) => void;
  reject: (reason: ExecResult | string) => void;
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
    private timeout: number | undefined = undefined,
    private onJobComplete: JobCompleteHandler = defaultJobCompleteHandler,
    private onJobError: JobErrorHandler = defaultJobErrorHandler
  ) {
    this.items = [];
    this.workingOnPromise = false;
    this.itemStatus = {};
  }

  public enqueue(
    request: CohortRequest,
    requestToCommand: (
      request: CohortRequest,
      shellScriptPath: string
    ) => string = defaultRequestToCommand,
    requestToUniqueId: (
      request: CohortRequest,
      delimiter?: string
    ) => string = defaultRequestToUniqueId
  ): Promise<Partial<ExecResult>> {
    const command = requestToCommand(request, this.shellScriptPath);
    const uniqueId = requestToUniqueId(request);
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
        request,
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
    const onError = (err: ExecResult | string) => {
      this.workingOnPromise = false;
      this.itemStatus[item.uniqueId] = CohortRequestStatus.Error;
      item.reject(err);
      if (this.onJobError) {
        this.onJobError(item.request, this.itemStatus[item.uniqueId], err);
      }
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
              if (this.onJobComplete) {
                this.onJobComplete(
                  item.request,
                  this.itemStatus[item.uniqueId],
                  value
                );
              }
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
