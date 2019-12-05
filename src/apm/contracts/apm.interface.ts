export interface ApmInterface {
  start(apm?: string): Promise<void>;
  addCustomAttributes(attributes: any): Promise<void>;
  setTransactionName(name: string): Promise<void>;
  startSpan(span: string, func: Function): Promise<void>;
}
