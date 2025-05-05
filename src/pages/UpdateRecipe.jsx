import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged  } from 'firebase/auth';

export default function UpdateRecipe() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [instructions, setInstructions] = useState(['']);
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);

    const auth = getAuth();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchRecipe = async () => {
      try {
        const snapshot = await get(ref(db, `users/${user.uid}/recipes/${recipeId}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setName(data.name || '');
          setImageUrl(data.imageUrl || '');
          setInstructions(data.instructions || ['']);
          setIngredients(data.ingredients || [{ name: '', quantity: '', unit: '' }]);
        } else {
          alert('Recipe not found.');
          navigate('/userRecipes');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        alert('Failed to load recipe.');
        navigate(`/userRecipes/${recipeId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId, navigate, user]);

  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedRecipe = {
      name,
      imageUrl,
      instructions: instructions.filter(step => step.trim() !== ''),
      ingredients: ingredients
        .filter(ing => ing.name && ing.quantity && ing.unit)
        .map(ing => ({
          name: ing.name,
          quantity: parseFloat(ing.quantity),
          unit: ing.unit,
        })),
    };

    try {
      await update(ref(db, `users/${user.uid}/recipes/${recipeId}`), updatedRecipe);
      alert('Recipe updated!');
      navigate(`/userRecipes/${recipeId}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Failed to update recipe.');
    }
  };

  if (loading) return <p>Loading recipe...</p>;

  return (
    <div>
      <h2>Update Recipe</h2>
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
        <button type="submit">Update Recipe</button>
      </form>
    </div>
  );
}
