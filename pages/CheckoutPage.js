// Page object for /checkout.html
const { expect } = require('@playwright/test');

class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.subtotal = page.getByTestId('subtotal');
    this.discount = page.getByTestId('discount');
    this.shipping = page.getByTestId('shipping');
    this.total = page.getByTestId('total');
    this.promoCode = page.getByTestId('promo-code');
    this.applyButton = page.getByTestId('apply-promo');
    this.promoMessage = page.getByTestId('promo-message');
  }

  async open() {
    await this.page.goto('/checkout.html');
    await expect(this.subtotal).not.toHaveText('…'); // wait until the cart is loaded
  }

  async applyCode(code) {
    await this.promoCode.fill(code);
    await this.applyButton.click();
  }
}

module.exports = { CheckoutPage };
