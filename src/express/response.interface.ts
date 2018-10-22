import { Response } from 'express';
import { QueryManager } from '../typeorm/query.manager';

export interface ResponseInterface extends Response {
  locals: {
    queryManager: QueryManager;
    auth: any;
  };
}
