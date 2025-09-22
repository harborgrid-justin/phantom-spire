/**
 * Data Explorer Service Type Definitions
 */

import { BusinessLogicRequest, BusinessLogicResponse } from '../core';

export interface Dataset {
  id: number;
  name: string;
  rows: number;
  columns: number;
  type: string;
  uploaded: string;
}

export interface Column {
  name: string;
  type: string;
  missing: number;
  unique: number;
}

export interface SampleData {
    [key: string]: string | number | boolean;
}

export type GetDatasetsRequest = BusinessLogicRequest<null>;
export type GetDatasetsResponse = BusinessLogicResponse<Dataset[]>;

export type GetColumnsRequest = BusinessLogicRequest<{ datasetId: number }>;
export type GetColumnsResponse = BusinessLogicResponse<Column[]>;

export type GetSampleDataRequest = BusinessLogicRequest<{ datasetId: number }>;
export type GetSampleDataResponse = BusinessLogicResponse<SampleData[]>;
