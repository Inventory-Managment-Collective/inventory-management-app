import { useState } from 'react'

import './App.css'
import { Route, Routes } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <Navbar/>

      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>

        <Route path="/ingredients" element={<Ingredients/>}/>
        <Route path="/ingredients/:ingredeientId" element={<IngredientDetails/>}/>
        <Route path="/createIngredient" element={<CreateIngredient/>}/>
        <Route path="/updateIngredient" element={<UpdateIngredient/>}/>

        <Route path="/recipes" element={<Recipes/>}/>
        <Route path="/recipes/:recipeId" element={<RecipeDetails/>}/>
        <Route path="/createRecipe" element={<CreateRecipe/>}/>
        <Route path="/updateRecipe" element={<UpdateRecipe/>}/>

        <Route path='/*' element={<NotFound />}/>
      </Routes>
    </>
  )
}

export default App
