// EXAMPLE 2 – Decision table + boundary values: when should SAVE10 be accepted?
//
// Requirements
//   1. The code must be active and not expired.
//   2. The customer must not have used the code before.
//   3. The merchandise subtotal must be at least €50.
//   4. The 10% discount applies to merchandise only; shipping is excluded.
//
//                                   R1      R2      R3      R4
//   Code active and unexpired?      No      Yes     Yes     Yes
//   Already used by customer?       –       Yes     No      No
//   Merchandise subtotal ≥ €50?     –       –       No      Yes
//   Expected result                 Reject  Reject  Reject  Apply 10% to merchandise
//
// We control every condition with page.route(): the test decides what the "backend" answers,
// so each rule of the table becomes one small, deterministic test.
const { test, expect } = require('@playwright/test');
const { CheckoutPage } = require('../../pages/CheckoutPage');

const SHIPPING = 4.95;
const VALID_PROMO = { code: 'SAVE10', active: true, expiresAt: '2099-12-31T23:59:59Z', usedByCustomer: false };

// Arrange: stub the two backend calls the checkout page makes, then open the page.
// Stubbing the backend is test setup, so it lives here; the page object only drives the UI.
async function givenCheckout(page, { subtotal, promo }) {
  // Condition 3: the merchandise subtotal
  await page.route('**/api/cart/current.json', (route) =>
    route.fulfill({
      json: {
        customer: 'demo-customer-42',
        items: [{ name: 'Pizza bundle', price: subtotal, qty: 1 }],
        shipping: SHIPPING
      }
    })
  );
  // Conditions 1 + 2: what the promo API says about the code
  await page.route(
    (url) => url.pathname === '/api/promo/SAVE10.json',
    (route) => route.fulfill({ json: { ...VALID_PROMO, ...promo } })
  );
  const checkout = new CheckoutPage(page);
  await checkout.open();
  return checkout;
}

test.describe('SAVE10 – decision table', () => {
  test('R1: expired code is rejected, whatever the other conditions', async ({ page }) => {
    const checkout = await givenCheckout(page, { subtotal: 80, promo: { expiresAt: '2020-01-01T00:00:00Z' } });
    await checkout.applyCode('SAVE10');
    await expect(checkout.promoMessage).toHaveText('This code is not valid or has expired.');
    await expect(checkout.discount).toHaveText('€0.00');
  });

  test('R1: inactive code is rejected', async ({ page }) => {
    const checkout = await givenCheckout(page, { subtotal: 80, promo: { active: false } });
    await checkout.applyCode('SAVE10');
    await expect(checkout.promoMessage).toHaveText('This code is not valid or has expired.');
  });

  test('R2: code already used by this customer is rejected', async ({ page }) => {
    const checkout = await givenCheckout(page, { subtotal: 80, promo: { usedByCustomer: true } });
    await checkout.applyCode('SAVE10');
    await expect(checkout.promoMessage).toHaveText('You have already used this code.');
    await expect(checkout.discount).toHaveText('€0.00');
  });

  test('R3 + BVA: valid, unused code at €49.99 is rejected', async ({ page }) => {
    const checkout = await givenCheckout(page, { subtotal: 49.99, promo: {} });
    await checkout.applyCode('SAVE10');
    await expect(checkout.promoMessage).toContainText('at least €50.00');
    await expect(checkout.total).toHaveText('€54.94'); // 49.99 + 4.95, no discount
  });

  test('R4 + BVA: valid, unused code at exactly €50.00 gets 10% off merchandise only', async ({ page }) => {
    const checkout = await givenCheckout(page, { subtotal: 50, promo: {} });
    await checkout.applyCode('SAVE10');
    await expect(checkout.promoMessage).toHaveText('SAVE10 applied: 10% off your merchandise.');
    await expect(checkout.discount).toHaveText('−€5.00');
    await expect(checkout.shipping).toHaveText('€4.95'); // invariant: shipping never discounted
    await expect(checkout.total).toHaveText('€49.95'); // 50.00 − 5.00 + 4.95
  });
});

test.describe('SAVE10 – extra tests from error guessing', () => {
  test('unknown code is rejected', async ({ page }) => {
    await page.route((url) => url.pathname === '/api/promo/FREEPIZZA.json', (route) =>
      route.fulfill({ status: 404, json: {} })
    );
    const checkout = new CheckoutPage(page);
    await checkout.open();
    await checkout.applyCode('FREEPIZZA');
    await expect(checkout.promoMessage).toHaveText('This code is not valid.');
  });

  test('code is case-insensitive: "save10" works too', async ({ page }) => {
    const checkout = await givenCheckout(page, { subtotal: 60, promo: {} });
    await checkout.applyCode('save10');
    await expect(checkout.discount).toHaveText('−€6.00');
  });
});
