import React, { useEffect, useState } from 'react';
import { ref, get, remove, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
//Imports for all the stuff we need for the page, useEffect and useState hooks,
//ref, get, push and set firebase databse for communicating with teh RTDB
//Link for navigation aswell as useNavigate and get Auth and AuthStateChange methods to
//keep track of the currently logged in user.

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

import FavoriteIcon from '@mui/icons-material/Favorite';

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [userRecipes, setUserRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();
    const auth = getAuth();
    //Initialisation of state and auth set up, recipes fro the global recipes,
    //userRecipes for the recipes the user already has in their account, loading
    //to indicate if the data is still being fethced and user for the current user


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
    //fetches recipes similar to the above but this time for user specific recipes. Only takes in
    //the names of the saved recipes, stored in userRecipes, so that we can keep track of which recipes
    //the user has already saved. 

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
    //Functionality that allows the user to save a global recipe to their own personal recipe list.
    //fetches the particular recipes data from the recipes node with get. stores the info for that recipe
    //in recipe data. contructs the path to the users recipe node in userRecipesRef. newRef generates a fresh id 
    //so the saved recipe won't overwrite anything and then uses set to write recipeData to the specified newRef path

    const handleLike = async (recipeId) => {
        if (!user) {
            alert('You must be logged in to like a recipe.');
            return;
        }

        try {
            const recipeRef = ref(db, `recipes/${recipeId}`);
            const snapshot = await get(recipeRef);

            if (!snapshot.exists()) {
                alert('Recipe not found.');
                return;
            }

            const recipeData = snapshot.val();
            const likedBy = recipeData.likedBy || {};

            if (likedBy[user.uid]) {
                alert('You have already liked this recipe.');
                return;
            }

            const updatedLikes = (recipeData.likes || 0) + 1;

            await set(recipeRef, {
                ...recipeData,
                likes: updatedLikes,
                likedBy: {
                    ...likedBy,
                    [user.uid]: true
                }
            });

            setRecipes(prev =>
                prev.map(recipe =>
                    recipe.id === recipeId
                        ? { ...recipe, likes: updatedLikes, likedBy: { ...likedBy, [user.uid]: true } }
                        : recipe
                )
            );

            alert('Recipe liked!');
        } catch (error) {
            console.error('Error liking recipe:', error);
            alert('Failed to like recipe.');
        }
    };
    //Functionality for the like button. Generates a reference to the specific recipe stored in recipeRef.
    //Fetches that recipes data with get, stores it in snapshot. extracts the recipe data with .val(). in particular, 
    //stores the liked by object to retrieve who has already liked the recipe, empty if likedBy doesn't exist. checks if the user's
    //id features in liked by, wont' progress if so. calulates the new likes value and stores it in updatedLikes. updates the recipe
    //with the new likes and likeBy values with set(). updates the recipes state to reflect the changes, iterates over the array with .map().
    //If the id matches the liked recipe, we update its likes and likedBy.




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
                            const alreadyLiked = recipe.likedBy?.[user.uid];

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
                                                <>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color={alreadySaved ? 'inherit' : 'success'}
                                                        onClick={() => handleSave(recipe.id)}
                                                        disabled={alreadySaved}
                                                    >
                                                        {alreadySaved ? 'Saved' : 'Save'}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleLike(recipe.id)}
                                                        disabled={alreadyLiked}
                                                        sx={{
                                                            color: alreadyLiked ? 'gray' : 'blue',
                                                            cursor: alreadyLiked ? 'not-allowed' : 'pointer',
                                                            opacity: alreadyLiked ? 0.5 : 1,
                                                        }}
                                                    >
                                                        <FavoriteIcon sx={{ fontSize: 20, mr: 1 }} />
                                                        {alreadyLiked ? 'Liked' : 'Like'}
                                                    </Button>
                                                </>
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

