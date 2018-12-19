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
}
