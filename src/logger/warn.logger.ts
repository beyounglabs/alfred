import { Client, CreateDocumentResponse } from 'elasticsearch';
import { omit } from 'lodash';
import * as uniqidGenerator from 'uniqid';
import { ElasticsearchWarnInterface } from './contracts/elasticsearch.warn.interface';
import { LoggerInterface } from './contracts/logger.interface';
import { transformer } from './transformers/kibana.transformer';
import * as moment from 'moment';

export class WarnLogger implements LoggerInterface {
  protected elasticsearch: ElasticsearchWarnInterface;
  protected logger: Client;

  constructor(elasticsearch: ElasticsearchWarnInterface) {
    this.elasticsearch = elasticsearch;
  }

  public getLogger(): Client {
    if (this.logger) {
      return this.logger;
    }

    const esHost = process.env.ELASTICSEARCH_LOG_HOST;
    const esPort = process.env.ELASTICSEARCH_LOG_PORT;

    if (esHost && esPort) {
      this.logger = new Client({
        host: `${esHost}:${esPort}`,
      });
    }

    return this.logger;
  }

  public async log(data: any): Promise<CreateDocumentResponse> {
    const logger = this.getLogger();
    const { message } = data;
    const meta = omit(data, ['level']);

    return logger.create({
      index: [
        this.elasticsearch.errorIndex,
        String(process.env.BUILD).toLowerCase(),
        moment().format('YYYY-MM-DD'),
      ].join('-'),
      type: 'log',
      id: uniqidGenerator(),
      body: transformer({
        message: message || 'log_default',
        level: 'warn',
        meta,
      }),
    });
  }

  public close() {
    const logger = this.getLogger();
    logger.close();
  }
}
