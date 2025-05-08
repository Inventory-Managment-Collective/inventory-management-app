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
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import QuarterMasterToast from '../components/QuarterMasterToast';
import IngredientListItem from '../components/IngredientListItem';

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

  const handleAddStock = async (id, amountToAdd) => {
    if (!user) return;

    try {
      const ingredientRef = ref(db, `users/${user.uid}/ingredients/${id}`);
      const snapshot = await get(ingredientRef);

      if (snapshot.exists()) {
        const current = snapshot.val();
        const updatedQuantity = parseFloat(current.quantity) + amountToAdd;

        await set(ingredientRef, { ...current, quantity: updatedQuantity });

        // Update local state
        setIngredients((prev) =>
          prev.map((item) => item.id === id ? { ...item, quantity: updatedQuantity } : item)
        );

        toast(<QuarterMasterToast message={`Added ${amountToAdd} ${current.unit} to ${current.name}`} />);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast(<QuarterMasterToast message='Failed to update quantity.' />);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this ingredient?');
    if (!confirmDelete) return;

    try {
      await remove(ref(db, `users/${user.uid}/ingredients/${id}`));

      setIngredients((prev) => prev.filter((item) => item.id !== id));

      toast(<QuarterMasterToast message="Deleted Ingredient" />);
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast(<QuarterMasterToast message="Failed to delete ingredient" />);
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
                  <IngredientListItem
                    key={ingredient.id}
                    ingredient={ingredient}
                    handleAddStock={handleAddStock}
                    handleDelete={handleDelete}
                  />
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
