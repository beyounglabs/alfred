import { AxiosResponse } from 'axios';

export class RequestError extends Error {
  public response: AxiosResponse;
}
