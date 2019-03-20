import { Client, CreateDocumentResponse } from 'elasticsearch';
import * as moment from 'moment';
import * as uniqidGenerator from 'uniqid';

import { ElasticsearchInfoInterface } from './contracts/elasticsearch.info.interface';
import {
  LoggerInterface,
  LogDataInterface,
} from './contracts/logger.interface';
import { transformer } from './transformers/kibana.transformer';

let loggers: { [index: string]: Client } = {};

const EXPIRATION_TIME = 3600000;

export class InfoLogger implements LoggerInterface {
  protected elasticsearch: ElasticsearchInfoInterface;
  protected logger: Client;

  constructor(elasticsearch: ElasticsearchInfoInterface) {
    this.elasticsearch = elasticsearch;

    this.expireCache();
  }

  protected expireCache() {
    setTimeout(() => {
      delete loggers[this.elasticsearch.infoIndex];

      this.expireCache();
    }, EXPIRATION_TIME);
  }

  public getLogger(): Client | null {
    if (loggers[this.elasticsearch.infoIndex]) {
      return loggers[this.elasticsearch.infoIndex];
    }

    const esHost = process.env.ELASTICSEARCH_LOG_HOST;
    const esPort = process.env.ELASTICSEARCH_LOG_PORT;

    if (!esHost || !esPort) {
      return null;
    }

    const logger = new Client({ host: `${esHost}:${esPort}` });

    loggers[this.elasticsearch.infoIndex] = logger;

    return logger;
  }

  public async log(
    data: LogDataInterface,
  ): Promise<CreateDocumentResponse | void> {
    const logger = this.getLogger();

    if (logger === null) {
      return;
    }

    const index = [
      this.elasticsearch.infoIndex,
      String(process.env.BUILD).toLowerCase(),
      moment().format('YYYY-MM-DD'),
    ].join('-');

    let content = data.content;

    if (this.isStatic()) {
      content = JSON.stringify(content, null, 2);
    }

    return logger.create({
      index,
      type: 'info',
      id: uniqidGenerator(),
      body: transformer({
        ...data,
        message: data.message || 'log_default',
        level: 'info',
        content,
      }),
    });
  }

  public isStatic() {
    return this.elasticsearch.infoIndex.startsWith('static-');
  }

  public async close(): Promise<void> {
    const logger = this.getLogger();

    if (logger === null) {
      return;
    }

    return Promise.resolve(logger.close());
  }
}
