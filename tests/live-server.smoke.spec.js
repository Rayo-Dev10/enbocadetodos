import { expect, test } from "@playwright/test";

test.describe("Live Server smoke", () => {
  test("la app responde y los botones clave abren sus capas", async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#catalogGrid")).toBeVisible();
    await expect(page.locator("[data-action='open-product']")).toHaveCount(3);

    const cartHeaderButton = page.locator("#cartButton");
    await expect(cartHeaderButton).toBeVisible();
    await cartHeaderButton.click();
    await expect(page.locator("#cartOverlay")).toBeVisible();
    await expect(page.locator("#cartSheet")).toBeVisible();
    await page.getByRole("button", { name: "Cerrar carrito" }).click();

    const firstProductButton = page.locator("[data-action='open-product']").first();
    await firstProductButton.click();
    await expect(page.locator("#productOverlay")).toBeVisible();
    await expect(page.locator("#productSheet")).toBeVisible();

    await page.locator(".chip", { hasText: "Pollo desmechado" }).click();
    await page.locator(".chip", { hasText: "Pico de gallo" }).click();
    await page.locator("#addToCartButton").click();

    await expect(page.locator("#quickActions")).toBeVisible();
    await expect(page.locator("#cartFab")).toBeVisible();
    await expect(page.locator("#orderNowButton")).toBeVisible();

    await page.locator("#cartFab").click();
    await expect(page.locator("#cartOverlay")).toBeVisible();
    await expect(page.locator(".cart-list")).toBeVisible();
    await page.getByRole("button", { name: "Cerrar carrito" }).click();

    await page.locator("#orderNowButton").click();
    await expect(page.locator("#deliveryOverlay")).toBeVisible();
    await expect(page.locator("#deliverySheet")).toBeVisible();

    expect.soft(pageErrors, `Errores de página: ${pageErrors.join("\n")}`).toEqual([]);
    expect.soft(consoleErrors, `Errores de consola: ${consoleErrors.join("\n")}`).toEqual([]);
  });
});
