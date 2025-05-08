import React, { useEffect, useState } from 'react';
import { ref, get, remove, set } from 'firebase/database';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';


import {
    Grid,
    Card,
    CardMedia,
    Typography,
    Button,
    Box,
} from '@mui/material';

import IosShareIcon from '@mui/icons-material/IosShare';
import DeleteIcon from '@mui/icons-material/Delete';

export default function UserRecipeListItem({ recipe, handleDelete }) {
    const [user, setUser] = useState(null);
    const [sharedRecipes, setSharedRecipes] = useState([]);

    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchSharedRecipes = async () => {
            try {
                const snapshot = await get(ref(db, 'recipes'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const sharedIds = Object.keys(data);
                    setSharedRecipes(sharedIds);
                } else {
                    setSharedRecipes([]);
                }
            } catch (error) {
                console.error('Error fetching shared recipes:', error);
            }
        };

        fetchSharedRecipes();
    }, []);

    const handleShare = async (recipeId) => {
        try {
            const userRecipeRef = ref(db, `users/${user.uid}/recipes/${recipeId}`);
            const userRecipeSnap = await get(userRecipeRef);

            if (!userRecipeSnap.exists()) {
                toast.error('Recipe not found.');
                return;
            }

            const recipeData = userRecipeSnap.val();

            if (recipeData.source === "global") {
                toast.error("You cannot share or unshare a recipe you didn't create.");
                return;
            }

            const globalRecipeRef = ref(db, `recipes/${recipeId}`);
            const isShared = sharedRecipes.includes(recipeId);

            if (isShared) {
                await remove(globalRecipeRef);
                setSharedRecipes(prev => prev.filter(id => id !== recipeId));
                toast.success('Recipe unshared successfully!');
            } else {
                const recipe = {
                    ...recipeData,
                    comments: {}
                }

                await set(globalRecipeRef, recipe);
                setSharedRecipes(prev => [...prev, recipeId]);
                toast.success('Recipe shared successfully!');
            }

        } catch (error) {
            console.error('Error sharing/unsharing recipe:', error);
            toast.error('Failed to share/unshare recipe.');
        }
    };


    //functionality for the user to share a recipe. functions very similarly to handleSave but the paths for get and 
    //push are swapped around.


    return (
        <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <Card
                sx={{
                    height: 390,
                    width: {
                        xs: 310,
                        sm: 420,
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <CardMedia
                    component="img"
                    height="160"
                    width="100%"
                    image={recipe.imageUrl}
                    alt={recipe.name}
                    sx={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        height: 240,
                        width: '100%',
                    }}
                />

                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>{recipe.name}</Typography>
                    <Typography variant="body2" gutterBottom>
                        {recipe.ingredients?.length || 0} ingredients
                    </Typography>
                </Box>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2 }}>
                    <Button
                        component={Link}
                        to={`/userRecipes/${recipe.id}`}
                        variant="outlined"
                        size="small"
                        sx={{
                            paddingX: 2,
                            paddingY: 1,
                            '&:hover': {
                                backgroundColor: 'primary.main',
                                borderColor: 'primary.main',
                                color: 'white',
                            },
                        }}
                    >
                        View
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={() => handleDelete(recipe.id)}
                            color="error"
                            variant="outlined"
                            size="small"
                            sx={{
                                paddingX: 2,
                                paddingY: 1,
                                '&:hover': {
                                    backgroundColor: 'lightpink',
                                    borderColor: 'lightpink',
                                    color: 'white',
                                },
                            }}
                        >
                            <DeleteIcon sx={{ fontSize: 18, mr: { xs: 0, sm: 1 }, transform: 'translateY(-1px)' }} />
                            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Delete</Box>
                        </Button>
                        {recipe.source === "user" && (
                            <Button
                                variant="contained"
                                color={sharedRecipes.includes(recipe.id) ? "secondary" : "success"}
                                onClick={() => handleShare(recipe.id)}
                                size="small"
                                sx={{
                                    paddingX: sharedRecipes.includes(recipe.id) ? 1.5 : 2.5,
                                    backgroundColor: sharedRecipes.includes(recipe.id) ? 'secondary.dark' : 'secondary.main',
                                    '&:hover': {
                                        backgroundColor: sharedRecipes.includes(recipe.id) ? 'secondary.main' : 'secondary.dark',
                                    },
                                }}
                            >
                                <IosShareIcon sx={{ fontSize: 18, mr: { xs: 0, sm: 1 }, transform: 'translateY(-1px)' }} />
                                {sharedRecipes.includes(recipe.id) ? (
                                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Unshare</Box>
                                ) : (
                                    <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Share</Box>
                                )}
                            </Button>
                        )}

                    </Box>
                </Box>

            </Card>

        </Grid>
    )




}