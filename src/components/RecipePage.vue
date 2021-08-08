<template>
  <div class="recipe-page-container">
    <router-link to="/recipes">⬅ BACK</router-link>
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
    <div v-if="!isLoading">
      <h1 class="title">{{ recipe.title }}</h1>
      <img :src="recipe.imageUrl" class="image" />
      <div class="tags-list">
        <a
          v-for="tag in recipe.tags"
          :href="`/recipes?filterByTag=${tag}`"
          :key="tag"
          class="tag"
          @click="handleTagClick(tag)"
        >
          {{ tag }}
        </a>
      </div>
      <div v-if="recipe.headNote">
        {{ recipe.headNote }}
      </div>
      <div><strong>Serves:</strong> {{ recipe.serves }}</div>
      <div v-if="recipe.time"><strong>Time:</strong> {{ recipe.time }}</div>
      <div><strong>Published:</strong> {{ recipe.publish_date }}</div>
      <div v-if="recipe.description">
        <strong>description:</strong> {{ recipe.description }}
      </div>
      <ul>
        <strong>Ingredients</strong>
        <li
          v-for="(ingredient, index) in recipe.ingredients"
          :key="ingredient + index"
        >
          {{ ingredient }}
        </li>
      </ul>
      <ul v-if="recipe.keyEquipment && recipe.keyEquipment.length > 0">
        <strong>Key Equipment</strong>
        <li v-for="equipment in recipe.keyEquipment" :key="equipment">
          {{ equipment }}
        </li>
      </ul>
      <ol>
        <strong>Instructions</strong>
        <li v-for="instruction in recipe.instructions" :key="instruction">
          {{ instruction }}
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL
  ? process.env.VUE_APP_API_URL
  : 'http://localhost:8000/api';

export default {
  name: 'RecipePage',
  data() {
    return {
      isLoading: false,
      recipe: {},
    };
  },
  methods: {
    handleTagClick: (event, tag) => {
      event.preventDefault();

      this.$router.push(`/recipes?filterByTag=${tag}`);
    },
  },
  async mounted() {
    const recipeId = this.$route.params.recipeId;

    if (!recipeId) {
      this.$router.push('/recipes');
      return;
    }

    try {
      this.isLoading = true;
      const response = await axios.get(`${API_URL}/recipes/${recipeId}`);

      this.recipe = response.data;
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    }
  },
};
</script>

<style lang="scss">
.recipe-page-container {
  width: 50rem;
  display: flex;
  justify-content: center;

  .title {
    font-size: 3rem;
    font-weight: bold;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
  }

  .tag {
    cursor: pointer;
    border: 1px solid blueviolet;
    padding: 0.25rem;
    border-radius: 10px;
    font-size: 14px;
    margin: 0 5px 5px 0;
  }

  .tag:hover {
    background: chocolate;
    color: white;
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

  .image {
    width: 100%;
  }
}
</style>
