<template>
  <div class="recipe-page-container">
    <router-link to="/recipes">⬅ BACK</router-link>
    <div class="title">{{ recipe.title }}</div>
    <img :src="recipe.imageUrl" class="image" />
    <!-- <div class="tags-list">
      <button
        v-for="tag in recipe.tags"
        :key="tag"
        class="tag"
        @click="handleTagClick(tag)"
      >
        {{ tag }}
      </button>
    </div> -->
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
      <li v-for="ingredient in recipe.ingredients" :key="ingredient">
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
      recipe: {},
    };
  },
  async mounted() {
    const recipeId = this.$route.params.recipeId;

    if (!recipeId) {
      this.$router.push('/recipes');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/recipes/${recipeId}`);

      this.recipe = response.data;
    } catch (error) {
      console.error(error);
    }
  },
};
</script>

<style lang="scss">
.recipe-page-container {
  width: 50rem;

  .title {
    font-size: 1rem;
    font-weight: bold;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
  }

  .image {
    width: 100%;
  }
}
</style>
