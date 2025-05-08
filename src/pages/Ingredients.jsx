import React, { useEffect, useState } from 'react';
import { ref, get, remove, set } from 'firebase/database';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchIngredients = async () => {
      try {
        const snapshot = await get(ref(db, `users/${user.uid}/ingredients`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const items = Object.entries(data).map(([id, value]) => ({ id, ...value }));
          setIngredients(items);
        } else {
          setIngredients([]);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, [user]);

  const handleDelete = async (id) => {
    if (!user) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this ingredient?');
    if (!confirmDelete) return;

    try {
      await remove(ref(db, `users/${user.uid}/ingredients/${id}`));
      setIngredients((prev) => prev.filter((item) => item.id !== id));
      toast.success("Deleted Ingredient")
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast.error('Failed to delete ingredient.');
    }
  };

  const handleAddStock = async (id, amountToAdd) => {
    if (!user) return;

    try {
      const ingredientRef = ref(db, `users/${user.uid}/ingredients/${id}`);
      const snapshot = await get(ingredientRef);
      if (snapshot.exists()) {
        const current = snapshot.val();
        const updatedQuantity = parseFloat(current.quantity) + amountToAdd;
        await set(ingredientRef, { ...current, quantity: updatedQuantity });
        setIngredients((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity: updatedQuantity } : item))
        );
        toast.success(`added ${amountToAdd} ${current.name}`);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update quantity.');
    }
  };

  if (loading) return <Typography>Loading ingredients...</Typography>;

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Ingredients
      </Typography>

      {user ? (
        <>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Search Ingredients"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>

          <Button
            variant="contained"
            component={Link}
            to="/createIngredient"
            startIcon={<AddIcon />}
            sx={{ mb: 3 }}
          >
            Add Ingredient
          </Button>

          {ingredients.length === 0 ? (
            <Typography>No ingredients found.</Typography>
          ) : (
            <List>
              {ingredients
                .filter((ingredient) =>
                  ingredient?.name.toLowerCase().startsWith(searchTerm.toLowerCase())
                )
                .map((ingredient) => (
                  <ListItem key={ingredient.id} divider alignItems="flex-start">
                    <ListItemText
                      primary={`${ingredient.name} — ${ingredient.quantity} ${ingredient.unit}`}
                      secondary={
                        <Stack direction="row" spacing={1} mt={1}>
                          {ingredient.unit === 'grams' && (
                            <>
                              <Button size="small" onClick={() => handleAddStock(ingredient.id, 100)}>+100g</Button>
                              <Button size="small" onClick={() => handleAddStock(ingredient.id, 500)}>+500g</Button>
                            </>
                          )}
                          {ingredient.unit === 'ml' && (
                            <>
                              <Button size="small" onClick={() => handleAddStock(ingredient.id, 100)}>+100ml</Button>
                              <Button size="small" onClick={() => handleAddStock(ingredient.id, 250)}>+250ml</Button>
                            </>
                          )}
                          {ingredient.unit === 'items' && (
                            <>
                              <Button size="small" onClick={() => handleAddStock(ingredient.id, 1)}>+1</Button>
                              <Button size="small" onClick={() => handleAddStock(ingredient.id, 6)}>+6</Button>
                            </>
                          )}
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        component={Link}
                        to={`/updateIngredient/${ingredient.id}`}
                        edge="end"
                        aria-label="edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(ingredient.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </List>
          )}
        </>
      ) : (
        <Box>
          <Typography>You must be logged in to view your ingredients.</Typography>
          <Button component={Link} to="/logIn" sx={{ mr: 2 }}>
            Log In
          </Button>
          <Button component={Link} to="/signUp" variant="outlined">
            Sign Up
          </Button>
        </Box>
      )}
    </Container>
  );
}
