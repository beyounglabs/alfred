import { LoggerDataInterface } from './logger.data.interface';
import { LoggerGenerator } from './logger.generator';

export abstract class Logger {
  public static async emerg(data: LoggerDataInterface): Promise<void> {
    return await LoggerGenerator.log('emerg', data);
  }

  public static async alert(data: LoggerDataInterface): Promise<void> {
    return await LoggerGenerator.log('alert', data);
  }

  public static async crit(data: LoggerDataInterface): Promise<void> {
    return await LoggerGenerator.log('crit', data);
  }

  public static async error(data: LoggerDataInterface): Promise<void> {
    return await LoggerGenerator.log('error', data);
  }

  public static async warning(data: LoggerDataInterface): Promise<void> {
    return await LoggerGenerator.log('warning', data);
  }

  public static async notice(data: LoggerDataInterface): Promise<void> {
    return await LoggerGenerator.log('notice', data);
  }

  public static async info(data: LoggerDataInterface): Promise<void> {
    return await LoggerGenerator.log('info', data);
  }

  public static async debug(data: LoggerDataInterface): Promise<void> {
    return await LoggerGenerator.log('debug', data);
  }
}
