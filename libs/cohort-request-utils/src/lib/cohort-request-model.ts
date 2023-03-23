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

export interface CohortRequestResponse {
  message: string;
}
