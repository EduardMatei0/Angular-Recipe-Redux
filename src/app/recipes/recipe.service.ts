import { Recipe } from './recipe.model';
import {  Injectable } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import * as ShoppingListActions from '../shopping-list/store/shopping-list.actions';
import * as fromApp from '../store/app.reducer';




@Injectable()
export class RecipeService {
    recipesChanged = new Subject<Recipe[]>();
  
    constructor(private store: Store<fromApp.AppState>) {}

    private recipes: Recipe[] = [
        new Recipe('Spicy Deviled Eggs', 'Hope you enjoy them as much as my friends and family!',
         'https://images.media-allrecipes.com/userphotos/560x315/330365.jpg', 
                    [ new Ingredient('Eggs', 10), new Ingredient('Mustar', 0.5), new Ingredient('Salt', 1)]),
         new Recipe('Japanese Deviled Eggs', 'Great twist on a old favorite.',
         'https://images.media-allrecipes.com/userphotos/560x315/1115452.jpg',
                    [ new Ingredient('Eggs', 9), new Ingredient('Mayonesse', 0.5), new Ingredient('Teaspoons', 2)]),
         new Recipe('Greek Deviled Eggs', 'Combining feta cheese, balsamic vinegar, and fresh basil is a winning recipe for some delicious deviled eggs!',
         'https://images.media-allrecipes.com/userphotos/560x315/1169728.jpg', 
                    [ new Ingredient('Eggs', 12), new Ingredient('Crumblet Feeta Cheesa', 1), new Ingredient('Tomato', 1)]),
         new Recipe('Classic Savory Deviled Eggs', 'Hard-cooked eggs are stuffed with a creamy blend of mayonnaise, Dijon mustard and rice wine vinegar.',
         'https://images.media-allrecipes.com/userphotos/560x315/3275386.jpg',
                    [ new Ingredient('Eggs', 6), new Ingredient('Dijon Mustard', 1), new Ingredient('Spring fresh dill', 12)]),
         new Recipe('Bacon Cheddar Deviled Eggs', 'These deviled eggs include bacon and shredded cheddar cheese. Better than your ordinary deviled eggs.',
         'https://images.media-allrecipes.com/userphotos/720x405/2237472.jpg', 
                    [ new Ingredient('Eggs', 12), new Ingredient('Slices of Bacon', 4), new Ingredient('Cheddar Cheese', 2)]),
      ];

    setRecipes(recipes: Recipe[]) {
        this.recipes = recipes;
        this.recipesChanged.next(this.recipes.slice());
    }

    getRecipes() {
        return this.recipes.slice();
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]) {
        this.store.dispatch(new ShoppingListActions.AddIngredients(ingredients));
    }

    getRecipeById(id): Recipe {
        return this.recipes[id];
    }

    onAddRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
        this.recipesChanged.next(this.recipes.slice());
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe;
        this.recipesChanged.next(this.recipes.slice());
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index, 1);
        this.recipesChanged.next(this.recipes.slice());
    }
}