import { ApmInterface } from '../contracts/apm.interface';
let newrelicInstance;

export class Newrelic implements ApmInterface {
  start(apm?: string): void {
    // eslint-disable-next-line global-require
    newrelicInstance = require('newrelic');
  }

  async setTransactionName(name: string): Promise<void> {
    if (!newrelicInstance) {
      return;
    }

    if (!name) {
      return;
    }

    newrelicInstance.setTransactionName(name);
  }

  async startSpan(span: string, func: Function): Promise<any> {
    if (!newrelicInstance) {
      return await func();
    }

    await newrelicInstance.startSegment(span, true, async () => {
      return await func();
    });
  }

  async addCustomAttributes(attributes): Promise<void> {
    if (!newrelicInstance) {
      return;
    }

    if (!attributes) {
      return;
    }

    newrelicInstance.addCustomAttributes(attributes);
  }

  getBrowserTimingHeader(): string {
    return newrelicInstance.getBrowserTimingHeader();
  }
}
