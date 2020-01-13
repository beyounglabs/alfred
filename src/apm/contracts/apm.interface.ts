export interface ApmInterface {
  start(apm?: string): void;
  addCustomAttributes(attributes: any): Promise<void>;
  setTransactionName(name: string): Promise<void>;
  startSpan(span: string, func: Function): Promise<void>;
}
