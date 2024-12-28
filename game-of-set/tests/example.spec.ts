import { test, expect } from '@playwright/test';
import { chromium, webkit } from 'playwright';

test('dual-browser test', async () => {
  // open chrome
  const chromiumBrowser = await chromium.launch({ headless: false });
  // const chromiumBrowser = await chromium.launch();
  const chromePage = await chromiumBrowser.newPage();

  // open safari
  const webkitBrowser = await webkit.launch({ headless: false });
  // const webkitBrowser = await webkit.launch();
  const safariPage = await webkitBrowser.newPage();

  // open website
  await chromePage.goto('http://localhost:31000/api/login?key=alpha&user=yl967&role=advancedPlayer');
  await safariPage.goto('http://localhost:31000/api/login?key=alpha&user=hg163&role=regularPlayer');

  await chromePage.getByText('New Game').click();
  await chromePage.click('[data-key="card-1"]');
  await chromePage.click('[data-key="card-2"]');
  await chromePage.click('[data-key="card-3"]');
  await chromePage.getByText('Submit Set').click();

  await safariPage.click('[data-key="card-4"]');
  await safariPage.click('[data-key="card-5"]');
  await safariPage.click('[data-key="card-6"]');
  await safariPage.getByText('Submit Set').click();

  await chromePage.getByText('Draw Card').click();
  await chromePage.click('[data-key="card-1"]');
  await chromePage.click('[data-key="card-2"]');
  await chromePage.click('[data-key="card-3"]');
  await chromePage.getByText('Submit Set').click();

  await safariPage.getByText('Pass').click();

  await chromePage.click('[data-key="card-1"]');
  await chromePage.click('[data-key="card-4"]');
  await chromePage.click('[data-key="card-7"]');
  await chromePage.getByText('Submit Set').click();

  await safariPage.click('[data-key="card-2"]');
  await safariPage.click('[data-key="card-5"]');
  await safariPage.click('[data-key="card-8"]');
  await safariPage.getByText('Submit Set').click();

  await chromePage.click('[data-key="card-3"]');
  await chromePage.click('[data-key="card-6"]');
  await chromePage.click('[data-key="card-9"]');
  await chromePage.getByText('Submit Set').click();

  await safariPage.click('[data-key="card-1"]');
  await safariPage.click('[data-key="card-4"]');
  await safariPage.click('[data-key="card-5"]');
  await safariPage.getByText('Submit Set').click();

  await chromePage.getByRole('link', { name: 'Profile' }).click();
  await chromePage.getByLabel('Preferred Level:').selectOption('3');
  await chromePage.getByRole('button', { name: 'Update Profile' }).click();
  await chromePage.getByRole('link', { name: 'History' }).click();
  await chromePage.getByRole('link', { name: 'Logout' }).click();

  // close website
  await chromiumBrowser.close();
  await webkitBrowser.close();
});
