import { LoggerGenerator } from './logger.generator';

export abstract class Logger {
  public static async emerg(message: string, metadata: any): Promise<void> {
    return await LoggerGenerator.log('emerg', message, metadata);
  }

  public static async alert(message: string, metadata: any): Promise<void> {
    return await LoggerGenerator.log('alert', message, metadata);
  }

  public static async crit(message: string, metadata: any): Promise<void> {
    return await LoggerGenerator.log('crit', message, metadata);
  }

  public static async error(message: string, metadata: any): Promise<void> {
    return await LoggerGenerator.log('error', message, metadata);
  }

  public static async warning(message: string, metadata: any): Promise<void> {
    return await LoggerGenerator.log('warning', message, metadata);
  }

  public static async notice(message: string, metadata: any): Promise<void> {
    return await LoggerGenerator.log('notice', message, metadata);
  }

  public static async info(message: string, metadata: any): Promise<void> {
    return await LoggerGenerator.log('info', message, metadata);
  }

  public static async debug(message: string, metadata: any): Promise<void> {
    return await LoggerGenerator.log('debug', message, metadata);
  }
}
