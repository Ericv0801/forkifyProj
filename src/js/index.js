import Search from "./models/Search";
import Recipe from "./models/Recipe";
import * as searchView from "./views/searchViews";
import { elements, renderLoader, clearLoader } from "./views/base";

/** Global State of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */

const state = {};

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

    //Create new recipe object
    state.recipe = new Recipe(id);
    try {
      //Get recipe data
      await state.recipe.getRecipe();
      //Calc Servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      //render recipe
      console.log(state.recipe);
    } catch (err) {
      alert("Error processing recipe!");
    }
  }
};
["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);
