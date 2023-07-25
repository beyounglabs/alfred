import * as bizSdk from 'facebook-nodejs-business-sdk';
import { Logger } from '../../logger/logger';


/**
 * @todo Remove this class from alfred main package
 */
export class Events {
  protected Content = bizSdk.Content;
  protected CustomData = bizSdk.CustomData;
  protected DeliveryCategory = bizSdk.DeliveryCategory;
  protected EventRequest = bizSdk.EventRequest;
  protected UserData = bizSdk.UserData;
  protected ServerEvent = bizSdk.ServerEvent;
  protected accessToken;
  protected pixelId;


  protected readyToSend: Boolean = true;

  constructor() {


    if (!process.env.FACEBOOK_API_ACCESS_TOKEN) {
      this.readyToSend = false;

      Logger.error({
        message: 'FACEBOOK_API_ACCESS_TOKEN not configured',
      });
    }

    if (!process.env.FACEBOOK_PIXEL_ID) {
      this.readyToSend = false;

      Logger.error({
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
