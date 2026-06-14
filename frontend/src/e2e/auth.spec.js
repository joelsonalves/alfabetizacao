import { test, expect } from '@playwright/test'

test('register and login flow', async ({ page }) => {
  const email = `test-${Date.now()}@test.com`

  await page.goto('/register')
  await page.fill('[name="name"]', 'Teste E2E')
  await page.fill('[name="email"]', email)
  await page.fill('[name="password"]', '123456')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  await expect(page.locator('text=Olá, Teste E2E')).toBeVisible({ timeout: 5000 })
})

test('login with existing user', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'teste@teste.com')
  await page.fill('[name="password"]', '123456')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
})

test('shows error on invalid login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'wrong@test.com')
  await page.fill('[name="password"]', 'wrongpass')
  await page.click('button[type="submit"]')

  await expect(page.locator('text=inválido')).toBeVisible({ timeout: 5000 })
})
