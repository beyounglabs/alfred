export interface LoggerDataInterface {
  message: string;
  timestamp?: string;
  uniqId?: string | number;
  content?: any;
  [key: string]: any;
}
