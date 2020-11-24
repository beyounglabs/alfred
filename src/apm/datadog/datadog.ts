import { ApmInterface } from '../contracts/apm.interface';

let datadogInstance;

export class Datadog implements ApmInterface {
  start(apm?: string): void {
    datadogInstance = require('dd-trace').init({
      debug: false,
      analytics: true,
    });
  }

  async setTransactionName(name: string): Promise<void> {}

  async startSpan(span: string, func: Function): Promise<any> {
    if (!datadogInstance) {
      return;
    }

    datadogInstance.startSpan(span);
    return await func();
  }

  async addCustomAttributes(attributes: any): Promise<void> {
    if (!datadogInstance) {
      return;
    }

    if (!attributes) {
      return;
    }

    const span = datadogInstance.scope().active();
    const keys = Object.keys(attributes);
    for (const key of keys) {
      span.setTag(key, attributes[key]);
    }
  }

  getBrowserTimingHeader(): string {
    return '';
  }
}
