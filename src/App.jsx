import React from 'react';
import { Route, Routes } from 'react-router-dom'
import { useMediaQuery, useTheme, ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import Home from './pages/Home';
import About from './pages/About'
import NotFound from './pages/NotFound'
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
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
import EditProfile from './pages/EditProfile';
import BottomNav from './components/BottomNav';
import RecipeInstructionDetails from './pages/RecipeInstructionsDetails';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuarterMasterToast from './components/QuarterMasterToast';

import './App.css'

function App() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  const customTheme = createTheme({
    palette: {
      primary: {
        main: '#abd0f5',
      },
      secondary: {
        main: '#ff4081',
      },
      background: {
        default: '#f4f4f4',
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h1: { fontSize: '2.5rem' },
      button: { textTransform: 'none' },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />

      <Navbar />



      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        hideProgressBar
        closeOnClick 
        pauseOnHover 
        draggable 
        pauseOnFocusLoss 
        toastClassName="custom-toast-container"
        bodyClassName="custom-toast-body"
       />

      <Routes>
    
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/logIn" element={<LogIn/>}/>
        <Route path="/signUp" element={<SignUp/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/editProfile" element={<EditProfile/>}/>

        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/createIngredient" element={<CreateIngredient />} />
        <Route path="/updateIngredient/:ingredientId" element={<UpdateIngredient />} />

        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:recipeId" element={<RecipeDetails />} />
        <Route path="/createRecipe" element={<CreateRecipe />} />
        <Route path="/updateRecipe/:recipeId" element={<UpdateRecipe />} />
        <Route path="/userRecipes" element={<UserRecipes />} />
        <Route path="/userRecipes/:recipeId" element={<UserRecipeDetails />} />
        <Route path="/userRecipes/:recipeId/recipeInstrcutions" element={<RecipeInstructionDetails/>}/>

        <Route path='/*' element={<NotFound />} />
      </Routes>

      {isMobileOrTablet && <BottomNav />}
    </ThemeProvider>
  )
}

export default App
