import Axios, { AxiosPromise, AxiosRequestConfig } from 'axios';

export function request(
  requestUrl: string,
  params: { [x: string]: any },
  baseUrl?: string,
  config?: AxiosRequestConfig,
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
    data: ['put', 'delete', 'post'].indexOf(method) !== -1 ? params : {},
    ...config,
  };

  return Axios(requestConfig);
}
