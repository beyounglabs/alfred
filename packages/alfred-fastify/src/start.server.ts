import Fastify, { FastifyInstance } from 'fastify';
import GracefulServer from '@gquittet/graceful-server';

export function startServer(): FastifyInstance {
  const fastifyServer: FastifyInstance = Fastify({
    bodyLimit: 1024 * 1024 * 20, // === 20MB
    trustProxy: true,
    keepAliveTimeout: 5000, // 5 seconds
    ajv: {
      customOptions: {
        allErrors: true,
      },
    },
  });

  let gracefulServer;

  if (process.env.NODE_ENV !== 'development') {
    gracefulServer = GracefulServer(fastifyServer.server, {
      kubernetes: true,
    });
    gracefulServer.on(GracefulServer.READY, () => {
      console.log('Server is ready');
    });
    gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
      console.log('Server is shutting down');
    });
    gracefulServer.on(GracefulServer.SHUTDOWN, error => {
      console.log('Server is down because of', error.message);
    });
  }

  return fastifyServer;
}
