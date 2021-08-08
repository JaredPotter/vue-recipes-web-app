<template>
  <div class="recipes-page-container">
    <div class="search">
      <div>
        <label>
          <input
            type="text"
            @input="debounceInput"
            @keydown.exact="handleSearchArrowKeys($event)"
            @keydown.enter.prevent="selectRecipe()"
            @blur="resetSearch()"
            placeholder="Search..."
          />
        </label>
        <div class="suggestion-list" ref="suggestionRecipeList">
          <div>
            <div
              v-for="(suggestion, index) in suggestionRecipeList"
              :key="suggestion.id"
            >
              <div
                class="suggetion-item"
                :class="{ selected: index === selected }"
                @mousedown="selectRecipe(suggestion.id)"
                ref="suggestionItem"
              >
                {{ suggestion.title }}
              </div>
            </div>
            <div
              v-show="
                !isLoadingSearchResults &&
                  suggestionRecipeList.length === 0 &&
                  searchQuery.length >= 2
              "
              class="no-match"
            >
              (Not Found)
            </div>
          </div>
        </div>
      </div>
      <div class="word-list" @click.prevent.stop="openWordList()">
        <select
          v-show="isSearchWordListOpen"
          ref="wordList"
          @mouseleave="closeWordList()"
        >
          <option
            v-for="recipe in suggestionRecipeList"
            :key="recipe.id"
            :value="recipe.id"
            @click.self="selectRecipe(recipe.id)"
          >
            {{ recipe.title }}
          </option>
        </select>
      </div>

      <img
        src="../assets/search-by-algolia-light-background.svg"
        class="delete"
      />
      <div v-if="isLoadingSearchResults" class="lds-spinner lds-spinner-small">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="filter-sort">
      <label>
        Sort By Publish Date or Title:
        <select @change="sortByChange($event)" class="sort-by">
          <option value="publishDateDesc"
            >Publish Date (Newest - Oldest)</option
          >
          <option value="publishDateAsc">Publish Date (Oldest - Newest)</option>
          <option value="titleAsc">Title (A-Z)</option>
          <option value="titleDesc">Title (Z-A)</option>
        </select>
      </label>
      <label>
        Filter By Tag:
        <select
          @change="filterByChange($event)"
          class="sort-by"
          v-model="filterByTag"
        >
          <option value="">Select Tag</option>
          <option v-for="tag of tags" :key="tag.tag" :value="tag.tag">{{
            tag.tag
          }}</option>
        </select>
      </label>
    </div>
    <div v-if="isLoading" class="lds-spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div v-if="!isLoading" class="recipe-card-list">
      <div v-for="recipe in recipes" :key="recipe.id">
        <RecipeCard :recipe="recipe" @setTag="setFilterByTag($event)" />
      </div>
    </div>
    <div class="next-prev-buttons">
      <button
        v-if="currentPage > 1 && !isLoading"
        @click="handlePreviousClick()"
      >
        PREVIOUS
      </button>
      <button v-if="!isLoading" @click="handleNextClick()">NEXT</button>
    </div>
  </div>
</template>

<script>
import RecipeCard from './RecipeCard.vue';
import axios from 'axios';
import { debounce } from 'debounce';

const API_URL = process.env.VUE_APP_API_URL
  ? process.env.VUE_APP_API_URL
  : 'http://localhost:8000/api';

