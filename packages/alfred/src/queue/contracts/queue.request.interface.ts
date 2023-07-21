export interface QueueRequestInterface {
  name: string;
  service: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  delay_seconds?: number;
  not_log_fields?: string[];
  data: {
    [x: string]: any;
  };
}
