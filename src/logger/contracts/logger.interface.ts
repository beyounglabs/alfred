export interface LogDataInterface {
  timestamp?: string;
  uniqId: string | number;
  message: string;
  content: any;
  [key: string]: any;
}

export interface LoggerInterface {
  log(data: LogDataInterface): Promise<any>;
  close(): Promise<void>;
}
