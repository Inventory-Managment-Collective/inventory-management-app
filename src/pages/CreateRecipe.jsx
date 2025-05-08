import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, push, set } from 'firebase/database';
import { auth, db } from '../firebase';
import { getAuth, onAuthStateChanged  } from 'firebase/auth';

export default function CreateRecipe() {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [instructions, setInstructions] = useState(['']);
  const [description, setDescription] = useState(['']);
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const auth = getAuth();
  //functions very similarly to createIngredeint but with cloudinary to allow the user to upload a picture
  //of their recipe from their machine, as opposed to providing the URL

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
  //Function to upload an image file to cloudinary. takes in file as a parameter which will be the image selected by
  //the user. constructs a formData object with the file, the upload preset we denoted and the name of the cloud
  //to send the image to. Then uses fetch to send a post request to our cloud with the formData object we constructed
  //res.json() will then read the body of the HTTP response and transltes it to JSON. From this json we then extract and
  //return the url to the image which can then be used as the 'src' for rendering purposes

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
      description,
      category,
      ingredients: validIngredients.map(ing => ({
        name: ing.name,
        quantity: parseFloat(ing.quantity),
        unit: ing.unit,
      })),
      source: "user" 
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
  //Function which handle submission of the form to create a new recipe. Starts by validating the fact
  //that the form is filled where necessary. Then it it will then initialise imageUrl as just an empty space 
  //and, if an image was provided by the user, call uploadImageToCloudinary with the imageFile to upload and 
  // return the url to the image. the function will then filter the ingredeints to retrieve only the valid ones, ones with a non-empty
  // string name and unit a valid number for quantity. It will then construct a newRecipe object with valid name, instructions, ingredients and 
  // the imageUrl derived earlier. This recipe is then saved to firebase via push and set. 

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };
  //function to 

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
          <label>Description:</label><br />
          <input value={description} onChange={e => setDescription(e.target.value)} required />
        </div>

        <div>
        <label>Category:</label><br />
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select category</option>
            <option value="Baking">Baking</option>
            <option value="Pasta">Pasta</option>
            <option value="Vegetarian">Vegetarian</option>
          </select>
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
