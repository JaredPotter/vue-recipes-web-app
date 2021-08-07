<template>
  <div class="recipes-page-container">
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
    <div class="recipe-card-list">
      <div v-for="recipe in recipes" :key="recipe.id">
        <RecipeCard :recipe="recipe" @setTag="setFilterByTag($event)" />
      </div>
    </div>
    <div class="next-prev-buttons">
      <button v-if="currentPage > 1" @click="handlePreviousClick()">
        PREVIOUS
      </button>
      <button @click="handleNextClick()">NEXT</button>
    </div>
  </div>
</template>

<script>
import RecipeCard from './RecipeCard.vue';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default {
  name: 'RecipesPage',
  components: {
    RecipeCard,
  },
  data() {
    return {
      isLoading: false,
      originalRecipes: [],
      recipes: [],
      sortBy: 'publishDateDesc',
      filterByTag: '',
      currentPage: 1,
      tags: [],
    };
  },
  methods: {
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
        const response = await axios.get(`${API_URL}/tags`);
        // eslint-disable-next-line no-debugger
        // debugger;
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
        const response = await axios.get(`${API_URL}/recipes`, {
          params,
        });

        this.originalRecipes = response.data.data;

        // eslint-disable-next-line no-debugger
        // debugger;
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
  },
  async mounted() {
    const filterByTag = this.$route.query.filterByTag;

    if (filterByTag) {
      this.filterByTag = filterByTag;
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
}
</style>
