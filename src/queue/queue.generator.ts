import axios from 'axios';

import { QueueRequestInterface } from './contracts/queue.request.interface';

export class QueueGenerator {
  public async generate(queueRequest: QueueRequestInterface): Promise<any> {
    try {
      const furyUrl = process.env.FURY_URL;

      if (!furyUrl) {
        throw new Error('Fury URL Not Configured');
      }

      queueRequest.name = queueRequest.name.toUpperCase();
      queueRequest.service = queueRequest.service.toUpperCase();

      if (
        queueRequest.name.substr(0, queueRequest.service.length - 1) !==
        queueRequest.service
      ) {
        queueRequest.name = `${queueRequest.service}_${queueRequest.name}`;
      }

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
