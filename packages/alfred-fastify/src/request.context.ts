// import { QueryManager } from '@beyounglabs/alfred/typeorm/query.manager';
import { Apm } from '@beyounglabs/alfred-apm';

export interface RequestContext {
  apm: Apm;
  // queryManager: QueryManager;
  auth: any;
}