export default {
  name: 'RecipesPage',
  components: {
    RecipeCard,
  },
  data() {
    return {
      searchQuery: '',
      isLoading: false,
      originalRecipes: [],
      recipes: [],
      sortBy: 'publishDateDesc',
      filterByTag: '',
      currentPage: 1,
      tags: [],
      suggestionRecipeList: [],
      selected: 0,
      isSearchWordListOpen: false,
      isLoadingSearchResults: false,
    };
  },
  methods: {
    debounceInput: debounce.debounce(async function(event) {
      // // eslint-disable-next-line no-debugger
      // debugger;
      const query = event.target.value;

      this.searchQuery = query;

      // Valid if alpha or approved special character.
      if (!/\w+/.test(query)) {
        this.suggestionRecipeList = [];
        return;
      }

      if (query.length >= 2) {
        try {
          this.isLoadingSearchResults = true;
          const url = `${API_URL}/recipes`;
          const response = await axios.get(url, {
            params: {
              query,
            },
          });
          const recipes = response.data;
          this.suggestionRecipeList = recipes;
          this.isLoadingSearchResults = false;
        } catch (error) {
          this.isLoadingSearchResults = false;
          console.error(error);
        }
      } else {
        this.suggestionRecipeList = [];
      }
    }, 750),
    setFilterByTag(event) {
      this.filterByTag = event;

      this.fetchRecipes();
    },
    sortByChange(event) {
      this.sortBy = event.target.value;

      this.fetchRecipes();
    },
    filterByChange(event) {
      this.filterByTag = event.target.value;

      this.fetchRecipes();
    },
    async fetchTags() {
      try {
        const url = `${API_URL}/tags`;
        const response = await axios.get(url);

        this.tags = response.data.data.sort((a, b) =>
          a.tag.localeCompare(b.tag)
        );
      } catch (error) {
        console.error(error);
      }
    },
    async fetchRecipes() {
      console.log('Fetching recipes...');

      this.isLoading = true;
      const params = {};

      if (this.sortBy) {
        if (this.sortBy === 'publishDateDesc') {
          params['sortByDir'] = 'desc';
          params['sortByField'] = 'publish_date';
        } else if (this.sortBy === 'publishDateAsc') {
          params['sortByDir'] = 'asc';
          params['sortByField'] = 'publish_date';
        } else if (this.sortBy === 'titleAsc') {
          params['sortByDir'] = 'asc';
          params['sortByField'] = 'title';
        } else if (this.sortBy === 'titleDesc') {
          params['sortByDir'] = 'desc';
          params['sortByField'] = 'title';
        }
      }

      if (this.filterByTag) {
        params['filterByTag'] = this.filterByTag;
      }

      params['page'] = this.currentPage;

      try {
        const url = `${API_URL}/recipes`;
        const response = await axios.get(url, {
          params,
        });

        this.originalRecipes = response.data.data;

        this.recipes = this.originalRecipes.slice(0);
      } catch (error) {
        console.error(error);
      }

      this.isLoading = false;
    },
    handlePreviousClick() {
      this.currentPage--;
      this.fetchRecipes();
    },
    handleNextClick() {
      this.currentPage++;
      this.fetchRecipes();
    },
    handleSearchArrowKeys(event) {
      if (event.key == 'ArrowUp') {
        if (this.selected > 0) {
          this.selected = this.selected - 1;
          const itemHeight = this.$refs.suggestionItem[this.selected]
            .clientHeight;
          const itemOffsetTop = this.$refs.suggestionItem[this.selected]
            .offsetTop;
          const listHeight = this.$refs.suggestionRecipeList.clientHeight;

          if (itemOffsetTop - itemHeight < listHeight) {
            this.$refs.suggestionRecipeList.scrollTop = itemOffsetTop;
          }
        }
        event.preventDefault();
      } else if (event.key == 'ArrowDown') {
        if (this.selected < this.suggestionRecipeList.length - 1) {
          this.selected = this.selected + 1;
          const itemHeight = this.$refs.suggestionItem[this.selected]
            .clientHeight;
          const itemOffsetTop = this.$refs.suggestionItem[this.selected]
            .offsetTop;
          const listHeight = this.$refs.suggestionRecipeList.clientHeight;

          if (itemHeight + itemOffsetTop > listHeight) {
            const diff = itemHeight + itemOffsetTop - listHeight;
            this.$refs.suggestionRecipeList.scrollTop = diff;
          }
        }
        event.preventDefault();
      }
    },
    resetSearch() {
      this.searchQuery = '';
      this.suggestionRecipeList = [];
      this.selected = 0;
    },
    selectRecipe(recipeId) {
      if (!recipeId) {
        recipeId = this.suggestionRecipeList[this.selected].id;
      }

      this.$router.push(`/recipes/${recipeId}`);
    },
    closeWordList() {
      this.isSearchWordListOpen = false;
      this.$refs.wordList.size = 0;
    },
  },
  async mounted() {
    const filterByTag = this.$route.query.filterByTag;

    if (filterByTag) {
      this.filterByTag = filterByTag;
      this.$router.replace('/recipes');
    }

    this.fetchRecipes();
    this.fetchTags();
  },
};
</script>

