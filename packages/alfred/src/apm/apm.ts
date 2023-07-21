import { capitalize } from 'lodash';
import { Logger } from '../logger-v2/logger';
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

    if (process.env.DISABLE_APM === '1') {
      return;
    }

    try {
      const apmPath = `./${apm}/${apm}`;
      const apmClassName = (await import(apmPath))[`${capitalize(apm)}`];
      apmInstance = new apmClassName();
      await apmInstance.start();
    } catch (e) {
      Logger.error({ message: `Failed to load APM ${apm}: ${e.message}` });
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

  async startSpan<T = any>(span: string, func: Function): Promise<T> {
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

  recordMetric(name: string, value: any): void {
    if (!apmInstance) {
      return;
    }

    return apmInstance.recordMetric(name, value);
  }
}
