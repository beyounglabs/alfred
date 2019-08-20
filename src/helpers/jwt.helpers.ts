import * as jwt from 'jsonwebtoken';

const DEFAULT_JWT_KEY = '123456';

export class JwtHelper {
  protected static getJwtKey() {
    return process.env.JWT_KEY || DEFAULT_JWT_KEY;
  }

  public static async sign(value: any): Promise<string> {
    return await jwt.sign(value, JwtHelper.getJwtKey());
  }

  public static async verify(value: any): Promise<object | string> {
    return await jwt.verify(value, JwtHelper.getJwtKey());
  }

  public static async isExpired(token: string): boolean {
    if (!token) {
      return true;
    }

    const tokens = token.split(' ')[1].split('.');
    const tokenData = JSON.parse(
      Buffer.from(tokens[1], 'base64').toString('ascii'),
    );

    const todayTimestamp = Math.floor(Date.now() / 1000);
    if (tokenData.exp > todayTimestamp) {
      return false;
    }

    return true;
  }
}
