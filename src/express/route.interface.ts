export interface RouteInterface {
  method: string;
  path: string;
  action: any;
  timeout?: number;
  protected?: boolean;
  middlewares?: any[];
}
