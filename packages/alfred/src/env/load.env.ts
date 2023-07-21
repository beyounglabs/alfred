import * as dotenv from 'dotenv';
import { BrainParameter } from '../brain/brain.parameter';
import { stat } from 'fs/promises';
import { RedisCustomOptions, RedisMode } from '../brain/redis.manager';

export async function loadEnv(subscribe: boolean) {
  let dotenvPath = '.env';

  if (process.env.NODE_ENV === 'testing') {
    dotenvPath = '.env.testing';
  }

  const { parsed } = dotenv.config({ path: dotenvPath });

  process.env = {
    ...JSON.parse(JSON.stringify(process.env)),
    ...parsed,
  };

  const brainWriteRedisOpts: RedisCustomOptions = {
    host: process.env.BRAIN_REDIS_HOST!,
    port: parseInt(process.env.BRAIN_REDIS_PORT || '6379', 10),
    mode: (process.env.BRAIN_REDIS_MODE as RedisMode) ?? 'standard',
  };

  const brainReadRedisOpts: RedisCustomOptions = {
    host: process.env.BRAIN_REDIS_SLAVE_HOST ?? process.env.BRAIN_REDIS_HOST!,
    port: parseInt(
      process.env.BRAIN_REDIS_SLAVE_PORT ??
        process.env.BRAIN_REDIS_PORT ??
        '6379',
      10,
    ),
    mode: (process.env.BRAIN_REDIS_MODE as RedisMode) ?? 'standard',
  };

  const brainParameter = new BrainParameter(
    brainWriteRedisOpts,
    process.env.BRAIN_SERVICE || '',
    process.env.BRAIN_PROFILE || '',
    brainReadRedisOpts,
  );

  const cacheFile = `/tmp/.env.cache.${process.env.BRAIN_PROFILE}`;

  const cacheExists =
    process.env.NODE_ENV !== 'production' &&
    (await stat(cacheFile)
      .then(() => true)
      .catch(() => false));

  if (cacheExists && subscribe) {
    const { parsed: cacheParsed } = dotenv.config({ path: cacheFile });

    process.env = {
      ...JSON.parse(JSON.stringify(process.env)),
      ...cacheParsed,
      ...parsed,
    };

    brainParameter.updateEnv(true, false).then(() => {
      brainParameter.dumpEnv(cacheFile);
    });
  } else {
    await brainParameter.updateEnv(true);
    await brainParameter.dumpEnv(cacheFile);
  }

  if (subscribe) {
    brainParameter.subscribe().then();
  } else {
    brainParameter.closeConnection();
  }
}
