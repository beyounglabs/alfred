import { FastifySchema } from 'fastify';
export interface SwaggerFastifySchema extends FastifySchema {
  tags?: string[];
}
