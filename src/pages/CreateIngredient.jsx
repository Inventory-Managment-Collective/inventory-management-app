import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function CreateIngredient() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  //State intitialization for all the necessary inputs for a new ingredient aswell as user to hold 
  //the current user.

  const auth = getAuth();


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
      const userIngredientsRef = ref(db, `users/${user.uid}/ingredients`);
      const newRef = push(userIngredientsRef);
      await set(newRef, newIngredient);
      alert('Ingredient added!');
      navigate('/ingredients');
    } catch (error) {
      console.error('Error adding ingredient:', error);
      alert('Failed to add ingredient.');
    }
  };
  //functionality to add the new ingredeint to the users ingredients list once the form is submitted.
  //checks all the fields are filled in, if so, constructs a new ingredient with the info provided in the form,
  //converting quantity to a number along the way. it then constructs and stores the path to the users ingredients
  //and uses this to to generate a new key with pus. set is then called to write the new ingredient data to the path with the newly 
  //generated key.

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
          <select value={unit} onChange={(e) => setUnit(e.target.value)} required>
            <option value="">Select unit</option>
            <option value="grams">grams</option>
            <option value="ml">ml</option>
            <option value="items">items</option>
          </select>
        </div>
        <div>
          <label>Category:</label><br />
          <input value={category} onChange={e => setCategory(e.target.value)} required />
        </div>
        <br />
        <button type="submit">Add Ingredient</button>
      </form>
      <br />
      <Link to="/ingredients">Back</Link>
    </div>
  );
}
