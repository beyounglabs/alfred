import { Response } from 'express';
import { Apm } from '../apm/apm';
import { QueryManager } from '../typeorm/query.manager';

export interface ResponseInterface extends Response {
  locals: {
    queryManager: QueryManager;
    apm: Apm;
    auth: any;
  };
}
