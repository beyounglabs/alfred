import * as IORedis from 'ioredis';

let writeClient: IORedis.Redis | undefined;
let readClient: IORedis.Redis | undefined;
let subscribeClient: IORedis.Redis | undefined;
let staticWriteClientOpts: IORedis.RedisOptions;
let staticReadClientOpts: IORedis.RedisOptions;
export class RedisManager {
  constructor(
    writeClientOpts?: IORedis.RedisOptions,
    readClientOpts?: IORedis.RedisOptions,
  ) {
    if (writeClientOpts) {
      staticWriteClientOpts = writeClientOpts;
    }

    if (readClientOpts) {
      staticReadClientOpts = readClientOpts;
    } else if (writeClientOpts) {
      staticReadClientOpts = writeClientOpts;
    }
  }

  public async getClient(): Promise<IORedis.Redis> {
    return await this.getWriteClient();
  }

  public async getWriteClient(): Promise<IORedis.Redis> {
    if (writeClient) {
      return writeClient;
    }

    const redisClient = new IORedis({
      ...staticWriteClientOpts,
      maxRetriesPerRequest: 2,
    });

    return new Promise<IORedis.Redis>(resolve => {
      redisClient.on('ready', () => {
        writeClient = redisClient;
        resolve(writeClient);
      });
    });
  }

  public async getReadClient(): Promise<IORedis.Redis> {
    if (readClient) {
      return readClient;
    }

    const redisClient = new IORedis({
      ...staticReadClientOpts,
      maxRetriesPerRequest: 2,
    });

    return new Promise<IORedis.Redis>(resolve => {
      redisClient.on('ready', () => {
        readClient = redisClient;
        resolve(readClient);
      });
    });
  }

  public async getSubscribeClient(): Promise<IORedis.Redis> {
    if (subscribeClient) {
      return subscribeClient;
    }

    const redisClient = new IORedis({
      ...staticWriteClientOpts,
      maxRetriesPerRequest: 2,
    });

    return new Promise<IORedis.Redis>(resolve => {
      redisClient.on('ready', () => {
        subscribeClient = redisClient;
        resolve(subscribeClient);
      });
    });
  }

  public closeConnection() {
    if (writeClient) {
      writeClient.disconnect();
      writeClient = undefined;
    }

    if (readClient) {
      readClient.disconnect();
      readClient = undefined;
    }

    if (subscribeClient) {
      subscribeClient.disconnect();
      subscribeClient = undefined;
    }
  }
}
