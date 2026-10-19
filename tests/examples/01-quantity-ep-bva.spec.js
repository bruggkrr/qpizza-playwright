// EXAMPLE 1 – Equivalence partitioning + boundary value analysis
// Requirement: a customer can order 1 to 10 pizzas (whole numbers only).
//
// Partitions:  invalid (< 1)  |  valid (1–10)  |  invalid (> 10)  |  invalid (not a whole number)
// Boundaries (2-value BVA): 0 | 1   and   10 | 11
const { test, expect } = require('@playwright/test');
const { OrderPage } = require('../../pages/OrderPage');

const TOO_FEW = 'Please order at least 1 pizza.';
const TOO_MANY = 'You can order at most 10 pizzas.';
const NOT_A_NUMBER = 'Please enter a whole number.';
const added = (n) => `Great! ${n} pizza(s) added to your order.`;

const cases = [
  { qty: '0',   expected: TOO_FEW,      technique: 'BVA: just below the lower boundary' },
  { qty: '1',   expected: added(1),     technique: 'BVA: lower boundary' },
  { qty: '5',   expected: added(5),     technique: 'EP: valid partition' },
  { qty: '10',  expected: added(10),    technique: 'BVA: upper boundary' },
  { qty: '11',  expected: TOO_MANY,     technique: 'BVA: just above the upper boundary' },
  { qty: '-3',  expected: TOO_FEW,      technique: 'EP: invalid partition (negative)' },
  { qty: '2.5', expected: NOT_A_NUMBER, technique: 'EP: invalid partition (decimal)' },
  { qty: 'abc', expected: NOT_A_NUMBER, technique: 'EP: invalid partition (letters)' }
];

test.describe('Order quantity – equivalence partitions and boundary values', () => {
  let orderPage;

  test.beforeEach(async ({ page }) => {
    orderPage = new OrderPage(page);
    await orderPage.open();
  });

  for (const { qty, expected, technique } of cases) {
    test(`quantity "${qty}" → "${expected}"  (${technique})`, async () => {
      await orderPage.addPizzas(qty);
      await expect(orderPage.message).toHaveText(expected);
    });
  }

  test('empty input is rejected (error guessing)', async () => {
    await orderPage.addButton.click();
    await expect(orderPage.message).toHaveText(NOT_A_NUMBER);
    await expect(orderPage.placeOrderButton).toBeDisabled();
  });
});
