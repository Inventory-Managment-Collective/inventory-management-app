import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function UpdateIngredient() {
  const { ingredientId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [user, setUser] = useState(null);

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

    const fetchIngredient = async () => {
      try {
        const snapshot = await get(ref(db, `users/${user.uid}/ingredients/${ingredientId}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setName(data.name || '');
          setQuantity(data.quantity || '');
          setUnit(data.unit || '');
          setCategory(data.category || '');
        } else {
          alert('Ingredient not found');
          navigate('/ingredients');
        }
      } catch (error) {
        console.error('Error fetching ingredient:', error);
        alert('Failed to load ingredient');
        navigate('/ingredients');
      } finally {
        setLoading(false);
      }
    };

    fetchIngredient();
  }, [user, ingredientId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      name,
      quantity: parseFloat(quantity),
      unit,
      category
    };

    try {
      await update(ref(db, `users/${user.uid}/ingredients/${ingredientId}`), updatedData);
      alert('Ingredient updated!');
      navigate('/ingredients');
    } catch (error) {
      console.error('Error updating ingredient:', error);
      alert('Failed to update ingredient');
    }
  };

  if (loading) return <p>Loading ingredient...</p>;

  return (
    <div>
      <h2>Update Ingredient</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label><br />
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div>
          <label>Quantity:</label><br />
          <input
            type="number"
            step="any"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Unit:</label><br />
          <input value={unit} onChange={e => setUnit(e.target.value)} required />
        </div>

        <div>
          <label>Category:</label><br />
          <input value={category} onChange={e => setCategory(e.target.value)} required />
        </div>

        <br />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
