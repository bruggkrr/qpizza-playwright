// Page object for /delivery.html (workshop)
class DeliveryPage {
  constructor(page) {
    this.page = page;
    this.postcode = page.getByTestId('postcode');
    this.orderTotal = page.getByTestId('order-total');
    this.checkButton = page.getByTestId('check');
    this.result = page.getByTestId('delivery-result');
  }

  async open() {
    await this.page.goto('/delivery.html');
  }

  async checkDelivery(postcode, total) {
    await this.postcode.fill(postcode);
    await this.orderTotal.fill(total);
    await this.checkButton.click();
  }
}

module.exports = { DeliveryPage };
