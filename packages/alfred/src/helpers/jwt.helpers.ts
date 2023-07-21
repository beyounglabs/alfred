import * as jwt from 'jsonwebtoken';

const DEFAULT_JWT_KEY = '123456';

export class JwtHelper {
  protected static getJwtKey(param?: string) {
    if (param) {
      return process.env[param] || DEFAULT_JWT_KEY;
    }

    return process.env.JWT_KEY || DEFAULT_JWT_KEY;
  }

  public static async sign(
    value: any,
    options?: {
      expiresIn?: string;
      jwtKeyParam?: string;
    },
  ): Promise<string> {
    return await jwt.sign(value, JwtHelper.getJwtKey(options?.jwtKeyParam), {
      ...(options?.expiresIn ? { expiresIn: options?.expiresIn } : {}),
    });
  }

  public static async verify(
    value: any,
    options?: {
      jwtKeyParam?: string;
    },
  ): Promise<object | string> {
    return await jwt.verify(value, JwtHelper.getJwtKey(options?.jwtKeyParam));
  }

  public static isExpired(token: string): boolean {
    if (!token) {
      return true;
    }

    const tokenSplit = token.split(' ');

    let tokens: string[] = [];
    if (tokenSplit.length > 1) {
      tokens = tokenSplit[1].split('.');
    } else {
      tokens = tokenSplit[0].split('.');
    }

    const tokenData = JSON.parse(
      Buffer.from(tokens[1], 'base64').toString('utf8'),
    );

    if (!tokenData.exp) {
      return false;
    }

    // 1 minute to expire, already expired
    const todayTimestamp = Math.floor(Date.now() / 1000) + 60;
    if (tokenData.exp > todayTimestamp) {
      return false;
    }

    return true;
  }
}
