import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';

export default function UpdateIngredient() {
  const { ingredientId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        const snapshot = await get(ref(db, `ingredients/${ingredientId}`));
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
  }, [ingredientId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      name,
      quantity: parseFloat(quantity),
      unit,
      category
    };

    try {
      await update(ref(db, `ingredients/${ingredientId}`), updatedData);
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
