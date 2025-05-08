import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Divider,
} from '@mui/material';

import { toast } from 'react-toastify';
import QuarterMasterToast from '../components/QuarterMasterToast';

export default function UpdateRecipe() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [instructions, setInstructions] = useState(['']);
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);

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

    const fetchRecipe = async () => {
      try {
        const snapshot = await get(ref(db, `users/${user.uid}/recipes/${recipeId}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setName(data.name || '');
          setImageUrl(data.imageUrl || '');
          setInstructions(data.instructions || ['']);
          setIngredients(data.ingredients || [{ name: '', quantity: '', unit: '' }]);
        } else {
          toast(<QuarterMasterToast message='Recipe not found.'/>)
          navigate('/userRecipes');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        toast(<QuarterMasterToast message='Failed to load recipe.'/>)
        navigate(`/userRecipes/${recipeId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId, navigate, user]);

  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedRecipe = {
      name,
      imageUrl,
      instructions: instructions.filter(step => step.trim() !== ''),
      ingredients: ingredients
        .filter(ing => ing.name && ing.quantity && ing.unit)
        .map(ing => ({
          name: ing.name,
          quantity: parseFloat(ing.quantity),
          unit: ing.unit,
        })),
    };

    try {
      await update(ref(db, `users/${user.uid}/recipes/${recipeId}`), updatedRecipe);
      toast(<QuarterMasterToast message={`${updatedRecipe.name} updated!`}/>)
      navigate(`/userRecipes/${recipeId}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast(<QuarterMasterToast message='Failed to update recipe.'/>)
    }
  };

  if (loading) return <Typography>Loading recipe...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Update Recipe
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <TextField
              fullWidth
              label="Recipe Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </Box>
          <Box mb={3}>
            <TextField
              fullWidth
              label="Image URL"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              required
            />
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Instructions</Typography>
          {instructions.map((step, index) => (
            <Box key={index} mb={2}>
              <TextField
                fullWidth
                label={`Step ${index + 1}`}
                value={step}
                onChange={e => handleInstructionChange(index, e.target.value)}
                required
              />
            </Box>
          ))}
          <Button variant="outlined" onClick={addInstruction} sx={{ mb: 3 }}>
            + Add Instruction
          </Button>

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Ingredients</Typography>
          {ingredients.map((ing, index) => (
            <Box key={index} display="flex" gap={2} mb={2}>
              <TextField
                label="Name"
                value={ing.name}
                onChange={e => handleIngredientChange(index, 'name', e.target.value)}
                required
                sx={{ flex: 2 }}
              />
              <TextField
                type="number"
                label="Quantity"
                value={ing.quantity}
                onChange={e => handleIngredientChange(index, 'quantity', e.target.value)}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="Unit"
                value={ing.unit}
                onChange={e => handleIngredientChange(index, 'unit', e.target.value)}
                required
                sx={{ flex: 1 }}
              />
            </Box>
          ))}
          <Button variant="outlined" onClick={addIngredient} sx={{ mb: 3 }}>
            + Add Ingredient
          </Button>

          <Box mt={4} display="flex" gap={2}>
            <Button variant="contained" type="submit">
              Update Recipe
            </Button>
            <Button variant="text" component={Link} to={`/userRecipes/${recipeId}`}>
              Back
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
