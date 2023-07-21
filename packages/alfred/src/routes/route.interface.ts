type _HTTPMethods =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'OPTIONS'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'MKCOL'
  | 'COPY'
  | 'MOVE'
  | 'LOCK'
  | 'UNLOCK'
  | 'TRACE'
  | 'SEARCH';

export type HTTPMethods = Uppercase<_HTTPMethods> | Lowercase<_HTTPMethods>;
export interface RouteInterface {
  method: HTTPMethods;
  path: string | RegExp;
  action: any;
  timeout?: number;
  protected?: boolean;
  jwtProviders?: string[];
  middlewares?: any[];
}
