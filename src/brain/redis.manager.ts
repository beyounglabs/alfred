import { ClientOpts, createClient, RedisClient } from 'redis';

let client: RedisClient;
let subscribeClient: RedisClient;
let statiClientOpts: ClientOpts;
export class RedisManager {
  constructor(clientOpts?: ClientOpts) {
    if (clientOpts) {
      statiClientOpts = clientOpts;
    }
  }

  public async getClient(): Promise<RedisClient> {
    if (client) {
      return client;
    }

    const redisClient = createClient(statiClientOpts);
    return new Promise<RedisClient>(resolve => {
      redisClient.on('ready', () => {
        client = redisClient;
        resolve(client);
      });
    });
  }

  public async getSubscribeClient(): Promise<RedisClient> {
    if (subscribeClient) {
      return subscribeClient;
    }

    const redisClient = createClient(statiClientOpts);
    return new Promise<RedisClient>(resolve => {
      redisClient.on('ready', () => {
        subscribeClient = redisClient;
        resolve(subscribeClient);
      });
    });
  }

  public closeConnection() {
    if (client) {
      client.end(true);
    }

    if (subscribeClient) {
      subscribeClient.end(true);
    }
  }
}
