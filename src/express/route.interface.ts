export interface RouteInterface {
  method: string;
  path: string | RegExp;
  action: any;
  timeout?: number;
  protected?: boolean;
  middlewares?: any[];
}
