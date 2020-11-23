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

  async startSpan(span: string, func: Function): Promise<void> {
    if (!newrelicInstance) {
      return;
    }

    return await new Promise((resolve, reject) => {
      newrelicInstance.startSegment(span, true, async () => {
        try {
          resolve(await func());
        } catch (e) {
          reject(e);
        }
      });
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
