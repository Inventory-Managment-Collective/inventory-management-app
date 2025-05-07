import React, { useEffect, useState } from 'react';
import { ref, get, remove, set } from 'firebase/database';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false); // Stop loading once authentication state is determined
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchIngredients = async () => {
      try {
        const snapshot = await get(ref(db, `users/${user.uid}/ingredients`));

        if (snapshot.exists()) {
          const data = snapshot.val();
          const items = Object.entries(data).map(([id, value]) => ({
            id,
            ...value,
          }));
          setIngredients(items);
        } else {
          setIngredients([]);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [user]);

  const handleDelete = async (id) => {
    if (!user) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this ingredient?');
    if (!confirmDelete) return;

    try {
      await remove(ref(db, `users/${user.uid}/ingredients/${id}`));
      setIngredients(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Failed to delete ingredient.');
    }
  };

  const handleAddStock = async (id, amountToAdd) => {
    if (!user) return;

    try {
      const ingredientRef = ref(db, `users/${user.uid}/ingredients/${id}`);
      const snapshot = await get(ingredientRef);
      if (snapshot.exists()) {
        const current = snapshot.val();
        const updatedQuantity = parseFloat(current.quantity) + amountToAdd;
        await set(ingredientRef, { ...current, quantity: updatedQuantity });
        setIngredients(prev =>
          prev.map(item => item.id === id ? { ...item, quantity: updatedQuantity } : item)
        );
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update quantity.');
    }
  };

  if (loading) return <p>Loading ingredients...</p>;

  return (
    <div>
      <h2>Ingredients List</h2>

      {user ? (
        <>
          <div>
            <label htmlFor="search">Search Ingredients: </label>
            <input
              id="search"
              type="text"
              placeholder="Enter name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/createIngredient">Add an Ingredient</Link>

          {ingredients.length === 0 ? (
            <p>No ingredients found.</p>
          ) : (
            <ul>
              {ingredients
                .filter(ingredient =>
                  ingredient.name.toLowerCase().startsWith(searchTerm.toLowerCase())
                )
                .map(ingredient => (
                  <li key={ingredient.id}>
                    <strong>{ingredient.name}</strong> — {ingredient.quantity} {ingredient.unit}
                    <br />
                    <Link to={`/updateIngredient/${ingredient.id}`}>Edit</Link>
                    {' '}
                    {ingredient.unit === 'grams' && (
                      <>
                        <button onClick={() => handleAddStock(ingredient.id, 100)}>+100g</button>
                        <button onClick={() => handleAddStock(ingredient.id, 500)}>+500g</button>
                      </>
                    )}
                    {ingredient.unit === 'ml' && (
                      <>
                        <button onClick={() => handleAddStock(ingredient.id, 100)}>+100ml</button>
                        <button onClick={() => handleAddStock(ingredient.id, 250)}>+250ml</button>
                      </>
                    )}
                    {ingredient.unit === 'items' && (
                      <>
                        <button onClick={() => handleAddStock(ingredient.id, 1)}>+1</button>
                        <button onClick={() => handleAddStock(ingredient.id, 6)}>+6</button>
                      </>
                    )}
                    <button onClick={() => handleDelete(ingredient.id)}>Delete</button>
                  </li>
                ))}
            </ul>
          )}
        </>
      ) : (
        <div>
          <p>You must be logged in to view your ingredients.</p>
          <Link to="/logIn">Log In</Link>
          <br />
          <Link to="/signUp">Sign Up</Link>
        </div>
      )}
    </div>
  );
}
