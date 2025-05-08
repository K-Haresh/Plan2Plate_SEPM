// Improved saveToExcel function
function saveToExcel() {
    // Make sure database is fully loaded before export
    loadDatabase();

    if (recipeDatabase.length === 0) {
        alert("No recipes to export. Please add some recipes first!");
        return;
    }

    try {
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();

        // Format data properly for Excel
        const data = [];

        // Add header row
        data.push({
            ID: "ID",
            Title: "Title",
            Ingredients: "Ingredients",
            Directions: "Directions",
            Link: "Link",
            Site: "Site",
            NER: "NER Tags",
            Date: "Creation Date"
        });

        // Add ALL recipe data rows
        recipeDatabase.forEach(recipe => {
            data.push({
                ID: recipe.id,
                Title: recipe.title,
                Ingredients: recipe.ingredients.join('; '),
                Directions: recipe.directions,
                Link: recipe.link || "",
                Site: recipe.site || "",
                NER: (recipe.ner || []).join('; '),
                Date: recipe.date ? new Date(recipe.date).toLocaleString() : new Date().toISOString()
            });
        });

        // Convert to worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Add to workbook and write file
        XLSX.utils.book_append_sheet(wb, ws, "recipes");
        XLSX.writeFile(wb, EXCEL_FILENAME);

        alert("Recipes successfully exported to " + EXCEL_FILENAME);
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        alert("Error exporting recipes: " + error.message);
    }
}
// Enhanced sharing functionality
function showSiteForSharing(recipeId) {
    // Extract the clean ID (removing 'view-' prefix if present)
    const cleanId = recipeId.startsWith('view-') ? recipeId.substring(5) : recipeId;
    const recipe = recipeDatabase.find(r => r.id === cleanId);

    if (!recipe) {
        console.error("Recipe not found for sharing:", cleanId);
        return;
    }

    // Toggle display of sharing options
    const siteLink = document.getElementById(`site-link-${recipeId}`);
    if (siteLink.style.display === 'block') {
        siteLink.style.display = 'none';
    } else {
        // Generate formatted recipe text for sharing
        const recipeText = `Check out this recipe for ${recipe.title}!\n\n` +
                          `Ingredients: ${recipe.ingredients.join(', ')}\n\n` +
                          `Directions: ${recipe.directions}\n\n` +
                          `${recipe.link ? 'Original link: ' + recipe.link : ''}`;

        // Update sharing options UI
        siteLink.innerHTML = `
            <p>Share this recipe via:</p>
            <button onclick="shareViaEmail('${cleanId}')">Email</button>
            <button onclick="shareViaCopy('${cleanId}')">Copy to Clipboard</button>
            ${recipe.link ? `<p>Original recipe: <a href="${recipe.link}" target="_blank">${recipe.link}</a></p>` : ''}
        `;
        siteLink.style.display = 'block';
    }
}

// Share via email
function shareViaEmail(recipeId) {
    const recipe = recipeDatabase.find(r => r.id === recipeId);
    if (!recipe) return;

    const subject = `Recipe: ${recipe.title}`;
    const body = `Check out this recipe for ${recipe.title}!\n\n` +
                `Ingredients: ${recipe.ingredients.join(', ')}\n\n` +
                `Directions: ${recipe.directions}\n\n` +
                `${recipe.link ? 'Original link: ' + recipe.link : ''}`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Copy to clipboard
function shareViaCopy(recipeId) {
    const recipe = recipeDatabase.find(r => r.id === recipeId);
    if (!recipe) return;

    const recipeText = `${recipe.title}\n\n` +
                      `Ingredients: ${recipe.ingredients.join(', ')}\n\n` +
                      `Directions: ${recipe.directions}\n\n` +
                      `${recipe.link ? 'Original link: ' + recipe.link : ''}`;

    // Create temporary textarea to copy from
    const textArea = document.createElement('textarea');
    textArea.value = recipeText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    alert('Recipe copied to clipboard!');
}
// Improved loadAllRecipes function
function loadAllRecipes() {
    const recipesDiv = document.getElementById('all-recipes');

    // Ensure database is loaded
    loadDatabase();

    if (!recipeDatabase || recipeDatabase.length === 0) {
        recipesDiv.innerHTML = '<p><em>No recipes found. Add some recipes first!</em></p>';
        return;
    }

    let html = '';
    recipeDatabase.forEach(recipe => {
        if (!recipe || !recipe.title) {
            console.warn("Skipping invalid recipe entry:", recipe);
            return; // Skip invalid entries
        }

        // Ensure ingredients is always an array
        const ingredients = Array.isArray(recipe.ingredients) ?
            recipe.ingredients.join(', ') :
            (recipe.ingredients || "None");

        html += `
            <div class="recipe-card">
                <h3>${recipe.title || "Untitled Recipe"}</h3>
                <p><strong>Ingredients:</strong> ${ingredients}</p>
                <p><strong>Directions:</strong> ${recipe.directions || "No directions provided"}</p>
                ${recipe.link ? `<p><strong>Original Link:</strong> <a href="${recipe.link}" target="_blank">${recipe.link}</a></p>` : ''}
                <p><strong>Source:</strong> ${recipe.site || "Not specified"}</p>
                <button class="share-button" onclick="showSiteForSharing('view-${recipe.id}')">Share Recipe</button>
                <div id="site-link-view-${recipe.id}" class="site-link">
                    <p>Share this recipe via: <strong>${recipe.site || "Not specified"}</strong></p>
                    ${recipe.link ? `<p>Original recipe: <a href="${recipe.link}" target="_blank">${recipe.link}</a></p>` : ''}
                </div>
            </div>
        `;
    });

    recipesDiv.innerHTML = html;
}