import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';

export default function RecipeDetails() {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeSnap = await get(ref(db, `recipes/${recipeId}`));
        if (!recipeSnap.exists()) {
          alert('Recipe not found.');
          return;
        }

        const recipeData = recipeSnap.val();
        setRecipe({ id: recipeId, ...recipeData });
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  if (loading) return <Typography>Loading recipe...</Typography>;
  if (!recipe) return <Typography>Recipe not found.</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        {recipe.name}
      </Typography>

      {recipe.imageUrl && (
        <Box
          component="img"
          src={recipe.imageUrl}
          alt={recipe.name}
          sx={{
            width: '100%',
            maxWidth: 500,
            borderRadius: 2,
            mb: 3,
          }}
        />
      )}

      <Typography variant="h5" gutterBottom>
        Instructions
      </Typography>
      <List>
        {recipe.instructions?.map((step, index) => (
          <ListItem key={index} disablePadding sx={{ pl: 2 }}>
            <ListItemText primary={`${index + 1}. ${step}`} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        Ingredients
      </Typography>
      <List>
        {recipe.ingredients?.map((ing, index) => (
          <ListItem key={index} disablePadding sx={{ pl: 2 }}>
            <ListItemText
              primary={`${ing.name}: ${ing.quantity} ${ing.unit}`}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" component={Link} to="/recipes">
          Back
        </Button>
      </Box>
    </Container>
  );
}