import { Response } from 'express';
import { Apm } from '@beyounglabs/alfred/apm/apm';
import { QueryManager } from '@beyounglabs/alfred/typeorm/query.manager';

export interface ResponseInterface extends Response {
  locals: {
    queryManager: QueryManager;
    apm: Apm;
    auth: any;
    isPreview: boolean;
  };
}
