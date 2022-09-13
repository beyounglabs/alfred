import IORedis, { Cluster, ClusterOptions, RedisOptions } from 'ioredis';

let writeClient: IORedis | Cluster | undefined;
let readClient: IORedis | Cluster | undefined;
let subscribeClient: IORedis | Cluster | undefined;
let staticWriteClientOpts: RedisCustomOptions;
let staticReadClientOpts: RedisCustomOptions;

export type RedisMode = 'standard' | 'cluster';

export type RedisCustomOptions = {
  mode?: RedisMode;
  host: string;
  port: number;
  db?: number;
};

export class RedisManager {
  constructor(
    writeClientOpts?: RedisCustomOptions,
    readClientOpts?: RedisCustomOptions,
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

  public async getClient(): Promise<IORedis | Cluster> {
    return await this.getWriteClient();
  }

  public async getWriteClient(): Promise<IORedis | Cluster> {
    if (writeClient) {
      return writeClient;
    }

    const redisClient: IORedis | Cluster =
      staticWriteClientOpts.mode !== 'cluster'
        ? new IORedis({
            host: staticWriteClientOpts.host,
            port: staticWriteClientOpts.port,
            db: staticWriteClientOpts.db,
            maxRetriesPerRequest: 2,
          })
        : new Cluster([
            {
              host: staticWriteClientOpts.host,
              port: staticWriteClientOpts.port,
            },
          ]);

    return new Promise<IORedis | Cluster>(resolve => {
      redisClient.on('ready', () => {
        writeClient = redisClient;
        resolve(writeClient);
      });
    });
  }

  public async getReadClient(): Promise<IORedis | Cluster> {
    if (readClient) {
      return readClient;
    }

    if (staticReadClientOpts.mode === 'cluster') {
      return await this.getWriteClient();
    }

    const redisClient = new IORedis({
      ...staticReadClientOpts,
      maxRetriesPerRequest: 2,
    });

    return new Promise<IORedis | Cluster>(resolve => {
      redisClient.on('ready', () => {
        readClient = redisClient;
        resolve(readClient);
      });
    });
  }

  public async getSubscribeClient(): Promise<IORedis | Cluster> {
    if (subscribeClient) {
      return subscribeClient;
    }

    const redisClient: IORedis | Cluster =
      staticWriteClientOpts.mode !== 'cluster'
        ? new IORedis({
            host: staticWriteClientOpts.host,
            port: staticWriteClientOpts.port,
            db: staticWriteClientOpts.db,
            maxRetriesPerRequest: 2,
          })
        : new Cluster([
            {
              host: staticWriteClientOpts.host,
              port: staticWriteClientOpts.port,
            },
          ]);

    return new Promise<IORedis | Cluster>(resolve => {
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
