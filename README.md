# QPizza – Playwright demo & workshop

Demo project for the guest lecture *Why software breaks – from ISTQB to Playwright*.
QPizza is a **fictional** pizza shop, built only to practise test design. No real data, no real payments.

## Setup (do this before the lecture – ±10 minutes)

1. Install **Node.js 20 or newer** (https://nodejs.org – choose the LTS version).
2. Unzip this folder, open a terminal in it and run:

   ```bash
   npm install
   npx playwright install chromium
   ```

   The second command downloads the browser Playwright uses (±150 MB). Do it at home or on a fast network.
3. Check that it works:

   ```bash
   npm test
   ```

   Playwright starts the QPizza app on http://localhost:4280 by itself and runs the examples. All tests should pass.

## What is in here

| Folder / file | What |
|---|---|
| `app/` | The QPizza web app (plain HTML + JavaScript) |
| `tests/examples/01-quantity-ep-bva.spec.js` | Example 1 – equivalence partitioning + boundary value analysis |
| `tests/examples/02-promo-decision-table.spec.js` | Example 2 – decision table (promo code SAVE10) with `page.route()` |
| `tests/examples/03-pin-state-transition.spec.js` | Example 3 – state transition testing (PIN login) |
| `tests/examples/04-order-error-guessing.spec.js` | Example 4 – error guessing (server error, network down, double click) |
| `tests/workshop/delivery.spec.js` | **Workshop starter** – your work goes here |
| `pages/` | **Page objects**: `OrderPage`, `CheckoutPage`, `LoginPage`, `DeliveryPage` – all selectors and page actions live here |
| `playwright.config.js` | Base URL, `data-testid` attribute, and the web server that starts the app |

## Starting Playwright and the app

You do **not** need to start the QPizza app yourself. `playwright.config.js` has a `webServer` setting:
every Playwright command (also UI mode) starts the app on http://localhost:4280 first.

```bash
npx playwright test --ui     # UI mode – starts the app too (same as: npm run ui)
```

Prefer to start the app separately, e.g. to click around in it in your own browser? That works as well:

```bash
# terminal 1
npm run app                  # QPizza on http://localhost:4280
# terminal 2
npx playwright test --ui     # sees the app is already running and reuses it
```

## Page Object Model

The tests use the **Page Object Model**. Each page of the app has a class in `pages/` that knows *how* to
work with that page (selectors, clicks, typing). The tests only say *what* should happen and *what* we expect:

```js
const orderPage = new OrderPage(page);
await orderPage.open();
await orderPage.addPizzas(11);
await expect(orderPage.message).toHaveText('You can order at most 10 pizzas.');
```

Rule of thumb: the `expect`s stay in the test; page objects only give access to elements and perform actions.

## Useful commands

```bash
npm run ui             # = npx playwright test --ui: run tests, watch mode, time-travel through every step
npm test               # run all examples headless
npm run test:workshop  # run only your workshop tests
npm run report         # open the HTML report of the last run
npx playwright codegen http://localhost:4280   # record clicks into code (start the app first: npm run app)
```

## Workshop – Can QPizza deliver to you? (20 minutes)

Page: http://localhost:4280/delivery.html

**Requirements from the product owner**

- **R1** A postcode is valid when it has exactly 4 digits. Otherwise: `Please enter a valid Belgian postcode.`
- **R2** QPizza delivers to postcodes **2000 up to and including 2660**. Otherwise: `Sorry, we don't deliver to <postcode> yet.`
- **R3** Orders **under €25.00** pay a delivery fee of €3.50: `We deliver to <postcode>! Delivery fee: €3.50`
- **R4** Orders of **€25.00 or more** get free delivery: `We deliver to <postcode>! Free delivery`

**Your task (in pairs)**

1. *5 min – on paper:* list the equivalence partitions and the boundary values for the postcode and the order total.
2. *12 min – in Playwright:* turn your values into tests in `tests/workshop/delivery.spec.js`.
   Use the page object: `delivery.checkDelivery(postcode, total)` and `delivery.result`.
3. *Run them.* Does every test pass? If not: is it your test, or did you find a bug? Write a short bug report:
   title, steps to reproduce, expected result, actual result.

**Bonus:** make your test data-driven with an array and a `for…of` loop (see example 1).

**Tip:** every browser step needs `await`. A forgotten `await` is the most common cause of strange errors.

