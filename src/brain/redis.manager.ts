import IORedis, { RedisOptions } from 'ioredis';

let writeClient: IORedis | undefined;
let readClient: IORedis | undefined;
let subscribeClient: IORedis | undefined;
let staticWriteClientOpts: RedisOptions;
let staticReadClientOpts: RedisOptions;
export class RedisManager {
  constructor(writeClientOpts?: RedisOptions, readClientOpts?: RedisOptions) {
    if (writeClientOpts) {
      staticWriteClientOpts = writeClientOpts;
    }

    if (readClientOpts) {
      staticReadClientOpts = readClientOpts;
    } else if (writeClientOpts) {
      staticReadClientOpts = writeClientOpts;
    }
  }

  public async getClient(): Promise<IORedis> {
    return await this.getWriteClient();
  }

  public async getWriteClient(): Promise<IORedis> {
    if (writeClient) {
      return writeClient;
    }

    const redisClient = new IORedis({
      ...staticWriteClientOpts,
      maxRetriesPerRequest: 2,
    });

    return new Promise<IORedis>(resolve => {
      redisClient.on('ready', () => {
        writeClient = redisClient;
        resolve(writeClient);
      });
    });
  }

  public async getReadClient(): Promise<IORedis> {
    if (readClient) {
      return readClient;
    }

    const redisClient = new IORedis({
      ...staticReadClientOpts,
      maxRetriesPerRequest: 2,
    });

    return new Promise<IORedis>(resolve => {
      redisClient.on('ready', () => {
        readClient = redisClient;
        resolve(readClient);
      });
    });
  }

  public async getSubscribeClient(): Promise<IORedis> {
    if (subscribeClient) {
      return subscribeClient;
    }

    const redisClient = new IORedis({
      ...staticWriteClientOpts,
      maxRetriesPerRequest: 2,
    });

    return new Promise<IORedis>(resolve => {
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
