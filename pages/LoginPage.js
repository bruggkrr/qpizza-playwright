// Page object for /login.html (staff PIN login)
class LoginPage {
  constructor(page) {
    this.page = page;
    this.pin = page.getByTestId('pin');
    this.loginButton = page.getByTestId('submit-pin');
    this.resetButton = page.getByTestId('reset-pin');
    this.status = page.getByTestId('status');
    this.dashboard = page.getByTestId('dashboard');
  }

  async open() {
    await this.page.goto('/login.html');
  }

  async enterPin(pin) {
    await this.pin.fill(pin);
    await this.loginButton.click();
  }

  async enterPins(pins) {
    for (const pin of pins) await this.enterPin(pin);
  }

  async reset() {
    await this.resetButton.click();
  }

  async reload() {
    await this.page.reload();
  }
}

module.exports = { LoginPage };
