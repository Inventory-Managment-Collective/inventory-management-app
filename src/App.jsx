import { Route, Routes } from 'react-router-dom'
import { useMediaQuery, useTheme } from '@mui/material';

import Home from './pages/Home';
import About from './pages/About'
import NotFound from './pages/NotFound'
import LogIn from './pages/LogIn';
import Navbar from './components/Navbar'
import Ingredients from './pages/Ingredients';
import CreateIngredient from './pages/CreateIngredient'
import UpdateIngredient from './pages/UpdateIngredient'
import Recipes from './pages/Recipes'
import RecipeDetails from './pages/RecipeDetails'
import CreateRecipe from './pages/CreateRecipe'
import UpdateRecipe from './pages/UpdateRecipe'
import UserRecipes from './pages/UserRecipes';
import UserRecipeDetails from './pages/UserRecipeDetails';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav'

import './App.css'

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>

      <Navbar />

      <Routes>
    
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/logIn" element={<LogIn/>}/>
        <Route path="/profile" element={<Profile/>}/>

        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/createIngredient" element={<CreateIngredient />} />
        <Route path="/updateIngredient/:ingredientId" element={<UpdateIngredient />} />

        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:recipeId" element={<RecipeDetails />} />
        <Route path="/createRecipe" element={<CreateRecipe />} />
        <Route path="/updateRecipe/:recipeId" element={<UpdateRecipe />} />
        <Route path="/userRecipes" element={<UserRecipes />} />
        <Route path="/userRecipes/:recipeId" element={<UserRecipeDetails />} />

        <Route path='/*' element={<NotFound />} />
      </Routes>

      {isMobile && <BottomNav />}
    </>
  )
}

export default App
