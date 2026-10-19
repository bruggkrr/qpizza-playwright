// Page object for /order.html
// It knows HOW to work with the page (selectors, clicks, typing).
// The tests only say WHAT should happen and WHAT we expect.
class OrderPage {
  constructor(page) {
    this.page = page;
    this.qty = page.getByTestId('qty');
    this.addButton = page.getByTestId('add');
    this.message = page.getByTestId('message');
    this.placeOrderButton = page.getByTestId('place-order');
    this.orderResult = page.getByTestId('order-result');
  }

  async open() {
    await this.page.goto('/order.html');
  }

  async addPizzas(qty) {
    await this.qty.fill(String(qty));
    await this.addButton.click();
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }
}

module.exports = { OrderPage };
