import {
  CohortRequest,
  CohortRequestStatus,
  ExecOutput,
  QueueItem,
} from '@cbioportal-cohort-request/cohort-request-utils';
import {
  defaultRequestToCommand,
  defaultRequestToUniqueId,
} from './cohort-request-process';
import {
  CohortRequestTracker,
  defaultJobCompleteHandler,
  defaultJobErrorHandler,
  JobCompleteHandler,
  JobErrorHandler,
} from './cohort-request-tracker';
import {
  ExecResult,
  executeCommand,
  getFinalExecResult,
} from './execute-command';
import { isString } from 'lodash';

enum DequeueResult {
  Pending = 'Pending',
  Empty = 'Empty',
  Success = 'Success',
}

export class CohortRequestQueue {
  items: QueueItem<ExecResult>[];
  workingOnPromise: boolean;

  constructor(
    private shellScriptPath: string,
    private userDataPath: string,
    private requestTracker: CohortRequestTracker = new CohortRequestTracker(),
    private timeout: number | undefined = undefined,
    private onJobComplete: JobCompleteHandler = defaultJobCompleteHandler,
    private onJobError: JobErrorHandler = defaultJobErrorHandler
  ) {
    this.items = [];
    this.workingOnPromise = false;
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
  ): Promise<ExecResult> {
    const command = requestToCommand(request, this.shellScriptPath);
    const uniqueId = requestToUniqueId(request);
    const status = this.getItemStatus(uniqueId);
    const timestamp = request.timestamp || Date.now();

    const item: QueueItem<ExecResult> = {
      timestamp,
      uniqueId,
      command,
      request,
      resolve: () => undefined,
      reject: () => undefined,
    };

    // do not enqueue duplicate queries, just return status if it is already Queued, Pending, or Complete
    if (
      status === CohortRequestStatus.Queued ||
      status === CohortRequestStatus.Pending ||
      status === CohortRequestStatus.Complete
    ) {
      this.requestTracker.updateJobStatus(item, CohortRequestStatus.Duplicate);
      // add an output to indicate this is a duplicate request
      const output = {
        code: 0,
        stderr: '',
        stdout:
          'Duplicate Request. This cohort and case id combination has been requested before.',
      };
      return Promise.resolve({
        uniqueId,
        timestamp,
        status,
        output,
        execPromise: Promise.resolve(output),
      });
    }

    return new Promise<ExecResult>((resolve, reject) => {
      item.resolve = resolve;
      item.reject = reject;
      this.items.push(item);
      if (this.dequeue() === DequeueResult.Pending) {
        this.setItemStatus(item, CohortRequestStatus.Queued);
        // add an output to indicate the request has been queued
        const output = {
          code: 0,
          stderr: '',
          stdout: 'Request has been queued.',
        };
        resolve({
          timestamp,
          uniqueId,
          status: CohortRequestStatus.Queued,
          output,
          execPromise: Promise.resolve(output),
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
      this.setItemStatus(
        item,
        CohortRequestStatus.Error,
        isString(err) ? undefined : (err as ExecResult)
      );
      item.reject(err);
      if (this.onJobError) {
        this.onJobError(item, this.getItemStatus(item.uniqueId), err);
      }
      this.dequeue();
    };

    try {
      this.workingOnPromise = true;
      this.setItemStatus(item, CohortRequestStatus.Pending);
      executeCommand(
        item.command,
        this.shellScriptPath,
        item.uniqueId,
        item.timestamp,
        this.timeout
      )
        .then((value) => {
          value.execPromise
            .then((output: ExecOutput) => {
              this.workingOnPromise = false;
              const result = getFinalExecResult(
                value.uniqueId,
                value.execPromise,
                output
              );
              // we should only get here if output.code === 0, so assume status complete
              this.setItemStatus(item, CohortRequestStatus.Complete, result);
              if (this.onJobComplete) {
                this.onJobComplete(
                  item,
                  this.getItemStatus(item.uniqueId),
                  value,
                  this.userDataPath
                );
              }
              this.dequeue();
            })
            .catch((output: ExecOutput) => {
              onError(
                getFinalExecResult(value.uniqueId, value.execPromise, output)
              );
            });
          item.resolve(value);
        })
        .catch(onError);
    } catch (err) {
      onError(err);
    }

    return DequeueResult.Success;
  }

  public getItemStatus(uniqueId: string): CohortRequestStatus {
    return (
      this.requestTracker.getRequestStatus(uniqueId) ||
      CohortRequestStatus.Error
    );
  }

  public setItemStatus(
    item: QueueItem<ExecResult>,
    status: CohortRequestStatus,
    result?: ExecResult
  ): void {
    this.requestTracker.setRequestStatus(item.uniqueId, status);
    this.requestTracker.updateJobStatus(item, status, result);
  }
}
