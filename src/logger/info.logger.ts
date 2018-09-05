import { Client, CreateDocumentResponse } from 'elasticsearch';
import { omit } from 'lodash';
import * as uniqidGenerator from 'uniqid';
import { ElasticsearchInfoInterface } from './contracts/elasticsearch.info.interface';
import { LoggerInterface } from './contracts/logger.interface';
import { transformer } from './transformers/kibana.transformer';

let logger: Client;

export class InfoLogger implements LoggerInterface {
  protected elasticsearch: ElasticsearchInfoInterface;

  constructor(elasticsearch: ElasticsearchInfoInterface) {
    this.elasticsearch = elasticsearch;
  }

  public getLogger(): Client {
    if (logger) {
      return logger;
    }

    const esHost = process.env.ELASTICSEARCH_LOG_HOST;
    const esPort = process.env.ELASTICSEARCH_LOG_PORT;

    if (esHost && esPort) {
      logger = new Client({
        host: `${esHost}:${esPort}`,
      });
    }

    return logger;
  }

  public async log(data: any): Promise<CreateDocumentResponse> {
    const logger = this.getLogger();
    const { message } = data;
    const meta = omit(data, ['level']);

    return logger.create({
      index: this.elasticsearch.infoIndex,
      type: 'info',
      id: uniqidGenerator(),
      body: transformer({
        message: message || 'log_default',
        level: 'info',
        meta,
      }),
    });
  }

  public close() {
    const logger = this.getLogger();

    logger.close();
  }
}
