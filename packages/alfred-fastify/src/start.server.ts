import Fastify, { FastifyInstance } from 'fastify';
import GracefulServer from '@gquittet/graceful-server';
import { loadSwagger } from './load.swagger';
import { LoadRouteExents, loadRoutes } from './load.routes';
import { RouteInterface } from './route.interface';
import { Apm } from '@beyounglabs/alfred-apm';
import { RequestContext } from './request.context';

export async function startServer<RC = RequestContext>(
  appRoutes: RouteInterface<RC>[],
  apm: Apm,
  events?: LoadRouteExents<RC>,
): Promise<{
  fastifyServer: FastifyInstance;
  gracefulServer: typeof GracefulServer;
}> {
  const fastifyServer: FastifyInstance = Fastify({
    logger: process.env.NODE_ENV === 'development',
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

  await loadSwagger(fastifyServer, process.env.BRAIN_SERVICE!);
  await loadRoutes<RC>(fastifyServer, appRoutes, apm, events);

  try {
    if (events?.preStart) {
      await events.preStart();
    }

    const port = Number(process.env.PORT || 3000);
    console.log(`Starting on port ${port}`);
    await fastifyServer.listen({ port, host: '0.0.0.0' });

    if (process.env.NODE_ENV !== 'development') {
      gracefulServer.setReady();
    }

    console.log(
      ' App is running at http://localhost:%d in %s mode',
      port,
      process.env.NODE_ENV,
    );
    console.log(new Date(), '  Press CTRL-C to stop\n');
  } catch (err) {
    fastifyServer.log.error(err);
    process.exit(1);
  }

  return { fastifyServer, gracefulServer };
}
