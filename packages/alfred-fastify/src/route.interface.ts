import { FastifyReply, FastifyRequest } from 'fastify';
import { RequestContext } from './request.context';
import { SwaggerFastifySchema } from './swagger.fastify.schema';
import { RouteInterface as AlfredRouteInterface } from '@beyounglabs/alfred';

export interface RouteInterface<RC = RequestContext>
  extends AlfredRouteInterface {
  path: string;
  action: (req: FastifyRequest<any>, res: FastifyReply, ctx: RC) => any;
  schema?: () => SwaggerFastifySchema;
}
