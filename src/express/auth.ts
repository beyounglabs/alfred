import { Request } from 'express';
import { JwtHelper } from '../helpers/jwt.helpers';
import axios from 'axios';

let basicAuthCache = {};

export async function auth(request: Request): Promise<any> {
  if (!request.headers['authorization']) {
    throw new Error('Token Bearer not found');
  }

  const authorization: string = request.headers['authorization'] as string;
  if (authorization.startsWith('Bearer')) {
    const authorizationSplit = authorization.split('Bearer ');

    if (authorizationSplit.length === 1) {
      throw new Error('Token Bearer not found');
    }
    const authObject = await JwtHelper.verify(authorizationSplit[1]);

    if (!authObject) {
      throw new Error('Token Bearer invalid');
    }

    return authObject;
  } else if (authorization.startsWith('Basic')) {
    const authorizationSplit = authorization.split('Basic ');
    if (authorizationSplit.length === 1) {
      throw new Error('Token Basic not found');
    }

    const token = authorizationSplit[1].trim();
    if (basicAuthCache[token]) {
      return basicAuthCache[token];
    }

    const [username, password] = Buffer.from(token, 'base64')
      .toString()
      .split(':');

    if (!process.env.GANDALF_URL) {
      throw new Error('GANDALF_URL not configured - Basic Auth');
    }

    if (!username) {
      throw new Error('Username is mandatory - Basic Auth');
    }

    if (!password) {
      throw new Error('Password is mandatory - Basic Auth');
    }

    let email = username;
    if (!email.includes('@')) {
      email += '@bbrands.com.br';
    }

    const response = (
      await axios.post(`${process.env.GANDALF_URL}/auth/login`, {
        aggregator: 'SYSTEM',
        service: process.env.BRAIN_SERVICE,
        email: email,
        password,
      })
    ).data;

    if (!response.token) {
      throw new Error('Invalid credentials - Basic Auth');
    }

    basicAuthCache[token] = {
      id: response.user.id,
      username: username,
      email: response.user.email,
    };

    return basicAuthCache[token];
  } else {
    throw new Error('Invalid authorization');
  }
}
