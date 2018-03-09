export interface QueueRequestInterface {
  name: string;
  service: string;
  url: string;
  method: string;
  delay_seconds?: number;
  data: any;
}
