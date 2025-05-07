import React, { useEffect, useState } from 'react';
import { ref, get, remove, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import {
    Container,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Button,
    CircularProgress,
    Box,
} from '@mui/material';

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [userRecipes, setUserRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const snapshot = await get(ref(db, 'recipes'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const items = Object.entries(data).map(([id, value]) => ({
                        id,
                        ...value,
                    }));
                    setRecipes(items);
                } else {
                    setRecipes([]);
                }
            } catch (error) {
                console.error('Error fetching recipes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchUserRecipes = async () => {
            try {
                const snapshot = await get(ref(db, `users/${user.uid}/recipes`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const savedIds = Object.values(data).map(recipe => recipe.name?.toLowerCase());
                    setUserRecipes(savedIds);
                } else {
                    setUserRecipes([]);
                }
            } catch (error) {
                console.error('Error fetching user saved recipes:', error);
            }
        };

        fetchUserRecipes();
    }, [user]);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this recipe?');
        if (!confirmDelete) return;

        try {
            await remove(ref(db, `recipes/${id}`));
            setRecipes(prev => prev.filter(recipe => recipe.id !== id));
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('Failed to delete recipe.');
        }
    };

    const handleSave = async (recipeId) => {
        const confirmSave = window.confirm('Are you sure you want to save this recipe?');
        if (!confirmSave) return;

        try {
            const recipeSnap = await get(ref(db, `recipes/${recipeId}`));
            if (!recipeSnap.exists()) {
                alert('Recipe not found.');
                return;
            }

            const recipeData = recipeSnap.val();
            const userRecipesRef = ref(db, `users/${user.uid}/recipes`);
            const newRef = push(userRecipesRef);
            await set(newRef, recipeData);

            alert('Recipe saved to your list!');
            navigate('/userRecipes');
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Failed to save recipe.');
        }
    };

    if (loading) return <p>Loading recipes...</p>;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Recipes
            </Typography>

            {recipes.length === 0 ? (
                <Typography variant="body1" align="center">
                    No recipes found.
                </Typography>
            ) : (
                <Box display="flex" justifyContent="center" sx={{ width: '100%' }}>
                    <Grid container spacing={2} justifyContent="flex-start" sx={{ width: '100%' }}>
                        {recipes.map((recipe) => {
                            const alreadySaved = userRecipes.includes(recipe.name?.toLowerCase());

                            return (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    lg={2}
                                    xl={2}
                                    key={recipe.id}
                                >
                                    <Card
                                        sx={{
                                            height: 280,
                                            width: 280,
                                            display: 'flex',
                                            flexDirection: 'column',
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
                                                height: 140,
                                                width: '100%',
                                            }}
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography gutterBottom variant="h6" component="div" noWrap>
                                                {recipe.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {recipe.ingredients?.length || 0} ingredients
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                                            <Button size="small" component={RouterLink} to={`/recipes/${recipe.id}`}>
                                                View
                                            </Button>
                                            {user && (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color={alreadySaved ? 'inherit' : 'success'}
                                                    onClick={() => handleSave(recipe.id)}
                                                    disabled={alreadySaved}
                                                >
                                                    {alreadySaved ? 'Saved' : 'Save'}
                                                </Button>
                                            )}
                                        </CardActions>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>


            )}
            <Grid container justifyContent="center" spacing={2} sx={{ mt: 4 }}>
                <Grid item>
                    <Button
                        component={RouterLink}
                        to="/createRecipe"
                        variant="contained"
                        color="primary"
                    >
                        + Create New Recipe
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        component={RouterLink}
                        to="/"
                        variant="outlined"
                        color="secondary"
                    >
                        Back
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}

