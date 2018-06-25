import { NextFunction, Request, Response } from 'express';

export function jsonRequestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (
    String(req.headers['content-type']).includes('application/json') === false
  ) {
    return;
  }

  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    if (data) {
      req.body = data;
      try {
        req.body = JSON.parse(data);
      } catch (e) {}
    }
    next();
  });
}
