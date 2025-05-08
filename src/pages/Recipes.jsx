import React, { useEffect, useState } from 'react';
import { ref, get, remove, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import QuarterMasterToast from '../components/QuarterMasterToast';
import Comments from '../components/Comments';
import RecipeListItem from '../components/RecipeListItem';

import {
    Container,
    TextField,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
} from '@mui/material';

//Imports for all the stuff we need for the page, useEffect and useState hooks,
//ref, get, push and set firebase databse for communicating with teh RTDB
//Link for navigation aswell as useNavigate and get Auth and AuthStateChange methods to
//keep track of the currently logged in user.

const categories = ["All", "Baking", "Pasta", "Vegetarian"];

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [userRecipes, setUserRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("All");


    const navigate = useNavigate();
    const auth = getAuth();
    //Initialisation of state and auth set up, recipes fro the global recipes,
    //userRecipes for the recipes the user already has in their account, loading
    //to indicate if the data is still being fethced, user for the current user
    //and searchTerm for the content of the search box


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });

        return () => unsubscribe();
    }, []);
    //onAuthStateChange keep track of changes in authentication. When a user logs in,
    //firebaseUser will be populated and user will be set to it. WHen the user logs out, 
    //user becomes null

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
    //retrieves all the global recipes, located in the /recipes node, using firebase get method. 
    //Uses Object.entries() to convert the data from an object to an array and sets the defaults 
    //for likes and likedBy to 0 and an empty object. Likes will keep track of how many times  
    //a recipes has been liked and likedBy will be used to prevent users from liking things multiple times.

    useEffect(() => {
        if (!user) return;

        const fetchUserRecipes = async () => {
            try {
                const snapshot = await get(ref(db, `users/${user.uid}/recipes`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const savedIds = Object.values(data).map(recipe => recipe.id);
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
    //fetches recipes similar to the above but this time for user specific recipes. Only takes in
    //the names of the saved recipes, stored in userRecipes, so that we can keep track of which recipes
    //the user has already saved. 

    const handleLike = async (recipeId) => {
        if (!user) {
            toast(<QuarterMasterToast message='You must be logged in to like a recipe'/>)
            return;
        }

        try {
            const recipeRef = ref(db, `recipes/${recipeId}`);
            const snapshot = await get(recipeRef);

            if (!snapshot.exists()) {
                toast(<QuarterMasterToast message='Recipe not found.'/>)
                return;
            }

            const recipeData = snapshot.val();
            const likedBy = recipeData.likedBy || {};
            const hasLiked = likedBy[user.uid];

            const updatedLikes = hasLiked
                ? (recipeData.likes || 0) - 1
                : (recipeData.likes || 0) + 1;

            const updatedLikedBy = { ...likedBy };
            if (hasLiked) {
                delete updatedLikedBy[user.uid];
            } else {
                updatedLikedBy[user.uid] = true;
            }

            await set(recipeRef, {
                ...recipeData,
                likes: updatedLikes,
                likedBy: updatedLikedBy,
            });

            setRecipes(prev =>
                prev.map(recipe =>
                    recipe.id === recipeId
                        ? { ...recipe, likes: updatedLikes, likedBy: updatedLikedBy }
                        : recipe
                )
            );

        } catch (error) {
            console.error('Error toggling like:', error);
            toast(<QuarterMasterToast message='Failed to update liked status.'/>)
        }
    };

    //Functionality for the like button. Generates a reference to the specific recipe stored in recipeRef.
    //Fetches that recipes data with get, stores it in snapshot. extracts the recipe data with .val(). in particular, 
    //stores the liked by object to retrieve who has already liked the recipe, empty if likedBy doesn't exist. checks if the user's
    //id features in liked by, wont' progress if so. calulates the new likes value and stores it in updatedLikes. updates the recipe
    //with the new likes and likeBy values with set(). updates the recipes state to reflect the changes, iterates over the array with .map().
    //If the id matches the liked recipe, we update its likes and likedBy.

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name?.toLowerCase().startsWith(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    //functionality to filter the recipe results displayed to the user based on the content of the "Search Recipes"
    //text field. optional chaining operator (? after recipe.name) protects against the possbility of accessing a 
    //recipe without a name



    if (loading) return <p>Loading recipes...</p>;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Recipes
            </Typography>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <TextField
                    label="Search Recipes"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: '300px' }}
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

            {recipes.length === 0 ? (
                <Typography variant="body1" align="center">
                    No recipes found.
                </Typography>
            ) : (
                <Box display="flex" justifyContent="center" sx={{ width: '100%' }}>
                    <Grid container spacing={1.5} justifyContent="flex-start" sx={{ width: '100%' }}>
                        {filteredRecipes.map((recipe) => {

                            return (
                                <RecipeListItem 
                                    key={recipe.id} 
                                    recipe={recipe}
                                    handleLike={handleLike}
                                    alreadyLiked={recipe.likedBy?.[user?.uid]} 
                                />
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