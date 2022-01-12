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
                class="suggestion-item"
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

      <div v-if="isLoadingSearchResults" class="lds-roller">
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
    <div v-if="isLoading" class="lds-roller">
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
    max-width: 40rem;
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

      .suggestion-item {
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

  @media only screen and (max-width: 768px) {
    .recipes-page-container {
      justify-content: center;
    }

    .search {
      flex-direction: column;
      margin-bottom: 0rem;

      input,
      img {
        margin-bottom: 0.5rem;
      }
      label {
        display: flex;
        justify-content: center;
      }

      input {
        width: 90%;
      }
    }

    .filter-sort {
      flex-direction: column;

      label {
        margin-bottom: 0.5rem;

        .sort-by {
          width: 100%;
        }
      }
    }
  }

  .filter-sort {
    width: 80%;
    display: flex;
    justify-content: space-between;

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

  .lds-roller {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .lds-roller div {
    animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    transform-origin: 40px 40px;
  }
  .lds-roller div:after {
    content: ' ';
    display: block;
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #000;
    margin: -4px 0 0 -4px;
  }
  .lds-roller div:nth-child(1) {
    animation-delay: -0.036s;
  }
  .lds-roller div:nth-child(1):after {
    top: 63px;
    left: 63px;
  }
  .lds-roller div:nth-child(2) {
    animation-delay: -0.072s;
  }
  .lds-roller div:nth-child(2):after {
    top: 68px;
    left: 56px;
  }
  .lds-roller div:nth-child(3) {
    animation-delay: -0.108s;
  }
  .lds-roller div:nth-child(3):after {
    top: 71px;
    left: 48px;
  }
  .lds-roller div:nth-child(4) {
    animation-delay: -0.144s;
  }
  .lds-roller div:nth-child(4):after {
    top: 72px;
    left: 40px;
  }
  .lds-roller div:nth-child(5) {
    animation-delay: -0.18s;
  }
  .lds-roller div:nth-child(5):after {
    top: 71px;
    left: 32px;
  }
  .lds-roller div:nth-child(6) {
    animation-delay: -0.216s;
  }
  .lds-roller div:nth-child(6):after {
    top: 68px;
    left: 24px;
  }
  .lds-roller div:nth-child(7) {
    animation-delay: -0.252s;
  }
  .lds-roller div:nth-child(7):after {
    top: 63px;
    left: 17px;
  }
  .lds-roller div:nth-child(8) {
    animation-delay: -0.288s;
  }
  .lds-roller div:nth-child(8):after {
    top: 56px;
    left: 12px;
  }
  @keyframes lds-roller {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
