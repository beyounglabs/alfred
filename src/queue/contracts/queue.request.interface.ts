export interface QueueRequestInterface {
  name: string;
  service: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  delay_seconds?: number;
  data: {
    [x: string]: any;
  };
}
