export interface LoggerInterface {
  log(data: any): Promise<void>;
  close(): void;
}
