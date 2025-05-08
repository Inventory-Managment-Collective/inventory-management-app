import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Link,
  Paper,
} from '@mui/material';

export default function UpdateIngredient() {
  const { ingredientId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchIngredient = async () => {
      try {
        const snapshot = await get(ref(db, `users/${user.uid}/ingredients/${ingredientId}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setName(data.name || '');
          setQuantity(data.quantity || '');
          setUnit(data.unit || '');
          setCategory(data.category || '');
        } else {
          alert('Ingredient not found');
          navigate('/ingredients');
        }
      } catch (error) {
        console.error('Error fetching ingredient:', error);
        alert('Failed to load ingredient');
        navigate('/ingredients');
      } finally {
        setLoading(false);
      }
    };

    fetchIngredient();
  }, [user, ingredientId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      name,
      quantity: parseFloat(quantity),
      unit,
      category,
    };

    try {
      await update(ref(db, `users/${user.uid}/ingredients/${ingredientId}`), updatedData);
      alert('Ingredient updated!');
      navigate('/ingredients');
    } catch (error) {
      console.error('Error updating ingredient:', error);
      alert('Failed to update ingredient');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading ingredient...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Update Ingredient</Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
          <TextField
            label="Name"
            fullWidth
            required
            margin="normal"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <TextField
            label="Quantity"
            type="number"
            fullWidth
            required
            margin="normal"
            inputProps={{ step: 'any' }}
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />

          <TextField
            label="Unit"
            fullWidth
            required
            margin="normal"
            value={unit}
            onChange={e => setUnit(e.target.value)}
          />

          <TextField
            label="Category"
            fullWidth
            required
            margin="normal"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button type="submit" variant="contained" color="primary">
              Update
            </Button>
            <Link component={RouterLink} to="/ingredients" underline="hover">
              Back
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
