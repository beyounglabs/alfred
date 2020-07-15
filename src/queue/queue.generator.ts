import axios from 'axios';
import { trimEnd } from 'lodash';
import { QueueRequestInterface } from './contracts/queue.request.interface';

export class QueueGenerator {
  public async generate(
    queueRequest: QueueRequestInterface | QueueRequestInterface[],
  ): Promise<any> {
    try {
      let furyUrl = process.env.FURY_URL;

      if (!furyUrl) {
        throw new Error('Fury URL Not Configured');
      }

      if (!Array.isArray(queueRequest)) {
        queueRequest = [queueRequest];
      }

      for (const queueRequestItem of queueRequest) {
        queueRequestItem.name = queueRequestItem.name.toUpperCase();
        queueRequestItem.service = queueRequestItem.service.toUpperCase();
        if (
          queueRequestItem.name.substr(0, queueRequestItem.service.length) !==
          queueRequestItem.service
        ) {
          queueRequestItem.name = `${queueRequestItem.service}_${queueRequestItem.name}`;
        }
      }

      if (furyUrl.split('://').length === 1) {
        furyUrl = `http://${furyUrl}`;
      }

      furyUrl = trimEnd(furyUrl, '/');

      const response = await axios.post(
        `${furyUrl}/api/v1/queue/generate`,
        queueRequest,
      );

      return response.data;
    } catch (e) {
      let message = e.message;

      if (e.response && e.response.data && e.response.data.message) {
        message = e.response.data.message;
      }

      throw new Error('Error on Fury communication: ' + message);
    }
  }
}
