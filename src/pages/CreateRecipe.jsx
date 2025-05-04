import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';

export default function CreateRecipe() {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [instructions, setInstructions] = useState(['']);
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !imageUrl || instructions.length === 0 || ingredients.length === 0) {
      alert('Please fill in all fields.');
      return;
    }

    const validIngredients = ingredients.filter(
      ing => ing.name && ing.quantity && ing.unit
    );

    const validInstructions = instructions.filter(step => step.trim() !== '');

    const newRecipe = {
      name,
      imageUrl,
      instructions: validInstructions,
      ingredients: validIngredients.map(ing => ({
        name: ing.name,
        quantity: parseFloat(ing.quantity),
        unit: ing.unit,
      })),
    };

    try {
      const recipesRef = ref(db, 'recipes');
      const newRef = push(recipesRef);
      await set(newRef, newRecipe);
      alert('Recipe created!');
      navigate('/recipes');
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe.');
    }
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const addInstruction = () => setInstructions([...instructions, '']);

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  return (
    <div>
      <h2>Create a New Recipe</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Recipe Name:</label><br />
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div>
          <label>Image URL:</label><br />
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
        </div>

        <div>
          <h4>Instructions</h4>
          {instructions.map((step, index) => (
            <div key={index}>
              <label>Step {index + 1}:</label><br />
              <input
                type="text"
                value={step}
                onChange={e => handleInstructionChange(index, e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addInstruction}>+ Add Instruction</button>
        </div>

        <div>
          <h4>Ingredients</h4>
          {ingredients.map((ing, index) => (
            <div key={index}>
              <input
                placeholder="Name"
                value={ing.name}
                onChange={e => handleIngredientChange(index, 'name', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={ing.quantity}
                onChange={e => handleIngredientChange(index, 'quantity', e.target.value)}
                required
              />
              <input
                placeholder="Unit"
                value={ing.unit}
                onChange={e => handleIngredientChange(index, 'unit', e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addIngredient}>+ Add Ingredient</button>
        </div>

        <br />
        <button type="submit">Create Recipe</button>
      </form>
    </div>
  );
}
