export interface LoggerInterface {
  log(data: any): Promise<any>;
  close(): void;
}
