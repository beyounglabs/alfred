import { JwtHelper } from '@beyounglabs/alfred/helpers/jwt.helper';
import { Apm } from '@beyounglabs/alfred/apm/apm';
import { FastifyInstance } from 'fastify';
import { RequestContext } from './request.context';
import { RouteInterface } from './route.interface';

export async function loadRoutes(
  server: FastifyInstance,
  routes: RouteInterface[],
  apm: Apm,
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
          auth: undefined,
        };

        if (route.protected) {
          try {
            const authHeader = req.headers.authorization;

            if (!authHeader?.startsWith('Bearer ')) {
              throw new Error('invalid token');
            }

            const token = authHeader.substring(7, authHeader.length);

            ctx.auth = (await JwtHelper.verify(token)) as any;
            ctx.auth.token = token;
          } catch (e) {
            console.error(e);
            reply.status(403).send({ message: e.message });
          }
        }

        try {
          await route.action(req, reply, ctx);
        } catch (e) {
          //   next(e);
        }
      },
    });
  }
}
