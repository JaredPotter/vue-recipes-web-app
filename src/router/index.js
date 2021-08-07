import Vue from 'vue';
import VueRouter from 'vue-router';
import RecipesPage from '../components/RecipesPage.vue';
import RecipePage from '../components/RecipePage.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/recipes',
  },
  {
    path: '/recipes',
    name: 'Recipes',
    component: RecipesPage,
  },
  {
    path: '/recipes/:recipeId',
    name: 'Recipe',
    component: RecipePage,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
