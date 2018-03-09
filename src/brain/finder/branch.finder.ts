import { ObjectConverter } from '../../helpers/object.converter';
import { RedisManager } from '../redis.manager';

export class BranchFinder {
  public async findOneByCode(code: string): Promise<any> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getClient();

    return new Promise((resolve, reject) => {
      const key = `Branch:${code}`;
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

  public async findOneByCompanyCodeAndState(
    companyCode: string,
    state: string,
  ): Promise<any> {
    const redisManager = new RedisManager();
    const redisClient = await redisManager.getClient();

    return new Promise((resolve, reject) => {
      const key = `Branch_CompanyState:${companyCode}_${state}`;
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
