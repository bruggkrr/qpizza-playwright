// EXAMPLE 3 – State transition testing: staff login with a PIN
//
//   START --wrong--> TRY 1 --wrong--> TRY 2 --wrong--> BLOCKED
//     |                |                |                 |
//   correct          correct          correct          any PIN (also correct!) → stays BLOCKED
//     v                v                v
//   GRANTED          GRANTED          GRANTED
//
// Goal: cover every valid transition at least once (0-switch coverage)
//       AND the invalid transition "correct PIN while blocked".
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');

const BLOCKED = 'Account blocked. Contact the helpdesk.';
const THREE_WRONG = ['0000', '1111', '2222'];

test.describe('Staff login – state transitions', () => {
  let login;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.open();
  });

  test('START → GRANTED with the correct PIN', async () => {
    await login.enterPin('1234');
    await expect(login.status).toHaveText('Access granted');
    await expect(login.dashboard).toBeVisible();
  });

  test('START → TRY 1 → TRY 2 → GRANTED: correct PIN on the last attempt still works', async () => {
    await login.enterPin('0000');
    await expect(login.status).toHaveText('Wrong PIN. 2 attempts left.');
    await login.enterPin('1111');
    await expect(login.status).toHaveText('Wrong PIN. 1 attempt left.');
    await login.enterPin('1234');
    await expect(login.status).toHaveText('Access granted');
  });

  test('three wrong PINs → BLOCKED', async () => {
    await login.enterPins(THREE_WRONG);
    await expect(login.status).toHaveText(BLOCKED);
    await expect(login.dashboard).toBeHidden();
  });

  test('invalid transition: BLOCKED + correct PIN stays BLOCKED, also after a reload', async () => {
    await login.enterPins(THREE_WRONG);
    await login.enterPin('1234');
    await expect(login.status).toHaveText(BLOCKED);
    await login.reload();
    await login.enterPin('1234');
    await expect(login.status).toHaveText(BLOCKED);
    await expect(login.dashboard).toBeHidden();
  });

  test('a successful login resets the counter (TRY 1 → GRANTED → START)', async () => {
    await login.enterPin('0000');
    await login.enterPin('1234');
    await login.reload();
    await login.enterPins(['0000', '1111']);
    await expect(login.status).toHaveText('Wrong PIN. 1 attempt left.');
  });
});
