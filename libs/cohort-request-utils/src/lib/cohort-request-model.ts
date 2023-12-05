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
  date: Date;
  status: CohortRequestStatus;
  message: string;
}

export interface Job {
  jobId: string;
  requestDate: Date;
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
  eventDate: Date;
  status: CohortRequestStatus;
  requesterId?: string;
  requesterName?: string;
  users?: string[];
  additionalData?: {
    filename: string;
    size: number;
  }[];
}

export interface EnhancedJob extends Job {
  events: Event[];
  status: CohortRequestStatus;
}

export interface QueueItem<T> {
  uniqueId: string;
  date: Date;
  command: string;
  request: CohortRequest;
  resolve: (value: T) => void;
  reject: (reason: T | string) => void;
}
