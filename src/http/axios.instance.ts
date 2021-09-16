import axios from 'axios';
import * as http from 'http';
import * as https from 'https';

// See
// https://medium.com/@ccnokes/one-con-i-discovered-about-axios-recently-is-that-it-doesnt-have-the-best-default-configuration-e6e3a8cba6fa
// https://gist.github.com/ccnokes/94576dc38225936a3ca892b989c9d0c6

export const AxiosInstance = axios.create({
  //60 sec timeout
  timeout: 60000,

  //keepAlive pools and reuses TCP connections, so it's faster
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),

  //follow up to 10 HTTP 3xx redirects
  maxRedirects: 10,

  //cap the maximum content length we'll accept to 50MBs, just in case
  maxContentLength: 50 * 1000 * 1000,
});
