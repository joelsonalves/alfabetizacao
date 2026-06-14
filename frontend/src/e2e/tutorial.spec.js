import { test, expect } from '@playwright/test'

test('tutorial page loads', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'teste@teste.com')
  await page.fill('[name="password"]', '123456')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

  await page.goto('/tutorial')
  await expect(page.locator('text=Tutorial')).toBeVisible({ timeout: 5000 })
})
