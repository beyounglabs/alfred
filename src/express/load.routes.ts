import type { Express, NextFunction, Request } from 'express';
import * as trimRequest from 'trim-request';
import type { Apm } from '../apm/apm';
import { Logger } from '../logger-v2/logger';
import { QueryManager } from '../typeorm/query.manager';
import { auth } from './auth';
import type { ResponseInterface } from './response.interface';
import type { RouteInterface } from './route.interface';

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
          Logger.notice({
            message: `Route ${route.path} got timeout of ${timeout} seconds`,
          });
        });

        response.locals.queryManager = new QueryManager();
        response.locals.apm = apm;
        response.locals.isPreview = request.hostname.includes('preview');

        apm.setTransactionName(`${route.method.toLowerCase()} ${route.path}`);

        if (request.headers.authorization) {
          try {
            response.locals.auth = await auth(request, route);
          } catch (e) {}
        }

        if (route.protected && !response.locals.auth) {
          response.status(403).send({ status: 403, message: 'Forbidden' });
          return;
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
