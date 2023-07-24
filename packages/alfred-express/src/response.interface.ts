import { Response } from 'express';
import { Apm } from '@beyounglabs/alfred';
import { QueryManager } from '@beyounglabs/alfred';

export interface ResponseInterface extends Response {
  locals: {
    queryManager: QueryManager;
    apm: Apm;
    auth: any;
    isPreview: boolean;
  };
}
