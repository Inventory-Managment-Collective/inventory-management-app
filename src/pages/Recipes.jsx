import React, { useEffect, useState } from 'react';
import { ref, get, remove, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
    CircularProgress,
    Box,
} from '@mui/material';

import FavoriteIcon from '@mui/icons-material/Favorite';
import ArchiveIcon from '@mui/icons-material/Archive';

//Imports for all the stuff we need for the page, useEffect and useState hooks,
//ref, get, push and set firebase databse for communicating with teh RTDB
//Link for navigation aswell as useNavigate and get Auth and AuthStateChange methods to
//keep track of the currently logged in user.



export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [userRecipes, setUserRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');


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

    const handleSave = async (recipeId) => {
        if (!user) {
            alert('You must be logged in to save a recipe.');
            return;
        }

        try {
            const userRecipesRef = ref(db, `users/${user.uid}/recipes`);
            const snapshot = await get(userRecipesRef);

            let savedRecipeKey = null;

            if (snapshot.exists()) {
                const userRecipesData = snapshot.val();
                savedRecipeKey = Object.keys(userRecipesData).find(
                    key => userRecipesData[key].id === recipeId
                );
            }

            if (savedRecipeKey) {
                // Remove the recipe
                await remove(ref(db, `users/${user.uid}/recipes/${savedRecipeKey}`));
                setUserRecipes(prev => prev.filter(id => id !== recipeId));
            } else {
                // Save the recipe
                const recipeSnap = await get(ref(db, `recipes/${recipeId}`));
                if (!recipeSnap.exists()) {
                    alert('Recipe not found.');
                    return;
                }

                const recipeData = recipeSnap.val();

                const newRef = ref(db, `users/${user.uid}/recipes/${recipeId}`);
                await set(newRef, { ...recipeData, id: recipeId });


                setUserRecipes(prev => [...prev, recipeId]);
            }

        } catch (error) {
            console.error('Error saving/removing recipe:', error);
        }
    };


    //Functionality that allows the user to save a global recipe to their own personal recipe list.
    //fetches the particular recipes data from the recipes node with get. It will then extract the data in snapshot with
    //.val() and will then sift through userRecipesDate with .find(). if a match is found for the id of the recipe the button is
    //tied to, then saveRecipeKey will be set to it's value, if not it remains as null. After this point, one of two things will happen.
    //if savedRecipeKey is not null then that means it the recipe already exists with in the users list and so it will remove it from the list allowing the 
    //button to act as an 'un save'. If savedRecipeKey is null then this is a fresh recipe so add it to the user's list

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
            alert('Failed to update like status.');
        }
    };

    //Functionality for the like button. Generates a reference to the specific recipe stored in recipeRef.
    //Fetches that recipes data with get, stores it in snapshot. extracts the recipe data with .val(). in particular, 
    //stores the liked by object to retrieve who has already liked the recipe, empty if likedBy doesn't exist. checks if the user's
    //id features in liked by, wont' progress if so. calulates the new likes value and stores it in updatedLikes. updates the recipe
    //with the new likes and likeBy values with set(). updates the recipes state to reflect the changes, iterates over the array with .map().
    //If the id matches the liked recipe, we update its likes and likedBy.


    const filteredRecipes = recipes.filter(recipe =>
        recipe.name?.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
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

            {recipes.length === 0 ? (
                <Typography variant="body1" align="center">
                    No recipes found.
                </Typography>
            ) : (
                <Box display="flex" justifyContent="center" sx={{ width: '100%' }}>
                    <Grid container spacing={1.5} justifyContent="flex-start" sx={{ width: '100%' }}>
                        {filteredRecipes.map((recipe) => {
                            const alreadySaved = userRecipes.includes(recipe.id);
                            const alreadyLiked = recipe.likedBy?.[user?.uid];

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
                                            width: {
                                                xs: 320,
                                                sm: 380,
                                            },
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            image={recipe.imageUrl}
                                            alt={recipe.name}
                                            sx={{
                                                objectFit: 'cover',
                                                objectPosition: 'center',
                                                height: {
                                                    xs: 100,
                                                    sm: 140,
                                                },
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
                                        <CardActions sx={{ px: 2, justifyContent: 'space-between', display: 'flex' }}>
                                            <Box>
                                                <Button
                                                    sx={{
                                                        paddingY: 1,
                                                    }}
                                                    component={RouterLink}
                                                    to={`/userRecipes/${recipe.id}`}
                                                    variant="outlined"
                                                    size="small"
                                                >
                                                    View
                                                </Button>
                                            </Box>

                                            {user && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color={alreadySaved ? 'secondary' : 'success'}
                                                        onClick={() => handleSave(recipe.id)}
                                                        sx={{
                                                            paddingX: alreadySaved ? 2 : 2.5,
                                                            paddingY: { xs: 1.2, sm: 1 },
                                                            backgroundColor: alreadySaved ? 'primary.dark' : 'primary.main',
                                                            '&:hover': {
                                                                backgroundColor: alreadySaved ? 'secondary.dark' : 'primary.dark',
                                                            },
                                                        }}
                                                    >
                                                        <ArchiveIcon sx={{ fontSize: 18, mr: { xs: 0, sm: 1 }, transform: 'translateY(-1px)' }} />
                                                        {alreadySaved ? (
                                                            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Saved</Box>
                                                        ) : (
                                                            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Save</Box>
                                                        )}
                                                    </Button>

                                                    <Button
                                                        size="small"
                                                        onClick={() => handleLike(recipe.id)}
                                                        sx={{
                                                            paddingX: alreadyLiked ? 2 : 2.5,
                                                            paddingY: { xs: 1.2, sm: 1 },
                                                            backgroundColor: alreadyLiked ? 'secondary.main' : 'transparent',
                                                            color: alreadyLiked ? 'white' : 'secondary.main',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                backgroundColor: alreadyLiked ? 'secondary.dark' : 'lightpink',
                                                                color: 'white'
                                                            },
                                                        }}
                                                    >
                                                        <FavoriteIcon sx={{ fontSize: 18, mr: { xs: 0, sm: 1 }, transform: 'translateY(-1px)' }} />
                                                        {alreadyLiked ? (
                                                            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Liked</Box>
                                                        ) : (
                                                            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Like</Box>
                                                        )}
                                                    </Button>

                                                    <Typography variant="body2" color='skyblue' border='1px solid skyblue' borderRadius={2} paddingX={1} paddingY={1}>
                                                        {recipe.likes || 0} Likes
                                                    </Typography>
                                                </Box>
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