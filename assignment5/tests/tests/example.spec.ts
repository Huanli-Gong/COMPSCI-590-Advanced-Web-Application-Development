import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:8130/customer/alice')
  await page.getByRole('button', { name: 'Add strawberry' }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await page.getByRole('button', { name: 'Submit' }).click()
  await page.goto('http://localhost:8130/operator/jim')
  await page.getByRole('button', { name: 'Refresh' }).click()
  await expect(page.locator('tr:last-child >> td[role="cell"]:nth-of-type(4)')).toContainText("strawberry")
})
