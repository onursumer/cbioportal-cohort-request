export interface CohortItem {
  studyId: string;
  caseIds: string[];
}

export enum SubsetType {
  SingleStudy = 'SINGLE_STUDY',
  MergedStudy = 'MERGED_STUDY',
}

export interface CohortRequest {
  name: string;
  id: string;
  type: SubsetType;
  cohorts: CohortItem[];
  users?: string[];
}

export enum CohortRequestStatus {
  Pending = 'Pending',
  Complete = 'Complete',
  Error = 'Error',
}

export interface CohortRequestResponse {
  status: CohortRequestStatus;
  message: string;
}
