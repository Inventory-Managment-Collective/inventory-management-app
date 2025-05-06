import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

export default function RecipeDetails() {
  const { recipeId } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeSnap = await get(ref(db, `recipes/${recipeId}`));
        if (!recipeSnap.exists()) {
          alert('Recipe not found.');
          return;
        }

        const recipeData = recipeSnap.val();
        setRecipe({ id: recipeId, ...recipeData });
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

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
        {recipe.ingredients?.map((ing, index) => (
          <li key={index}>
            {ing.name}: {ing.quantity} {ing.unit}
          </li>
        ))}
      </ul>

      <br />
      <Link to="/recipes">Back</Link>
    </div>
  );
}
