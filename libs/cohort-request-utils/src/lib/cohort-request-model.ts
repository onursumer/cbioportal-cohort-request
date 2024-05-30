export interface CohortRequest {
  name: string;
  id: string;
  studyIds: string[];
  caseIds: string[];
  users?: string[];
  additionalData?: {
    content: string;
    filename: string;
  }[];
  timestamp?: number;
}

export enum CohortRequestStatus {
  Queued = 'Queued',
  Pending = 'Pending',
  Complete = 'Complete',
  Error = 'Error',
  Duplicate = 'Duplicate',
}

export interface CohortRequestResponse {
  uniqueId: string;
  timestamp: number;
  status: CohortRequestStatus;
  message: string;
}

export interface ExecOutput {
  code: number;
  stdout: string;
  stderr: string;
}

export interface Job {
  jobId: string;
  requestTimestamp: number;
  requesterId: string;
  requesterName: string;
  studyIds: string[];
  caseIds: string[];
  users?: string[];
  additionalData?: {
    filename: string;
    size: number;
  }[];
}

export interface Event {
  jobId: string;
  timestamp: number;
  status: CohortRequestStatus;
  requesterId?: string;
  requesterName?: string;
  users?: string[];
  additionalData?: {
    filename: string;
    size: number;
  }[];
  output?: ExecOutput;
}

export interface EnhancedJob extends Job {
  events: Event[];
  status: CohortRequestStatus;
}

export interface QueueItem<T> {
  uniqueId: string;
  timestamp: number;
  command: string;
  request: CohortRequest;
  resolve: (value: T) => void;
  reject: (reason: T | string) => void;
}
