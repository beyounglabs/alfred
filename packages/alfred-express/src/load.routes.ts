import type { NextFunction, Request } from 'express';
import * as express from 'express';
import * as trimRequest from 'trim-request';
import type { Apm } from '@beyounglabs/alfred-apm';
import { Logger } from '@beyounglabs/alfred';
import { QueryManager } from '@beyounglabs/alfred-typeorm';
import { routeAuth } from '@beyounglabs/alfred';
import type { RouteInterface } from '@beyounglabs/alfred';
import type { ResponseInterface } from './response.interface';

export async function loadRoutes(
  app: express.Express,
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

        /**
         * @todo Remove this try/catch after is solved
         * @link https://github.com/oven-sh/bun/issues/4964
         **/
        try {
          request.setTimeout(Number(timeout) * 1000, () => {
            Logger.notice({
              message: `Route ${route.path} got timeout of ${timeout} seconds`,
            });
          });
        } catch (e) {}

        // @todo remove typeorm dependecy
        response.locals.queryManager = new QueryManager();
        response.locals.apm = apm;
        response.locals.isPreview = request.hostname.includes('preview');

        apm.setTransactionName(`${route.method.toLowerCase()} ${route.path}`);

        if (request.headers.authorization) {
          try {
            response.locals.auth = await routeAuth(
              request.headers.authorization,
              route,
            );
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
          // @todo remove typeorm dependecy
          await response.locals.queryManager.release();
        }
      },
    );
  }
}
