def search_recipes(self):
    """Search for recipes based on ingredients"""
    ingredients_text = self.ingredients_entry.get().strip()
    if not ingredients_text:
        messagebox.showinfo("Input Required", "Please enter some ingredients")
        return

    ingredients = [item.strip() for item in ingredients_text.split(',')]

    self.results_text.configure(state='normal')
    self.results_text.delete(1.0, tk.END)

    # Cache favorites as a set for fast lookup
    favorite_names = {fav.get("name") for fav in self.recommender.favorites}

    self.current_recipes = self.recommender.recommend_recipes(ingredients)

    if not self.current_recipes:
        self.results_text.insert(tk.END, "No matching recipes found. Try entering more or different ingredients.")
    else:
        self.results_text.insert(tk.END, f"Found {len(self.current_recipes)} matching recipes:\n\n")

        for i, recipe in enumerate(self.current_recipes):
            recipe_text = self.format_recipe(recipe, ingredients)
            self.results_text.insert(tk.END, recipe_text)

            # Determine button label
            if recipe.get("name") in favorite_names:
                button_text = "✓ In Favorites"
                callback = lambda e: messagebox.showinfo("Info", "This recipe is already in your favorites")
            else:
                button_text = "★ Add to Favorites"
                callback = lambda e, idx=i: self.add_to_favorites(idx)

            tag = f"fav_button_{i}"
            start_index = self.results_text.index(tk.END)
            self.results_text.insert(tk.END, f"\n{button_text}\n\n")
            end_index = self.results_text.index(tk.END)

            self.results_text.tag_add(tag, start_index, end_index)
            self.results_text.tag_config(tag, foreground="blue", underline=1)
            self.results_text.tag_bind(tag, "<Button-1>", callback)

    self.results_text.configure(state='disabled')


def add_to_favorites(self, recipe_index):
    """Add a recipe to favorites without refreshing the whole list"""
    if 0 <= recipe_index < len(self.current_recipes):
        recipe = self.current_recipes[recipe_index]
        if self.recommender.add_to_favorites(recipe):
            messagebox.showinfo("Success", f"Added '{recipe['name']}' to favorites!")
            self.display_favorites()
        else:
            messagebox.showinfo("Info", "This recipe is already in your favorites")
 