import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';

export default function CreateIngredient() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !quantity || !unit || !category) {
      alert('Please fill in all fields.');
      return;
    }

    const newIngredient = {
      name,
      quantity: parseFloat(quantity),
      unit,
      category,
    };

    try {
      const ingredientsRef = ref(db, 'ingredients');
      const newRef = push(ingredientsRef);
      await set(newRef, newIngredient);
      alert('Ingredient added!');
      navigate('/ingredients');
    } catch (error) {
      console.error('Error adding ingredient:', error);
      alert('Failed to add ingredient.');
    }
  };

  return (
    <div>
      <h2>Add New Ingredient</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label><br />
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label>Quantity:</label><br />
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
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
        <button type="submit">Add Ingredient</button>
      </form>
    </div>
  );
}
