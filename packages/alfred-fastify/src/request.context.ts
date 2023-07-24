// import { QueryManager } from '@beyounglabs/alfred/typeorm/query.manager';
import { Apm } from '@beyounglabs/alfred';

export interface RequestContext {
  apm: Apm;
  // queryManager: QueryManager;
  auth: any;
}
