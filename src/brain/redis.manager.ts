import { ClientOpts, createClient, RedisClient } from 'redis';

let writeClient: RedisClient | undefined;
let readClient: RedisClient | undefined;
let subscribeClient: RedisClient | undefined;
let staticWriteClientOpts: ClientOpts;
let staticReadClientOpts: ClientOpts;
export class RedisManager {
  constructor(writeClientOpts?: ClientOpts, readClientOpts?: ClientOpts) {
    if (writeClientOpts) {
      staticWriteClientOpts = writeClientOpts;
    }

    if (readClientOpts) {
      staticReadClientOpts = readClientOpts;
    } else if (writeClientOpts) {
      staticReadClientOpts = writeClientOpts;
    }
  }

  public async getClient(): Promise<RedisClient> {
    return await this.getWriteClient();
  }

  public async getWriteClient(): Promise<RedisClient> {
    if (writeClient) {
      return writeClient;
    }

    const redisClient = createClient(staticWriteClientOpts);
    return new Promise<RedisClient>(resolve => {
      redisClient.on('ready', () => {
        writeClient = redisClient;
        resolve(writeClient);
      });
    });
  }

  public async getReadClient(): Promise<RedisClient> {
    if (readClient) {
      return readClient;
    }

    const redisClient = createClient(staticReadClientOpts);
    return new Promise<RedisClient>(resolve => {
      redisClient.on('ready', () => {
        readClient = redisClient;
        resolve(readClient);
      });
    });
  }

  public async getSubscribeClient(): Promise<RedisClient> {
    if (subscribeClient) {
      return subscribeClient;
    }

    const redisClient = createClient(staticWriteClientOpts);
    return new Promise<RedisClient>(resolve => {
      redisClient.on('ready', () => {
        subscribeClient = redisClient;
        resolve(subscribeClient);
      });
    });
  }

  public closeConnection() {
    if (writeClient) {
      writeClient.end(true);
      writeClient = undefined;
    }

    if (readClient) {
      readClient.end(true);
      readClient = undefined;
    }

    if (subscribeClient) {
      subscribeClient.end(true);
      subscribeClient = undefined;
    }
  }
}
