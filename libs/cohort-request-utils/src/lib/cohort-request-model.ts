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
}

export interface CohortRequestResponse {
  status: CohortRequestStatus;
  message: string;
}