<style lang="scss">
.recipes-page-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  .search {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    width: 40rem;
    position: relative;

    input {
      width: 30rem;
      height: 2rem;
      font-size: 2rem;
    }

    .suggestion-list {
      overflow-y: auto;
      position: absolute;
      background: white;
      z-index: 50;
      max-height: 12rem;
      width: 100%;

      .suggetion-item {
        cursor: pointer;
        padding-left: 5px;
        padding-right: 5px;
        width: 100%;
        text-align: left;
        font-size: 1.75rem;
      }

      .selected {
        background: rgba(74, 93, 255, 0.25);
      }

      .no-match {
        color: red;
        font-size: 1.75rem;
        padding-left: 5px;
        padding-right: 5px;
      }
    }

    img {
      margin-left: 1rem;
      margin-right: 1rem;
    }

    .word-list {
      z-index: 50;
      position: absolute;
      top: 0px;
      right: 0px;
      width: 100%;

      .dropdown-background {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      select {
        position: absolute;
        border: none;
        color: white;
        top: 100%;
        right: 0px;

        option {
          color: white;
          cursor: pointer;
        }

        option:hover {
          background: rgba(74, 93, 255, 0.25);
        }
      }
    }
  }

  .filter-sort {
    margin-bottom: 1rem;

    .sort-by {
      font-size: 1.25rem;
    }
  }

  .recipe-card-list {
    width: 80%;
    display: flex;
    border: 1px solid black;
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    margin-bottom: 1rem;
  }

  .next-prev-buttons {
    button {
      background: white;
      font-size: 2rem;
      padding: 1rem;
      margin-right: 1rem;
      cursor: pointer;
    }

    button:hover {
      background: ghostwhite;
    }
  }

  .lds-spinner {
    color: official;
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .lds-spinner div {
    transform-origin: 40px 40px;
    animation: lds-spinner 1.2s linear infinite;
  }
  .lds-spinner div:after {
    content: ' ';
    display: block;
    position: absolute;
    top: 3px;
    left: 37px;
    width: 6px;
    height: 18px;
    border-radius: 20%;
    background: black;
  }
  .lds-spinner div:nth-child(1) {
    transform: rotate(0deg);
    animation-delay: -1.1s;
  }
  .lds-spinner div:nth-child(2) {
    transform: rotate(30deg);
    animation-delay: -1s;
  }
  .lds-spinner div:nth-child(3) {
    transform: rotate(60deg);
    animation-delay: -0.9s;
  }
  .lds-spinner div:nth-child(4) {
    transform: rotate(90deg);
    animation-delay: -0.8s;
  }
  .lds-spinner div:nth-child(5) {
    transform: rotate(120deg);
    animation-delay: -0.7s;
  }
  .lds-spinner div:nth-child(6) {
    transform: rotate(150deg);
    animation-delay: -0.6s;
  }
  .lds-spinner div:nth-child(7) {
    transform: rotate(180deg);
    animation-delay: -0.5s;
  }
  .lds-spinner div:nth-child(8) {
    transform: rotate(210deg);
    animation-delay: -0.4s;
  }
  .lds-spinner div:nth-child(9) {
    transform: rotate(240deg);
    animation-delay: -0.3s;
  }
  .lds-spinner div:nth-child(10) {
    transform: rotate(270deg);
    animation-delay: -0.2s;
  }
  .lds-spinner div:nth-child(11) {
    transform: rotate(300deg);
    animation-delay: -0.1s;
  }
  .lds-spinner div:nth-child(12) {
    transform: rotate(330deg);
    animation-delay: 0s;
  }
  @keyframes lds-spinner {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .lds-spinner-small {
    height: 40px;
    width: 40px;
  }

  .lds-spinner-small div {
    transform-origin: 20px 20px;
    animation: lds-spinner 1.2s linear infinite;
  }
}
</style>
