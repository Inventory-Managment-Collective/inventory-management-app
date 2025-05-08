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

export default function IngredientListItem() {

    return (
        <ListItem key={ingredient.id} divider alignItems="flex-start">
                    <ListItemText
                      primary={`${ingredient.name} — ${ingredient.quantity} ${ingredient.unit}`}
                      secondary={
                        <Typography component="span" variant="body2" color="text.secondary">
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
                        </Typography>
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
    )
}