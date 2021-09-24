import * as bizSdk from 'facebook-nodejs-business-sdk';
import { ErrorLogger } from '../../logger/error.logger';
import { InfoLogger } from '../../logger/info.logger';

export class Events {
  protected Content = bizSdk.Content;
  protected CustomData = bizSdk.CustomData;
  protected DeliveryCategory = bizSdk.DeliveryCategory;
  protected EventRequest = bizSdk.EventRequest;
  protected UserData = bizSdk.UserData;
  protected ServerEvent = bizSdk.ServerEvent;
  protected accessToken;
  protected pixelId;

  protected infoLogger: InfoLogger;
  protected errorLogger: ErrorLogger;
  protected readyToSend: Boolean = true;

  constructor(infoLogger: InfoLogger, errorLogger: ErrorLogger) {
    this.infoLogger = infoLogger;
    this.errorLogger = errorLogger;

    if (!process.env.FACEBOOK_API_ACCESS_TOKEN) {
      this.readyToSend = false;

      this.errorLogger.log({
        message: 'FACEBOOK_API_ACCESS_TOKEN not configured',
      });
    }

    if (!process.env.FACEBOOK_PIXEL_ID) {
      this.readyToSend = false;

      this.errorLogger.log({
        message: 'FACEBOOK_PIXEL_ID not configured',
      });
    }

    if (this.readyToSend) {
      this.accessToken = process.env.FACEBOOK_API_ACCESS_TOKEN;
      this.pixelId = process.env.FACEBOOK_PIXEL_ID;
      bizSdk.FacebookAdsApi.init(this.accessToken);
    }
  }
}
