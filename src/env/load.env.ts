import * as dotenv from 'dotenv';
import { BrainParameter } from '../brain/brain.parameter';

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

  const brainRedisOpts = {
    host: process.env.BRAIN_REDIS_HOST,
    port: parseInt(process.env.BRAIN_REDIS_PORT || '6379', 10),
  };

  const brainParameter = new BrainParameter(
    brainRedisOpts,
    process.env.BRAIN_SERVICE || '',
    process.env.BRAIN_PROFILE || '',
  );

  await brainParameter.updateEnv();

  if (subscribe) {
    brainParameter.subscribe().then();
  } else {
    brainParameter.closeConnection();
  }
}
