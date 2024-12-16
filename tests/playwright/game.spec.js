const { test, expect } = require('@playwright/test');

// Test de vérification du titre
test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Hangman/);
});

// Test pour vérifier l'affichage des éléments principaux
test('displays main elements', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('p:has-text("Mot à deviner :")')).toBeVisible();

    await expect(page.locator('#score')).toBeVisible();

    await expect(page.locator('form[action="/guess"]')).toBeVisible();
});

// Test pour soumettre une lettre valide
test('submit valid letter', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[name="letter"]', 'A');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('#error')).not.toBeVisible();
});

// Test pour soumettre une lettre invalide
test('submit invalid letter', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[name="letter"]', '1');
    await page.click('button[type="submit"]');

    await expect(page.locator('#error')).toBeVisible();
    await expect(page.locator('#error')).toContainText('Entrée invalide');
});

// Test pour vérifier la fin du jeu / naviguer à travers save.ejs et end.ejs
test('game complete flow', async ({ page }) => {
    await page.goto('/');

    const letters = ['W', 'K', 'X', 'Y', 'Z', 'Q', 'J', 'V'];
    let currentIndex = 0;

    while (await page.locator('form[action="/guess"]').isVisible()) {
        const letter = letters[currentIndex % letters.length];
        await page.fill('input[name="letter"]', letter);
        await page.click('button[type="submit"]');
        currentIndex++;
    }

    await expect(page.locator('form[action="/save"]')).toBeVisible();

    await page.fill('input[name="pseudo"]', 'TestUser');
    await page.click('button[type="submit"]');

    await expect(page.locator('p:has-text("Votre score")')).toBeVisible();
    await expect(page.locator('p:has-text("Le mot était")')).toBeVisible();

    await expect(page.locator('p:has-text("Les 1000 meilleurs scores")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
});
