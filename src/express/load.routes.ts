import { Express, NextFunction, Request } from 'express';
import * as trimRequest from 'trim-request';
import { Apm } from '../apm/apm';
import { QueryManager } from '../typeorm/query.manager';
import { ResponseInterface } from './response.interface';
import { RouteInterface } from './route.interface';
import { auth } from './auth';

export async function loadRoutes(
  app: Express,
  routes: RouteInterface[],
  apm: Apm,
) {
  const defaultMiddlewares: any[] = [trimRequest.all];
  for (const route of routes) {
    let middlewares = defaultMiddlewares.slice(0);

    if (route.middlewares) {
      middlewares = middlewares.concat(route.middlewares);
    }

    app[route.method](
      route.path,
      middlewares,
      async (
        request: Request,
        response: ResponseInterface,
        next: NextFunction,
      ) => {
        // 2 minutes
        const defaultTimeout = 2 * 60;
        const timeout =
          route.timeout || process.env.SERVER_TIMEOUT || defaultTimeout;

        request.setTimeout(Number(timeout) * 1000, () => {
          console.info(`Route ${route.path} got timeout of ${timeout} seconds`);
        });

        response.locals.queryManager = new QueryManager();
        response.locals.apm = apm;
        apm.setTransactionName(`${route.method.toLowerCase()} ${route.path}`);

        if (route.protected) {
          try {
            response.locals.auth = await auth(request);
          } catch (e) {
            response.status(403).send({ message: e.message });
            return next();
          }
        }

        try {
          await route.action(request, response);
        } catch (e) {
          next(e);
        } finally {
          await response.locals.queryManager.release();
        }
      },
    );
  }
}
