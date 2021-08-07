<template>
  <div class="recipe-card-container" @click="handleRecipeCardClick(recipe.id)">
    <div class="title">{{ recipe.title }}</div>
    <img :src="recipe.imageUrl" class="image" />
    <div class="tags-list">
      <button
        v-for="tag in recipe.tags"
        :key="tag"
        class="tag"
        @click.self.stop="handleTagClick(tag)"
      >
        {{ tag }}
      </button>
    </div>
    <div v-if="recipe.description">
      {{ recipe.description.substring(0, 100) + '...' }}
    </div>
    <div><strong>Serves:</strong> {{ recipe.serves }}</div>
    <div><strong>Time:</strong> {{ recipe.time }}</div>
    <div><strong>Published:</strong> {{ recipe.publish_date }}</div>
  </div>
</template>

<script>
export default {
  name: 'RecipeCard',
  methods: {
    handleTagClick($event) {
      this.$emit('setTag', $event);
    },
    handleRecipeCardClick() {
      this.$router.push(`/recipes/${this.recipe.id}`);
    },
  },
  props: {
    recipe: {},
  },
};
</script>

<style lang="scss">
.recipe-card-container {
  width: 15rem;
  height: 35rem;
  padding: 0.5rem;
  border: 1px solid black;
  box-shadow: 1px 1px black;
  margin-bottom: 2rem;
  cursor: pointer;

  .title {
    font-size: 1rem;
    font-weight: bold;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
  }

  .image {
    width: 15rem;
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
}

.recipe-card-container:hover {
  background: ghostwhite;
}
</style>
