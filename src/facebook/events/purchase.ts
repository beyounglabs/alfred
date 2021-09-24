import { Events } from './events';

export class Purchase extends Events {
  public async execute(checkoutRequest: any, cart: any) {
    if (this.readyToSend === false) {
      return true;
    }

    let current_timestamp = Math.floor(Date.now() / 1000);

    const userData = new this.UserData()
      .setEmails([checkoutRequest.customerEmail])
      .setPhones([checkoutRequest.customerPhone])
      .setClientIpAddress(checkoutRequest.ip)
      .setClientUserAgent(checkoutRequest.userAgent)
      .setFbp(checkoutRequest.cookies._fbp)
      .setFbc(checkoutRequest.cookies._fbc);

    let contents = [] as any;

    for (const key in cart?.items) {
      const item = cart?.items[key];

      const itemContent = new this.Content()
        .setId(item?.sku)
        .setQuantity(item?.qty)
        .setDeliveryCategory(this.DeliveryCategory.HOME_DELIVERY);

      contents.push(itemContent);
    }

    const customData = new this.CustomData()
      .setContents(contents)
      .setCurrency('brl')
      .setContentType('product')
      .setValue(cart?.total);

    const serverEvent = new this.ServerEvent()
      .setEventName('Purchase')
      .setEventTime(current_timestamp)
      .setUserData(userData)
      .setCustomData(customData)
      .setActionSource('website')
      .setEventId(cart.orders[0].id);

    const eventsData = [serverEvent];
    const eventRequest = new this.EventRequest(
      this.accessToken,
      this.pixelId,
    ).setEvents(eventsData);

    try {
      const response = await eventRequest.execute();

      this.infoLogger.log({
        uniqId: checkoutRequest.cookies.session_id,
        message: 'facebook_api_purchase_event',
        content: {
          response,
        },
      });

      return response;
    } catch (error) {
      this.errorLogger.log({
        uniqId: checkoutRequest.cookies.session_id,
        message: 'facebook_api_purchase_event_fail',
        error,
      });
    }
  }
}
