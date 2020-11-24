import { capitalize } from 'lodash';
import { ApmInterface } from './contracts/apm.interface';

let apmInstance: ApmInterface;

export class Apm implements ApmInterface {
  async start(apm?: string): Promise<void> {
    if (!apm) {
      return;
    }

    if (!['production', 'staging'].includes(String(process.env.NODE_ENV))) {
      return;
    }

    try {
      const apmPath = `./${apm}/${apm}`;
      const apmClassName = (await import(apmPath))[`${capitalize(apm)}`];
      apmInstance = new apmClassName();
      await apmInstance.start();
    } catch (e) {
      console.log(`Failed to load APM ${apm}: ${e.message}`);
    }
  }

  async addCustomAttributes(attributes): Promise<void> {
    if (!apmInstance) {
      return;
    }

    await apmInstance.addCustomAttributes(attributes);
  }

  async setTransactionName(name: string): Promise<void> {
    if (!apmInstance) {
      return;
    }

    await apmInstance.setTransactionName(name);
  }

  async startSpan(span: string, func: Function): Promise<any> {
    if (!apmInstance) {
      return await func();
    }

    return await apmInstance.startSpan(span, func);
  }

  getBrowserTimingHeader(): string {
    if (!apmInstance) {
      return '';
    }

    return apmInstance.getBrowserTimingHeader();
  }
}
