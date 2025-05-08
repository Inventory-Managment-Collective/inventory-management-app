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

import UserRecipeListItem from '../components/UserRecipeListItem';

import IosShareIcon from '@mui/icons-material/IosShare';
import DeleteIcon from '@mui/icons-material/Delete';
//This functions very similarly to Recipes except no like button, save is replaced with share
//and the user can delete a recipe or view recipe if they choose so.

const categories = ["All", "Baking", "Pasta", "Vegetarian"];
import { toast } from 'react-toastify';

export default function UserRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sharedRecipes, setSharedRecipes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");

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
                toast.success("Recipe deleted successfully!")
            } catch (error) {
                console.error('Error deleting recipe:', error);
                toast.error('Failed to delete recipe.');
            }
        };
        //fucntionality so that the user can delete a recipe from their list, functions the same as delete in ingredeints 
        //but uses the path to a particular recipe instead of an ingredient

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name?.toLowerCase().startsWith(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });


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
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        {categories.map(category => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "contained" : "outlined"}
                                color="primary"
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </Button>
                        ))}
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
                        <Grid container spacing={1.5}>
                            {filteredRecipes.map((recipe) => (
                                <UserRecipeListItem
                                    key={recipe.id}
                                    recipe={recipe}
                                    handleDelete={handleDelete}
                                />
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
