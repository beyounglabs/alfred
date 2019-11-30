import { ApmInterface } from '../contracts/apm.interface';
let newrelicInstance;

export class Newrelic implements ApmInterface {
  async start(apm?: string): Promise<void> {
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

  async startSpan(span: string): Promise<void> {
    if (!newrelicInstance) {
      return;
    }

    newrelicInstance.startSegment(span);
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
}
