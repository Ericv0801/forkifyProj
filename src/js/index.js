import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./views/searchViews";
import * as recipeView from "./views/recipeViews";
import * as listView from "./views/listViews";
import * as likeView from "./views/likeViews";
import Likes from "./models/Likes";

import { elements, renderLoader, clearLoader, elementStrings } from "./views/base";

/** Global State of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */

const state = {};
window.state = state;

/**
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
  // 1. Get query from view
  const query = searchView.getInput();



  if (query) {
    // 2. New Search object and add to state
    state.search = new Search(query);

    // 3. Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
      // 4. Search for recipes
      await state.search.getResults();

      // 5. Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert("Something went wrong with the search..");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});


elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/**
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
  //Get ID from URL
  const id = window.location.hash.replace("#", "");
  console.log(id);

  if (id) {
    //Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe)

    //Highlight selected search item
    if(state.search) searchView.highlightedSlected(id);

    //Create new recipe object
    state.recipe = new Recipe(id);


    try {
      //Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //Calc Servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      //render recipe
      clearLoader();
      recipeView.renderRecipe(
          state.recipe,
          state.likes.isLiked(id)
          );

    } catch (err) {
        console.log(err)
      alert("Error processing recipe!");
    }
  }
};
["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

/**
 * LIST CONTROLLER
 */
const controlList = () => {

    //Create a new list IF there is non yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item)
    })
}

//Handle delete and update list item events
elements.shopping.addEventListener('click', e =>{
    const id = e.target.closest('.shopping__item').dataset.itemid

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete from state
        state.list.deleteItem(id)
        //Delete from UI
        listView.deleteItem(id)
        //Handle the Count update
    } else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value)
        state.list.updateCount(id, val);
    }
})

/**
 * LIKE CONTROLLER
 */


const controlLike= () =>{
if (!state.likes) state.likes = new Likes();
const currentID = state.recipe.id

//User has NOT yet liked current recipe 
if(!state.likes.isLiked(currentID)){
    // Add  like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
    //Toggle the like button
        likeView.toggleLikeBtn(true)
    //Add like to UI list
        likeView.renderLike(newLike);

     //User has  liked current recipe 
    }else {

    // Remove like to the state
    state.likes.deleteLike(currentID);
    //Toggle the like button
    likeView.toggleLikeBtn(false)

    //Remove like to UI list
    likeView.deleteLike(currentID)
    console.log(state.likes)

}
likeView.toggleLikeMenu(state.likes.getNumLikes())
}

//Restore Liked recipes on page load
window.addEventListener('load', ()=>{

    state.likes = new Likes();

    //Restore likes
    state.likes.readStorage();

    //Toggle like menu Button
    likeView.toggleLikeMenu(state.likes.getNumLikes());

    //Render the existing likes
    state.likes.likes.forEach(like => likeView.renderLike(like));
})



//Handling recipe button clicks
elements.recipe.addEventListener('click', e =>{
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        //Decrease button is clicked
        if (state.recipe.servings > 1){
        state.recipe.updateServings('dec')
        recipeView.updateServingsIngredients(state.recipe)
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        //Increase button is clicked
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe)

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn *')) {
        //Add ingredients to shoppping list
        controlList()
    } else if (e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controlLike();
    }
})

const l = new List();
window.l = new List();