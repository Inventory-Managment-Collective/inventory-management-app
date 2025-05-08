import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, push, set } from 'firebase/database';
import { auth, db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  InputLabel,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Create a New Recipe
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Recipe Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <Button
          variant="outlined"
          component="label"
        >
          Upload Image
          <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        </div>

        <Box>
          <Typography variant="h6">Instructions</Typography>
          {instructions.map((step, index) => (
            <TextField
              key={index}
              label={`Step ${index + 1}`}
              value={step}
              onChange={e => handleInstructionChange(index, e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
          ))}
          <Button onClick={addInstruction} startIcon={<AddIcon />} variant="outlined">
            Add Instruction
          </Button>
        </Box>

        <Box>
          <Typography variant="h6">Ingredients</Typography>
          {ingredients.map((ing, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Name"
                value={ing.name}
                onChange={e => handleIngredientChange(index, 'name', e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Quantity"
                type="number"
                value={ing.quantity}
                onChange={e => handleIngredientChange(index, 'quantity', e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Unit"
                value={ing.unit}
                onChange={e => handleIngredientChange(index, 'unit', e.target.value)}
                required
                fullWidth
              />
            </Box>
          ))}
          <Button onClick={addIngredient} startIcon={<AddIcon />} variant="outlined">
            Add Ingredient
          </Button>
        </Box>

        <Button type="submit" variant="contained" color="primary">
          Create Recipe
        </Button>
        <Button component={Link} to="/userRecipes" variant="outlined" color="secondary">
          Back
        </Button>
      </Box>
    </Container>
  );
}
