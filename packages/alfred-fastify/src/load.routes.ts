// import { QueryManager, JwtHelper } from '@beyounglabs/alfred';
import { Apm } from '@beyounglabs/alfred-apm';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { RequestContext } from './request.context';
import { RouteInterface } from './route.interface';
import { routeAuth } from '@beyounglabs/alfred';

export async function loadRoutes(
  server: FastifyInstance,
  routes: RouteInterface[],
  apm: Apm,
  events?: {
    preRequest?: (
      req: FastifyRequest<any>,
      res: FastifyReply,
      ctx: RequestContext,
    ) => Promise<void>;
    postRequest?: (
      req: FastifyRequest<any>,
      res: FastifyReply,
      ctx: RequestContext,
    ) => Promise<void>;
  },
) {
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

        const ctx: RequestContext = {
          apm: apm,
          // @todo remove typeorm dependecy
          // queryManager: new QueryManager(),
          auth: undefined,
        };

        if (route.protected) {
          try {
            ctx.auth = routeAuth(req.headers.authorization, route);
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
          // await ctx.queryManager.release();
        }
      },
    });
  }
}
