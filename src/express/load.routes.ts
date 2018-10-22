import { Express, NextFunction, Request } from 'express';
import * as trimRequest from 'trim-request';
import { QueryManager } from '../typeorm/query.manager';
import { ResponseInterface } from './response.interface';

export async function loadRoutes(app: Express, routes: any[]) {
  for (const route of routes) {
    app[route.method](
      route.path,
      trimRequest.all,
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
        response.locals.route = route;
        try {
          await route.action(request, response);
          next();
        } catch (e) {
          next(e);
        } finally {
          await response.locals.queryManager.release();
        }
      },
    );
  }
}
