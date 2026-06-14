import { test, expect } from '@playwright/test'

test.describe('Lesson flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'teste@teste.com')
    await page.fill('[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('navigate to lesson and see content', async ({ page }) => {
    await page.locator('.module-card').first().click()
    await expect(page).toHaveURL(/\/lesson\//, { timeout: 10000 })
    await expect(page.locator('.virtual-keyboard')).toBeVisible({ timeout: 5000 })
  })

  test('type a letter and earn points', async ({ page }) => {
    await page.locator('.module-card').first().click()
    await expect(page).toHaveURL(/\/lesson\//, { timeout: 10000 })

    await page.waitForSelector('.target-char', { timeout: 5000 })
    const target = await page.locator('.target-char').textContent()

    await page.keyboard.press(target.trim())
    await page.waitForTimeout(1000)

    await expect(page.locator('text=Lição Completa')).toBeVisible({ timeout: 10000 })
  })
})
