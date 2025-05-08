import React, { useEffect, useState } from 'react';
import { ref, get, remove, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import QuarterMasterToast from './QuarterMasterToast';
import Comments from '../components/Comments';

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

import FavoriteIcon from '@mui/icons-material/Favorite';
import ArchiveIcon from '@mui/icons-material/Archive';

export default function RecipeListItem({ recipe, handleLike, alreadyLiked }) {
    const [user, setUser] = useState(null);
    const [userRecipes, setUserRecipes] = useState([]);


    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchUserRecipes = async () => {
            try {
                const snapshot = await get(ref(db, `users/${user.uid}/recipes`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const savedIds = Object.values(data).map(recipe => recipe.id);
                    setUserRecipes(savedIds);
                }
            } catch (error) {
                console.error("Error fetching user recipes:", error);
            }
        };

        fetchUserRecipes();
    }, [user]);

    const alreadySaved = userRecipes.includes(recipe.id);

    const handleSave = async (recipeId) => {
            if (!user) {
                toast(<QuarterMasterToast message={'You must be logged in to save a recipe.'}/>)
                return;
            }
    
            try {
                const userRecipesRef = ref(db, `users/${user.uid}/recipes`);
                const snapshot = await get(userRecipesRef);
    
                const recipe = snapshot.val();
                let savedRecipeKey = null;
    
                if (snapshot.exists()) {
                    const userRecipesData = snapshot.val();
                    savedRecipeKey = Object.keys(userRecipesData).find(
                        key => userRecipesData[key].id === recipeId
                    );
                }
    
                if (savedRecipeKey) {
                    // Remove the recipe
                    const recipeSnap = await get(ref(db, `recipes/${recipeId}`));
                    const recipeData = recipeSnap.val();
                    await remove(ref(db, `users/${user.uid}/recipes/${savedRecipeKey}`));
                    setUserRecipes(prev => prev.filter(id => id !== recipeId));
                    toast(<QuarterMasterToast message={`Removed ${recipeData.name} from your list`}/>)
                } else {
                    // Save the recipe
                    const recipeSnap = await get(ref(db, `recipes/${recipeId}`));
                    const recipeData = recipeSnap.val();
                    toast(<QuarterMasterToast message={`Saved ${recipeData.name} to your list`}/>)
                    if (!recipeSnap.exists()) {
                        toast(<QuarterMasterToast message='Recipe not found.'/>)
                        return;
                    }
    

    
                    const newRef = ref(db, `users/${user.uid}/recipes/${recipeId}`);
                    await set(newRef, { ...recipeData, id: recipeId, source: "global" });
    
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
                            to={`/recipes/${recipe.id}`}
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
    )
}