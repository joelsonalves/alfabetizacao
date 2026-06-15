import { test, expect } from "@playwright/test"

test("shows error message for unregistered email", async ({ page }) => {
  await page.goto("/login")

  // Preenche com e-mail e senha não cadastrados
  await page.fill("[name=\"email\"]", "email_nao_cadastrado@teste.com")
  await page.fill("[name=\"password\"]", "teste123")
  await page.click("button[type=\"submit\"]")

  // Aguarda a mensagem de erro aparecer
  await expect(page.locator(".auth-error")).toBeVisible({ timeout: 10000 })

  // Verifica o texto da mensagem (em português)
  await expect(page.locator(".auth-error")).toHaveText(/Email ou senha inválidos/)

  // Verifica que NÃO fomos redirecionados para o dashboard
  await expect(page).toHaveURL(/\/login/, { timeout: 3000 })
})
