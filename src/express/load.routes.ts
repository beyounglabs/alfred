import { NextFunction, Request, Express } from 'express';
import { QueryManager } from '../typeorm/query.manager';
import { ResponseInterface } from './response.interface';

export async function loadRoutes(app: Express, routes: any[]) {
  for (const route of routes) {
    app[route.method](
      route.path,
      async (
        request: Request,
        response: ResponseInterface,
        next: NextFunction,
      ) => {
        response.locals.queryManager = new QueryManager();
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
