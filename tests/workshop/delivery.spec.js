// WORKSHOP – Can QPizza deliver to you?
//
// Requirements (from the product owner):
//   R1  A postcode is valid when it has exactly 4 digits.
//       Otherwise: "Please enter a valid Belgian postcode."
//   R2  QPizza delivers to postcodes 2000 up to and including 2660.
//       Otherwise: "Sorry, we don't deliver to <postcode> yet."
//   R3  Orders under €25.00 pay a delivery fee of €3.50:
//       "We deliver to <postcode>! Delivery fee: €3.50"
//   R4  Orders of €25.00 or more get free delivery:
//       "We deliver to <postcode>! Free delivery"
//
// STEP 1 (5 min, on paper): list the partitions and the boundary values for postcode AND order total.
// STEP 2 (12 min): turn your values into Playwright tests below. Start from the example test.
//                  Use the page object: delivery.checkDelivery(postcode, total) and delivery.result.
// STEP 3: run them. Does every test pass? If not: is it your test, or did you find a bug?
const { test, expect } = require('@playwright/test');
const { DeliveryPage } = require('../../pages/DeliveryPage');

test.describe('Delivery check', () => {
  let delivery;

  test.beforeEach(async ({ page }) => {
    delivery = new DeliveryPage(page);
    await delivery.open();
  });

  test('example: postcode in range, small order pays the delivery fee', async () => {
    await delivery.checkDelivery('2100', '12.00');
    await expect(delivery.result).toHaveText('We deliver to 2100! Delivery fee: €3.50');
  });

  // TODO: boundary values for the postcode range (R2) – which 4 values?

  // TODO: boundary values for free delivery (R3/R4) – which 2 values?

  // TODO: invalid postcodes (R1) – which partitions? (too short, too long, letters, empty …)

  // BONUS: turn your values into a data-driven test with an array + for…of loop (see example 1).
});
