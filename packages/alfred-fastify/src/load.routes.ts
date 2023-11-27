// import { QueryManager } from '@beyounglabs/alfred';
import { Apm } from '@beyounglabs/alfred-apm';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { RequestContext } from './request.context';
import { RouteInterface } from './route.interface';
import { routeAuth } from '@beyounglabs/alfred';

export type LoadRouteExents<RC = RequestContext> = {
  preRequest?: (
    req: FastifyRequest<any>,
    res: FastifyReply,
    ctx: RC,
  ) => Promise<void>;
  postRequest?: (
    req: FastifyRequest<any>,
    res: FastifyReply,
    ctx: RC,
  ) => Promise<void>;
};

export async function loadRoutes<RC = RequestContext>(
  server: FastifyInstance,
  routes: RouteInterface<RC>[],
  apm: Apm,
  events?: LoadRouteExents<RC>,
) {
  server.addHook('preHandler', (req, res, done) => {
    for (const route of routes) {
      if (!route.allowedOrigins) {
        continue;
      }

      const origin = req.headers.origin ?? req.headers.host;
      if (!origin) {
        continue;
      }

      if (route.allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', req.method);
        res.header('Access-Control-Allow-Headers', '*');
      }
    }

    const isPreflight = /options/i.test(req.method);
    if (isPreflight) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', req.method);
      res.header('Access-Control-Allow-Headers', '*');
      return res.send();
    }

    done();
  });

  const defaultMiddlewares: any[] = []; // trimRequest.all
  for (const route of routes) {
    let middlewares = defaultMiddlewares.slice(0);

    if (route.middlewares) {
      middlewares = middlewares.concat(route.middlewares);
    }

    server.route({
      method: route.method,
      url: route.path,
      schema: route.schema ? route.schema() : undefined,
      handler: async (req, reply) => {
        // @todo  Verify how to implement timeout by route
        apm.setTransactionName(`${route.method.toLowerCase()} ${route.path}`);

        // @todo Improve type
        const ctx: any = {
          apm: apm,
          auth: undefined,
        };

        if (route.protected) {
          try {
            ctx.auth = await routeAuth(req.headers.authorization, route);
          } catch (e) {
            console.error(e);
            reply.status(403).send({ message: e.message });
            return;
          }
        }

        if (events?.preRequest) {
          await events?.preRequest(req, reply, ctx);
        }

        try {
          await route.action(req, reply, ctx);
        } catch (e) {
          reply.status(500).send({ message: e.message });
        } finally {
          if (events?.postRequest) {
            await events?.postRequest(req, reply, ctx);
          }
        }
      },
    });
  }
}
