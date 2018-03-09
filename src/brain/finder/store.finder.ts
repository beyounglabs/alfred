import { ObjectConverter } from '../../helpers/object.converter';
import { RedisManager } from '../redis.manager';

export class StoreFinder {
  public async findOneByCode(code: string): Promise<any> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getClient();

    return new Promise((resolve, reject) => {
      const key = `Store:${code}`;
      redisClient.get(key, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          resolve();
          return;
        }

        resolve(ObjectConverter.underscoreToCamelCase(JSON.parse(result)));
      });
    });
  }
}
