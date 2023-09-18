import type { Apm } from '@beyounglabs/alfred-apm';
import { QueryManager } from '@beyounglabs/alfred-typeorm';
import type { Response } from 'express-serve-static-core';

export interface ResponseInterface extends Response {
  locals: {
    queryManager: QueryManager;
    apm: Apm;
    auth: any;
    isPreview: boolean;
  };
}
