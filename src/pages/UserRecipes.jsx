import React, { useEffect, useState } from 'react';
import { ref, get, child, push, remove, set } from 'firebase/database';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    Button,
    TextField,
    Box,
    Container,
    Typography,
    Grid,
    CardMedia,
    Card,
} from '@mui/material';

import IosShareIcon from '@mui/icons-material/IosShare';
import DeleteIcon from '@mui/icons-material/Delete';
//This functions very similarly to Recipes except no like button, save is replaced with share
//and the user can delete a recipe or view recipe if they choose so.


export default function UserRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sharedRecipes, setSharedRecipes] = useState([]);

    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
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

    useEffect(() => {
        if (!user) return;

        const fetchRecipes = async () => {
            try {
                const dbRef = ref(db);
                const snapshot = await get(child(dbRef, `users/${user.uid}/recipes`));

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
    }, [user]);
    //fetches the list of recieps, similar to Recipes, but this time it pointed to the list of recipes associated 
    //with the current user, goes to `users/${user.uid}/recipes` instead of just 'recipes' and child is used to construct a
    //relative path from dbRef, the path to the root of the database.


    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this recipe?');
        if (!confirmDelete) return;

        try {
            await remove(ref(db, `users/${user.uid}/recipes/${id}`));
            setRecipes(prev => prev.filter(recipe => recipe.id !== id));
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('Failed to delete recipe.');
        }
    };
    //fucntionality so that the user can delete a recipe from their list, functions the same as delete in ingredeints 
    //but uses the path to a particular recipe instead of an ingredient

    const handleShare = async (recipeId) => {
        try {
            const globalRecipesRef = ref(db, 'recipes');

            const isShared = sharedRecipes.includes(recipeId);

            if (isShared) {
                await remove(ref(db, `recipes/${recipeId}`));
                setSharedRecipes(prev => prev.filter(id => id !== recipeId));
                alert('Recipe unshared successfully!');
            } else {
                const userRecipeSnap = await get(ref(db, `users/${user.uid}/recipes/${recipeId}`));

                if (!userRecipeSnap.exists()) {
                    alert('Recipe not found.');
                    return;
                }

                const recipeData = userRecipeSnap.val();
                await set(ref(db, `recipes/${recipeId}`), recipeData);

                setSharedRecipes(prev => [...prev, recipeId]);
                alert('Recipe shared successfully!');
            }

        } catch (error) {
            console.error('Error sharing/unsharing recipe:', error);
            alert('Failed to share/unshare recipe.');
        }
    };

    //functionality for the user to share a recipe. functions very similarly to handleSave but the paths for get and 
    //push are swapped around.

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name?.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    if (loading) return <Typography variant="h6" align="center">Loading recipes...</Typography>;

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" gutterBottom align="center">
                Your Recipes
            </Typography>

            {user ? (
                <>
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                        <TextField
                            label="Search Recipes"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: '100%', maxWidth: 400 }}
                        />
                    </Box>

                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Button
                            component={Link}
                            to="/createRecipe"
                            variant="contained"
                            color="primary"
                        >
                            + Add New Recipe
                        </Button>
                    </Box>

                    {filteredRecipes.length === 0 ? (
                        <Typography align="center">No recipes found.</Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredRecipes.map((recipe) => (
                                <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                                    <Card
                                        sx={{
                                            height: 390,
                                            width: 380,
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
                                                    paddingX:2,
                                                    paddingY: 1,
                                                    '&:hover': {
                                                            backgroundColor:'primary.main',
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
                                                        paddingX:2,
                                                        paddingY: 1,
                                                        '&:hover': {
                                                            backgroundColor:'lightpink',
                                                            borderColor: 'lightpink',
                                                            color: 'white',
                                                        },
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 18, mr: 1, transform: 'translateY(-1px)' }} />
                                                    Delete
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color={sharedRecipes.includes(recipe.id) ? "secondary" : "success"}
                                                    onClick={() => handleShare(recipe.id)}
                                                    size="small"
                                                    sx={{
                                                        paddingX:  sharedRecipes.includes(recipe.id) ? 1.5 : 2.5,
                                                        backgroundColor: sharedRecipes.includes(recipe.id) ? 'secondary.dark' : 'secondary.main',
                                                        '&:hover': {
                                                            backgroundColor: sharedRecipes.includes(recipe.id) ? 'secondary.main' : 'secondary.dark',
                                                        },
                                                    }}
                                                >
                                                    <IosShareIcon sx={{ fontSize: 18, mr: 1, transform: 'translateY(-1px)' }} />
                                                    {sharedRecipes.includes(recipe.id) ? 'Unshare' : 'Share'}
                                                </Button>

                                            </Box>
                                        </Box>

                                    </Card>

                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            ) : (
                <Box textAlign="center">
                    <Typography variant="h6" gutterBottom>
                        You must be logged in to view your recipes.
                    </Typography>
                    <Button component={Link} to="/logIn" variant="contained" sx={{ m: 1 }}>
                        Log In
                    </Button>
                    <Button component={Link} to="/signUp" variant="outlined" sx={{ m: 1 }}>
                        Sign Up
                    </Button>
                </Box>
            )}
        </Container>
    );
}
