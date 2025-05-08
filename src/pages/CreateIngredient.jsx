import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  Container,
  TextField,
  MenuItem,
  Button,
  Typography,
  Box,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';

import { toast } from 'react-toastify';
import QuarterMasterToast from '../components/QuarterMasterToast';

export default function CreateIngredient() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !quantity || !unit) {
      toast(<QuarterMasterToast message='Please fill in all fields.'/>)
      return;
    }

    const newIngredient = {
      name,
      quantity: parseFloat(quantity),
      unit,
    };

    try {
      const userIngredientsRef = ref(db, `users/${user.uid}/ingredients`);
      const newRef = push(userIngredientsRef);
      await set(newRef, newIngredient);
      toast(<QuarterMasterToast message={`${newIngredient.name} added`}/>)
      
      navigate('/ingredients');
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast(<QuarterMasterToast message='Failed to add ingredient.'/>)
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Add New Ingredient
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          required
        />
        <FormControl fullWidth required>
          <InputLabel>Unit</InputLabel>
          <Select
            value={unit}
            label="Unit"
            onChange={e => setUnit(e.target.value)}
          >
            <MenuItem value="grams">grams</MenuItem>
            <MenuItem value="ml">ml</MenuItem>
            <MenuItem value="items">items</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary">
          Add Ingredient
        </Button>
        <Button component={Link} to="/ingredients" variant="outlined" color="secondary">
          Back
        </Button>
      </Box>
    </Container>
  );
}

