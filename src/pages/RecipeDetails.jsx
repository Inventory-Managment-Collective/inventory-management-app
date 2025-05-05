import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';

export default function RecipeDetails() {
  const { recipeId } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [ingredientStock, setIngredientStock] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipeAndStock = async () => {
      try {
        const recipeSnap = await get(ref(db, `recipes/${recipeId}`));
        if (!recipeSnap.exists()) {
          alert('Recipe not found.');
          return;
        }

        const recipeData = recipeSnap.val();
        setRecipe({ id: recipeId, ...recipeData });

        const stockSnap = await get(ref(db, 'ingredients'));
        if (stockSnap.exists()) {
          const stockData = stockSnap.val();
          const stockMap = {};
          Object.entries(stockData).forEach(([_, item]) => {
            stockMap[item.name.toLowerCase()] = { quantity: item.quantity, id: _ };
          });
          setIngredientStock(stockMap);
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndStock();
  }, [recipeId]);

  const canMakeRecipe = () => {
    return recipe?.ingredients?.every(ing => {
      const stock = ingredientStock[ing.name.toLowerCase()]?.quantity || 0;
      return stock >= ing.quantity;
    });
  };

  const handleMakeRecipe = async () => {
    try {
      const updates = {};

      for (const ing of recipe.ingredients) {
        const key = ing.name.toLowerCase();
        const stockEntry = ingredientStock[key];

        if (!stockEntry || stockEntry.quantity < ing.quantity) {
          alert(`Not enough ${ing.name} in stock.`);
          return;
        }

        const newQty = stockEntry.quantity - ing.quantity;
        updates[`ingredients/${stockEntry.id}/quantity`] = newQty;
      }

      await update(ref(db), updates);
      alert('Recipe made! Inventory updated.');

      const updatedSnap = await get(ref(db, 'ingredients'));
      if (updatedSnap.exists()) {
        const updatedData = updatedSnap.val();
        const stockMap = {};
        Object.entries(updatedData).forEach(([id, item]) => {
          stockMap[item.name.toLowerCase()] = { quantity: item.quantity, id };
        });
        setIngredientStock(stockMap);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to make recipe.');
    }
  };

  if (loading) return <p>Loading recipe...</p>;
  if (!recipe) return <p>Recipe not found.</p>;

  return (
    <div>
      <h2>{recipe.name}</h2>
      <img
        src={recipe.imageUrl}
        alt={recipe.name}
        style={{ width: '300px', borderRadius: '8px' }}
      />

      <h3>Instructions</h3>
      <ol>
        {recipe.instructions?.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>

      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients?.map((ing, index) => {
          const stock = ingredientStock[ing.name.toLowerCase()]?.quantity || 0;
          const sufficient = stock >= ing.quantity;
          return (
            <li key={index} style={{ color: sufficient ? 'white' : 'red' }}>
              {ing.name}: {stock}/{ing.quantity} {ing.unit}{' '}
              {!sufficient && '(Insufficient)'}
            </li>
          );
        })}
      </ul>
      <Link to={`/updateRecipe/${recipeId}`}>Edit Recipe</Link>

      <br />
      <button
        onClick={handleMakeRecipe}
        disabled={!canMakeRecipe()}
        style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}
      >
        Make Recipe
      </button>
    </div>
  );
}
