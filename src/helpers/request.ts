import Axios, { AxiosPromise } from 'axios';

export function request(
  requestUrl: string,
  params: { [x: string]: any },
  baseUrl?: string,
): AxiosPromise<any> {
  let [method, url] = requestUrl.split(':');

  if (!url) {
    url = method;
    method = 'get';
  }

  method = method.toLowerCase();

  const requestConfig = {
    method: method,
    url: (baseUrl || '') + url,
    params: method === 'get' ? params : {},
    data: ['put', 'delete', 'post'].includes(method) ? params : {},
  };

  return Axios(requestConfig);
}
