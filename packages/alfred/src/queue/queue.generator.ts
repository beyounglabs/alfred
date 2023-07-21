import axios from 'axios';
import { trimEnd, chunk } from 'lodash';
import { QueueRequestInterface } from './contracts/queue.request.interface';

export class QueueGenerator {
  public async generate(
    queueRequest: QueueRequestInterface | QueueRequestInterface[],
  ): Promise<void> {
    try {
      let furyUrl = process.env.FURY_URL;

      if (!furyUrl) {
        throw new Error('Fury URL Not Configured');
      }

      if (furyUrl.split('://').length === 1) {
        furyUrl = `http://${furyUrl}`;
      }

      furyUrl = trimEnd(furyUrl, '/');

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

      const chunkTotal = 100;
      const queueRequestChunks = chunk(queueRequest, chunkTotal);
      for (const queueRequestChunk of queueRequestChunks) {
        const response = await axios.post(
          `${furyUrl}/api/v1/queue/generate`,
          queueRequestChunk,
        );
      }
    } catch (e) {
      let message = e.message;

      if (e.response && e.response.data && e.response.data.message) {
        message = e.response.data.message;
      }

      throw new Error('Error on Fury communication: ' + message);
    }
  }
}
