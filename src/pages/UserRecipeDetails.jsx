import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  Button,
  List,
  ListItem,
  ListItemText,
  Link,
  Divider
} from '@mui/material';
import { toast } from 'react-toastify';
import QuarterMasterToast from '../components/QuarterMasterToast';

export default function UserRecipeDetails() {
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
          toast(<QuarterMasterToast message='Recipe not found.'/>)
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

  const canMakeRecipe = () => {
    return recipe?.ingredients?.every(ing => {
      if (!ing.name || typeof ing.name !== 'string') return false;
      const stock = ingredientStock[ing.name.toLowerCase()]?.quantity || 0;
      return stock >= ing.quantity;
    });
  };

  const handleMakeRecipe = async () => {
    try {
      const updates = {};

      for (const ing of recipe.ingredients) {
        if (!ing.name || typeof ing.name !== 'string') {
          console.warn('Skipping invalid ingredient:', ing);
          continue;
        }

        const key = ing.name.toLowerCase();
        const stockEntry = ingredientStock[key];

        if (!stockEntry || stockEntry.quantity < ing.quantity) {
          toast(<QuarterMasterToast message={`Not enough ${ing.name} in stock.`}/>)
          return;
        }

        const newQty = stockEntry.quantity - ing.quantity;
        updates[`users/${user.uid}/ingredients/${stockEntry.id}/quantity`] = newQty;
      }

      await update(ref(db), updates);
      toast(<QuarterMasterToast message={`${recipe.name} made!`}/>)

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
      toast(<QuarterMasterToast message='Failed to make recipe.'/>)
    }
  };

  if (loading) return <Typography variant="body1">Loading recipe...</Typography>;
  if (!recipe) return <Typography variant="body1">Recipe not found.</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          {recipe.name}
        </Typography>

        {recipe.imageUrl && (
          <CardMedia
            component="img"
            height="300"
            image={recipe.imageUrl}
            alt={recipe.name}
            sx={{ borderRadius: 2, objectFit: 'cover', mb: 2 }}
          />
        )}

        <Typography variant="h6">Category</Typography>
        <Typography variant="body1" gutterBottom>
          {recipe.category}
        </Typography>

        <Typography variant="h6">Description</Typography>
        <Typography variant="body1" gutterBottom>
          {recipe.description}
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Ingredients
        </Typography>
        <List>
          {recipe.ingredients?.map((ing, index) => {
            const stock = ing.name
              ? ingredientStock[ing.name.toLowerCase()]?.quantity || 0
              : 0;
            const sufficient = stock >= ing.quantity;
            return (
              <ListItem key={index} sx={{ color: sufficient ? 'inherit' : 'error.main' }}>
                <ListItemText
                  primary={`${ing.name || 'Unnamed'}: ${stock}/${ing.quantity} ${ing.unit}`}
                  secondary={!sufficient && 'Insufficient'}
                />
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!canMakeRecipe()}
            onClick={handleMakeRecipe}
          >
            Make Recipe
          </Button>
          <Button variant="outlined" component={RouterLink} to={`/updateRecipe/${recipeId}`}>
            Edit Recipe
          </Button>
          <Button variant="outlined" component={RouterLink} to={`/userRecipes/${recipeId}/recipeInstrcutions`}>
            View Instructions
          </Button>
          <Button variant="text" component={RouterLink} to="/userRecipes">
            Back to Recipes
          </Button>
        </Box>
      </Card>
    </Container>
  );
}
