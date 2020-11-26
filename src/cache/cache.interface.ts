export interface CacheInterface {
  get(cacheHash: string): Promise<any>;
  delete(cacheHash: string): Promise<any>;
  set(cacheHash: string, data: any, expireInSeconds?: number): Promise<void>;
  clearAll(cachePrefix: string): Promise<void>;
  close(): Promise<void>;
}
