import { ApmInterface } from '../contracts/apm.interface';

let datadogInstance;

export class Datadog implements ApmInterface {
  async start(apm?: string): Promise<void> {
    datadogInstance = require('dd-trace').init({
      debug: false,
      analytics: true,
    });
  }

  async setTransactionName(name: string): Promise<void> {}

  async startSpan(span: string): Promise<void> {
    if (!datadogInstance) {
      return;
    }

    datadogInstance.startSpan(span);
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
}
