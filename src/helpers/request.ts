import { AxiosRequestConfig } from 'axios';
import { AxiosInstance } from '../http/axios.instance';
import { coalesce } from './coalesce';
import { RequestError } from './request.error';

export async function request(
  requestUrl: string,
  params: { [x: string]: any },
  baseUrl?: string,
  config?: AxiosRequestConfig,
): Promise<any> {
  let [method, url] = requestUrl.split(':');

  if (!url) {
    url = method;
    method = 'get';
  }

  method = method.toLowerCase();

  const requestConfig: AxiosRequestConfig = {
    method: method as any,
    url: (baseUrl || '') + url,
    params: method === 'get' ? params : {},
    data: ['put', 'delete', 'post'].indexOf(method) !== -1 ? params : {},
    withCredentials: true,
    ...config,
  };

  return new Promise(async (resolve, reject) => {
    try {
      const response = await AxiosInstance.request(requestConfig);
      const status = coalesce(() => response.data.status, 200);
      const message = coalesce(() => response.data.message, null);

      if (status >= 400 && status < 600) {
        const error = new RequestError(message || 'No error message provided');
        error.response = response;

        throw error;
      }

      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
}
