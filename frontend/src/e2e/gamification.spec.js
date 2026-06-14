import { test, expect } from '@playwright/test'

test.describe('Gamification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'teste@teste.com')
    await page.fill('[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('dashboard shows user stats', async ({ page }) => {
    await expect(page.locator('.dashboard-stats')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=XP')).toBeVisible()
    await expect(page.locator('text=Nível')).toBeVisible()
    await expect(page.locator('text=Dias')).toBeVisible()
  })

  test('complete lesson and verify points', async ({ page }) => {
    await page.locator('.module-card').first().click()
    await expect(page).toHaveURL(/\/lesson\//, { timeout: 10000 })

    await page.waitForSelector('.target-char', { timeout: 5000 })
    const target = await page.locator('.target-char').textContent()
    await page.keyboard.press(target.trim())

    await expect(page.locator('text=Lição Completa')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Próxima Lição')).toBeVisible({ timeout: 5000 })
  })
})
