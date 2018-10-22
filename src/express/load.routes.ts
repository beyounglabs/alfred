import { Express, NextFunction, Request } from 'express';
import * as trimRequest from 'trim-request';
import { QueryManager } from '../typeorm/query.manager';
import { ResponseInterface } from './response.interface';
import { JwtHelper } from '../helpers/jwt.helpers';

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

        if (route.protected) {
          let authorization: any = request.headers['authorization'];
          if (!authorization) {
            throw new Error('Token Bearer not found');
          }

          authorization = authorization.split('Bearer ');

          if (authorization.length === 1) {
            throw new Error('Token Bearer not found');
          }

          const auth = await JwtHelper.verify(authorization.length[1]);

          if (!auth) {
            throw new Error('Token Bearer invalid');
          }

          response.locals.auth = auth;
        }

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
