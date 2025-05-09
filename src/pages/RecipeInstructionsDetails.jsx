import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import QuarterMasterToast from '../components/QuarterMasterToast';

import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';

export default function RecipeInstructionDetails() {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [ingredientStock, setIngredientStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchRecipeAndStock = async () => {
      try {
        const recipeSnap = await get(ref(db, `users/${user.uid}/recipes/${recipeId}`));
        if (!recipeSnap.exists()) {
          toast(<QuarterMasterToast message='Recipe not found.' />);
          return;
        }

        const recipeData = recipeSnap.val();
        setRecipe({ id: recipeId, ...recipeData });

        const stockSnap = await get(ref(db, `users/${user.uid}/ingredients`));
        if (stockSnap.exists()) {
          const stockData = stockSnap.val();
          const stockMap = {};
          Object.entries(stockData).forEach(([id, item]) => {
            if (item.name && typeof item.name === 'string') {
              stockMap[item.name.toLowerCase()] = { quantity: item.quantity, id };
            }
          });
          setIngredientStock(stockMap);
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndStock();
  }, [user, recipeId]);

  const canMakeRecipe = () =>
    recipe?.ingredients?.every((ing) => {
      if (!ing.name || typeof ing.name !== 'string') return false;
      const stock = ingredientStock[ing.name.toLowerCase()]?.quantity || 0;
      return stock >= ing.quantity;
    });

  const handleMakeRecipe = async () => {
    try {
      const updates = {};

      for (const ing of recipe.ingredients) {
        if (!ing.name || typeof ing.name !== 'string') continue;

        const key = ing.name.toLowerCase();
        const stockEntry = ingredientStock[key];

        if (!stockEntry || stockEntry.quantity < ing.quantity) {
          toast(<QuarterMasterToast message={`Not enough ${ing.name} in stock.`} />);
          return;
        }

        toast(<QuarterMasterToast message={`${ing.quantity} ${ing.name} removed`} />);
        const newQty = stockEntry.quantity - ing.quantity;
        updates[`users/${user.uid}/ingredients/${stockEntry.id}/quantity`] = newQty;
      }

      await update(ref(db), updates);
      toast(<QuarterMasterToast message={`${recipe.name} made!`} />);

      // Refresh local stock
      const updatedSnap = await get(ref(db, `users/${user.uid}/ingredients`));
      if (updatedSnap.exists()) {
        const updatedData = updatedSnap.val();
        const stockMap = {};
        Object.entries(updatedData).forEach(([id, item]) => {
          if (item.name && typeof item.name === 'string') {
            stockMap[item.name.toLowerCase()] = { quantity: item.quantity, id };
          }
        });
        setIngredientStock(stockMap);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to make recipe.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 6, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading recipe...
        </Typography>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container sx={{ mt: 6 }}>
        <Typography variant="h5">Recipe not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 10, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          {recipe.name}
        </Typography>
  
        <Typography variant="h6" sx={{ mt: 4 }}>
          Instructions
        </Typography>
        <List sx={{ listStyleType: 'decimal', pl: 3 }}>
          {recipe.instructions?.map((step, index) => (
            <ListItem key={index} sx={{ display: 'list-item' }}>
              <ListItemText primary={step} />
            </ListItem>
          ))}
        </List>
  
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleMakeRecipe}
            disabled={!canMakeRecipe()}
          >
            Make Recipe
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to={`/userRecipes/${recipe.id}`}
          >
            Back to Recipe
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
