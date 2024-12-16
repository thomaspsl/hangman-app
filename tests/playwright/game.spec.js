const { test, expect } = require('@playwright/test');

// Test de vérification du titre
test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Hangman/);
});

// Test pour vérifier l'affichage des éléments principaux
test('displays main elements', async ({ page }) => {
    await page.goto('/');

    // Vérifie que le mot caché est affiché
    await expect(page.locator('p:has-text("Mot à deviner :")')).toBeVisible();

    // Vérifie que le score est affiché
    await expect(page.locator('#score')).toBeVisible();

    // Vérifie que le formulaire d'entrée existe
    await expect(page.locator('form[action="/guess"]')).toBeVisible();
});

// Test pour soumettre une lettre valide
test('submit valid letter', async ({ page }) => {
    await page.goto('/');

    // Remplit et soumet une lettre
    await page.fill('input[name="letter"]', 'A');
    await page.click('button[type="submit"]');

    // Vérifie que la page se recharge sans erreur
    await expect(page).toHaveURL('/');
    await expect(page.locator('#error')).not.toBeVisible();
});

// Test pour soumettre une lettre invalide
test('submit invalid letter', async ({ page }) => {
    await page.goto('/');

    // Remplit et soumet une lettre invalide
    await page.fill('input[name="letter"]', '1');
    await page.click('button[type="submit"]');

    // Vérifie que le message d'erreur est affiché
    await expect(page.locator('#error')).toBeVisible();
    await expect(page.locator('#error')).toContainText('Entrée invalide');
});

// Test pour vérifier la fin du jeu
// et naviguer à travers save.ejs et end.ejs
test('game complete flow', async ({ page }) => {
    await page.goto('/');

    // Boucle tant que le formulaire de saisie est présent
    const letters = ['W', 'K', 'X', 'Y', 'Z', 'Q', 'J', 'V']; // Lettres les moins courantes en français
    let currentIndex = 0;

    while (await page.locator('form[action="/guess"]').isVisible()) {
        const letter = letters[currentIndex % letters.length]; // Alterne les lettres à tester
        await page.fill('input[name="letter"]', letter);
        await page.click('button[type="submit"]');
        currentIndex++;
    }

    // Vérifie que la page de sauvegarde est visible
    await expect(page.locator('form[action="/save"]')).toBeVisible();

    // Remplit le formulaire de sauvegarde
    await page.fill('input[name="pseudo"]', 'TestUser');
    await page.click('button[type="submit"]');

    // Vérifie que la page de fin de partie est visible
    await expect(page.locator('p:has-text("Votre score")')).toBeVisible();
    await expect(page.locator('p:has-text("Le mot était")')).toBeVisible();

    // Vérifie que la liste des meilleurs scores est visible
    await expect(page.locator('p:has-text("Les 1000 meilleurs scores")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
});

// Test pour vérifier que le refresh reste sur la page de fin
test('refresh on end page', async ({ page }) => {
    await page.goto('/');

    // Simule la fin du jeu
    const letters = ['W', 'K', 'X', 'Y', 'Z', 'Q', 'J', 'V'];
    let currentIndex = 0;

    while (await page.locator('form[action="/guess"]').isVisible()) {
        const letter = letters[currentIndex % letters.length];
        await page.fill('input[name="letter"]', letter);
        await page.click('button[type="submit"]');
        currentIndex++;
    }

    // Sauvegarde le score
    await page.fill('input[name="pseudo"]', 'TestUser');
    await page.click('button[type="submit"]');

    // Vérifie la présence des éléments finaux
    await expect(page.locator('p:has-text("Votre score")')).toBeVisible();
    await expect(page.locator('p:has-text("Le mot était")')).toBeVisible();

    // Rafraîchit la page
    await page.reload();

    // Vérifie que la page reste la page de fin
    await expect(page.locator('p:has-text("Votre score")')).toBeVisible();
    await expect(page.locator('p:has-text("Le mot était")')).toBeVisible();
});

// Test pour vérifier que le score est correctement mis à jour
test('score updates correctly', async ({ page }) => {
    await page.goto('/');

    // Vérifie le score initial
    const initialScore = await page.locator('#score span').innerText();

    // Fait une soumission incorrecte
    await page.fill('input[name="letter"]', 'Z');
    await page.click('button[type="submit"]');

    // Vérifie que le score a été décrémenté
    const updatedScore = await page.locator('#score span').innerText();
    expect(parseInt(updatedScore)).toBeLessThan(parseInt(initialScore));
});
