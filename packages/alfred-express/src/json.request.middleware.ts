import type {
  Request,
  Response,
  NextFunction,
} from 'express-serve-static-core';

export function jsonRequestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (
    String(req.headers['content-type']).includes('application/json') === false
  ) {
    next();
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
