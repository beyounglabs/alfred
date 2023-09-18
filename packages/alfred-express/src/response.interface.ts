import * as express from 'express';
import type { Apm } from '@beyounglabs/alfred-apm';
import { QueryManager } from '@beyounglabs/alfred-typeorm';

export interface ResponseInterface extends express.Response {
  locals: {
    queryManager: QueryManager;
    apm: Apm;
    auth: any;
    isPreview: boolean;
  };
}
