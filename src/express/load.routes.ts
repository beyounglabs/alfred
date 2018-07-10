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
        response.locals.queryManager = new QueryManager();
        try {
          await route.action(request, response);
          next();
        } catch (e) {
          next(e);
        } finally {
          console.log('release');
          await response.locals.queryManager.release();
        }
      },
    );
  }
}
