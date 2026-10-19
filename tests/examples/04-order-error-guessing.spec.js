// EXAMPLE 4 – Experience-based testing (error guessing) + risk: what happens when things go wrong?
//
// Typical "guesses" from experience:
//   - the backend returns an error (500)              → the customer must know the order was NOT placed
//   - the network is slow and the user double-clicks  → only ONE order may be created
//   - the backend is down completely                  → no crash, a clear message, the user can retry
//
// page.route() lets us simulate these situations on demand, without breaking a real server.
const { test, expect } = require('@playwright/test');
const { OrderPage } = require('../../pages/OrderPage');

test.describe('Placing an order – error guessing', () => {
  let orderPage;

  test.beforeEach(async ({ page }) => {
    orderPage = new OrderPage(page);
    await orderPage.open();
    await orderPage.addPizzas(3);
  });

  test('happy path: order is confirmed', async ({ page }) => {
    let sentBody;
    await page.route('**/api/orders', (route) => {
      sentBody = route.request().postDataJSON();
      return route.fulfill({ status: 201, json: { orderId: 'QP-1001' } });
    });
    await orderPage.placeOrder();
    await expect(orderPage.orderResult).toHaveText('Order QP-1001 confirmed!');
    expect(sentBody).toEqual({ quantity: 3 });
  });

  test('server error (500): clear message and the customer can retry', async ({ page }) => {
    await page.route('**/api/orders', (route) => route.fulfill({ status: 500, json: {} }));
    await orderPage.placeOrder();
    await expect(orderPage.orderResult).toContainText('Your order was not placed');
    await expect(orderPage.placeOrderButton).toBeEnabled();
  });

  test('network down: no crash, same clear message', async ({ page }) => {
    await page.route('**/api/orders', (route) => route.abort('failed'));
    await orderPage.placeOrder();
    await expect(orderPage.orderResult).toContainText('Your order was not placed');
  });

  test('slow network + impatient double click: only ONE order is sent', async ({ page }) => {
    let orders = 0;
    await page.route('**/api/orders', async (route) => {
      orders++;
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate a slow backend
      await route.fulfill({ status: 201, json: { orderId: 'QP-1002' } });
    });
    await orderPage.placeOrder();
    await expect(orderPage.placeOrderButton).toBeDisabled();
    await expect(orderPage.placeOrderButton).toHaveText('Placing order…');
    await orderPage.placeOrderButton.click({ force: true }); // the impatient second click
    await expect(orderPage.orderResult).toHaveText('Order QP-1002 confirmed!');
    expect(orders).toBe(1);
  });
});
