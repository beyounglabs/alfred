import { Client, CreateDocumentResponse } from 'elasticsearch';
import * as moment from 'moment';
import uniqidGenerator from 'uniqid';

import { ElasticsearchWarnInterface } from './contracts/elasticsearch.warn.interface';
import {
  LoggerInterface,
  LogDataInterface,
} from './contracts/logger.interface';
import { transformer } from './transformers/kibana.transformer';

let loggers: { [index: string]: Client } = {};

const EXPIRATION_TIME = 3600000;

export class WarnLogger implements LoggerInterface {
  protected elasticsearch: ElasticsearchWarnInterface;
  protected logger: Client;

  constructor(elasticsearch: ElasticsearchWarnInterface) {
    this.elasticsearch = elasticsearch;

    this.expireCache();
  }

  protected expireCache() {
    setTimeout(() => {
      delete loggers[this.elasticsearch.errorIndex];

      this.expireCache();
    }, EXPIRATION_TIME);
  }

  public getLogger(): Client | null {
    if (loggers[this.elasticsearch.errorIndex]) {
      return loggers[this.elasticsearch.errorIndex];
    }

    const esHost = process.env.ELASTICSEARCH_LOG_HOST;
    const esPort = process.env.ELASTICSEARCH_LOG_PORT;

    let logger: Client;

    if (!esHost || !esPort) {
      return null;
    }

    logger = new Client({
      host: `${esHost}:${esPort}`,
    });

    loggers[this.elasticsearch.errorIndex] = logger;

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
      this.elasticsearch.errorIndex,
      String(process.env.BUILD).toLowerCase(),
      moment().format('YYYY-MM-DD'),
    ].join('-');

    let content = data.content;

    if (this.isStatic()) {
      content = JSON.stringify(content, null, 2);
    }

    return logger.create({
      index,
      type: 'log',
      id: uniqidGenerator(),
      body: transformer({
        ...data,
        message: data.message || 'log_default',
        level: 'warn',
        content,
      }),
    });
  }

  public isStatic() {
    return this.elasticsearch.errorIndex.startsWith('static-');
  }

  public async close(): Promise<void> {
    const logger = this.getLogger();

    if (logger === null) {
      return;
    }

    return Promise.resolve(logger.close());
  }
}
