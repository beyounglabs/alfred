import { Apm } from '@beyounglabs/alfred/apm/apm';

export interface RequestContext {
  apm: Apm;
  auth: any;
}
