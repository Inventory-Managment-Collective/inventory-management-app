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
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

export default function CreateRecipe() {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [instructions, setInstructions] = useState(['']);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_UNSIGNED_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Cloudinary upload failed:', data);
      throw new Error(data.error?.message || 'Upload failed');
    }
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
      toast.error('Please fill in all fields.');
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
      source: "user",
      comments: {}
    };

    try {
      const recipesRef = ref(db, `users/${user.uid}/recipes`);
      const newRef = push(recipesRef);
      await set(newRef, newRecipe);
      toast.success('Recipe created!');
      navigate('/userRecipes');
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast.error('Failed to create recipe.');
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

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          required
        />

        <FormControl fullWidth required>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value=""><em>Select category</em></MenuItem>
            <MenuItem value="Baking">Baking</MenuItem>
            <MenuItem value="Pasta">Pasta</MenuItem>
            <MenuItem value="Vegetarian">Vegetarian</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" component="label">
          Upload Image
          <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        </Button>

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
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={ing.unit}
                  label="Unit"
                  onChange={e => handleIngredientChange(index, 'unit', e.target.value)}
                >
                  <MenuItem value="grams">grams</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                  <MenuItem value="items">items</MenuItem>
                </Select>
              </FormControl>
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
