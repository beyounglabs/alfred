import { NextFunction, Request, Response } from 'express';

export function jsonRequestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    if (data) {
      req.body = data;
      try {
        if (String(req.headers['content-type']).includes('application/json')) {
          req.body = JSON.parse(data);
        }
      } catch (e) {}
    }
    next();
  });
}
