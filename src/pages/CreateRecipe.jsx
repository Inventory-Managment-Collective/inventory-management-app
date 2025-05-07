import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, push, set } from 'firebase/database';
import { auth, db } from '../firebase';
import { getAuth, onAuthStateChanged  } from 'firebase/auth';

export default function CreateRecipe() {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [instructions, setInstructions] = useState(['']);
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const auth = getAuth();
  //functions very similarly to createIngredeint but with cloudinary to allow t

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_UNSIGNED_UPLOAD_PRESET);
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_NAME);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || instructions.length === 0 || ingredients.length === 0) {
      alert('Please fill in all fields.');
      return;
    }

    let imageUrl = '';

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

    const validIngredients = ingredients.filter(
      ing => typeof ing.name === 'string' &&
             ing.name.trim() !== '' &&
             !isNaN(parseFloat(ing.quantity)) &&
             typeof ing.unit === 'string' &&
             ing.unit.trim() !== ''
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
      const recipesRef = ref(db, `users/${user.uid}/recipes`);
      const newRef = push(recipesRef);
      await set(newRef, newRecipe);
      alert('Recipe created!');
      navigate('/userRecipes');
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
          <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
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
      <br/>
      <Link to="/userRecipes">Back</Link>
    </div>
  );
}
